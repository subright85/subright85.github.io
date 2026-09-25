// Offline build. Dependencies are developer tools only; see data/BOUNDARIES.md.
const fs=require('node:fs');
const path=require('node:path');
const osm=require('osmtogeojson');
const {topology}=require('topojson-server');
const {presimplify,simplify}=require('topojson-simplify');
const topojson=require('../assets/vendor/topojson-client.min.js');
const d3=require('../assets/vendor/d3.v7.min.js');
const root=path.resolve(__dirname,'..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file)));
const selections=read('data/boundary-selections.json');
const visited=read('assets/maps/visited-boundaries.json');
const regions=read('data/neighbor-regions.json');
const byOsmId=new Map();
selections.forEach(s=>s.sources.forEach(source=>{if(source.osm_id)byOsmId.set(`relation/${source.osm_id}`,s);}));
const target=path.join(root,'assets/maps/neighbors');fs.mkdirSync(target,{recursive:true});
const index=[];
for(const region of regions){
  let data;
  try { data=region.slug==='las-vegas'?{elements:[],census:true}:read(`data/neighbor-cache/${region.slug}.json`); } catch (error) { if (process.argv.includes('--partial')) continue; throw error; }
  if((!data.elements?.length && !data.census) || data.remark)throw new Error(`Incomplete extract: ${region.slug}`);
  let features=osm(data).features.filter(f=>f.id.startsWith('relation/') && ['Polygon','MultiPolygon'].includes(f.geometry.type));
  // Keep only municipal-level contexts in the US; OSM census areas may be absent.
  if(region.place_keys[0].startsWith('USA|'))features=features.filter(f=>f.properties.admin_level==='8'||byOsmId.has(f.id));
  features=features.map(f=>({type:'Feature',id:f.id,properties:{name:f.properties['name:en']||f.properties.name,admin_level:f.properties.admin_level||null,place_keys:byOsmId.get(f.id)?.place_keys||[]},geometry:f.geometry}));
  if(['maui','honolulu','kauai','hawaii-island'].includes(region.slug)) {
    // Hawaii's settlements mostly are Census places, not incorporated cities.
    const census=read('data/hawaii-census-places.json');
    const [south,west,north,east]=region.bbox;
    for(const f of census.features) {
      const points=f.geometry.coordinates.flat(f.geometry.type==='Polygon'?1:2);
      const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
      if(Math.max(...xs)<west || Math.min(...xs)>east || Math.max(...ys)<south || Math.min(...ys)>north)continue;
      if(f.properties.NAME==='Urban Honolulu CDP')continue; // reviewed OSM city outline already present
      features.push({type:'Feature',id:`census/${f.properties.GEOID}`,properties:{name:f.properties.NAME.replace(/ CDP$/,''),source:'US Census',place_keys:[]},geometry:f.geometry});
    }
  }
  if(region.slug==='las-vegas') {
    const [south,west,north,east]=region.bbox;
    features=read('data/nevada-census-cities.json').features.filter(f=>{
      const points=f.geometry.coordinates.flat(f.geometry.type==='Polygon'?1:2);
      const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
      return Math.max(...xs)>=west && Math.min(...xs)<=east && Math.max(...ys)>=south && Math.min(...ys)<=north;
    }).map(f=>({type:'Feature',id:`census/${f.properties.GEOID}`,properties:{name:f.properties.NAME.replace(/ city$/,''),source:'US Census',place_keys:f.properties.GEOID==='3240000'?['USA|Las Vegas, NV']:[]},geometry:f.geometry}));
  }
  // Shared arcs are simplified together: adjacent borders stay coincident.
  const topologyData=topology({regions:{type:'FeatureCollection',features}},1e6);
  const reduced=topojson.feature(simplify(presimplify(topologyData),.00000015), 'regions');
  reduced.features.forEach(f=>{
    const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
    polygons.forEach(polygon=>{
      polygon.forEach(ring=>ring.forEach(point=>{point[0]=+point[0].toFixed(5);point[1]=+point[1].toFixed(5);}));
      if(d3.geoArea({type:'Polygon',coordinates:polygon})>2*Math.PI)polygon.forEach(r=>r.reverse());
    });
    if(!(d3.geoArea(f)>0 && d3.geoArea(f)<1))throw new Error(`Invalid shape ${region.slug} ${f.id}`);
  });
  const localKeys=new Set(region.place_keys);
  const matching=visited.features.find(f=>f.properties.place_keys.some(k=>region.place_keys.includes(k)));
  matching.properties.region=region.slug;
  const objects={regions:reduced};
  const coastFile=path.join(root,`data/regional-coasts/${region.slug}.json`);
  if(fs.existsSync(coastFile)) {
    const coast=JSON.parse(fs.readFileSync(coastFile));
    coast.features.forEach(f=>{
      const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
      polygons.forEach(polygon=>{if(d3.geoArea({type:'Polygon',coordinates:polygon})>2*Math.PI)polygon.forEach(r=>r.reverse());});
      // Sub-pixel slivers can collapse when quantized and invert a spherical ring.
      f.geometry={type:'MultiPolygon',coordinates:polygons.filter(polygon=>d3.geoArea({type:'Polygon',coordinates:polygon})>1e-11)};
    });
    const [s,w,n,e]=region.bbox;
    objects.coast=coast;
    objects.coverage={type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[w,s],[w,n],[e,n],[e,s],[w,s]]]}};
  }
  const output=JSON.stringify(topology(objects,1e5));
  fs.writeFileSync(path.join(target,`${region.slug}.json`),output+'\n');
  index.push({slug:region.slug,place_keys:region.place_keys,bbox:region.bbox,features:reduced.features.length,source_snapshot:data.osm3s?.timestamp_osm_base,bytes:Buffer.byteLength(output)});
  console.log(region.slug,reduced.features.length,Math.round(output.length/1024)+' KB');
}
// Keep the initial global layer small; exact outlines replace it only at city zoom.
fs.writeFileSync(path.join(root,'assets/maps/neighbor-index.json'),JSON.stringify(index)+'\n');
// Region references are tiny; the global overview still uses its original simplified shapes.
fs.writeFileSync(path.join(root,'assets/maps/visited-boundaries.json'),JSON.stringify(visited)+'\n');
