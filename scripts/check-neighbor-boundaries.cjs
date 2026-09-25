const assert=require('node:assert/strict');
const fs=require('node:fs');
const d3=require('../assets/vendor/d3.v7.min.js');
const topojson=require('../assets/vendor/topojson-client.min.js');
const regions=require('../assets/maps/neighbor-index.json');
const selections=require('../data/boundary-selections.json');
const overview=require('../assets/maps/visited-boundaries.json');
assert.equal(regions.length,selections.length,'Every confirmed place needs its regional extract');
let count=0,total=0,max=0;
for(const region of regions){
  const file=`assets/maps/neighbors/${region.slug}.json`;
  const bytes=fs.statSync(file).size;
  const topology=JSON.parse(fs.readFileSync(file));
  assert.equal(topology.type,'Topology');
  const features=topojson.feature(topology,topology.objects.regions).features;
  if(topology.objects.coast) {
    const coast=topojson.feature(topology,topology.objects.coast);
    assert.ok(d3.geoArea(coast)>0 && d3.geoArea(coast)<1, `Invalid local land mask: ${region.slug}`);
    assert.ok(topology.objects.coverage);
  }
  assert.equal(features.length,region.features);
  assert.ok(features.length>0);
  assert.ok(bytes<900000,`${region.slug} regional payload is too large`);
  for(const f of features){
    const area=d3.geoArea(f);
    assert.ok(area>0 && area<1,`Wrong winding/empty geometry: ${region.slug} ${f.id}`);
    assert.ok(d3.geoCentroid(f).every(Number.isFinite));
    assert.ok(Array.isArray(f.properties.place_keys));
    const selected=selections.find(s=>s.sources.some(source=>`relation/${source.osm_id}`===f.id));
    if(f.id==='census/3240000') assert.deepEqual(f.properties.place_keys,['USA|Las Vegas, NV']);
    else if(f.properties.place_keys.length) assert.deepEqual(f.properties.place_keys,selected?.place_keys,'Visited color must be an exact source-ID match');
  }
  const source=selections.find(s=>s.place_keys[0]===region.place_keys[0]);
  if(region.slug==='las-vegas') assert.ok(features.some(f=>f.id==='census/3240000'));
  else for(const selected of source.sources.filter(s=>s.osm_id))assert.ok(features.some(f=>f.id===`relation/${selected.osm_id}`),`Missing matched city ${region.slug}`);
  assert.ok(overview.features.some(f=>f.properties.region===region.slug));
  count+=features.length;total+=bytes;max=Math.max(max,bytes);
}
const sj=JSON.parse(fs.readFileSync('assets/maps/neighbors/san-jose.json'));
const sjFeatures=topojson.feature(sj,sj.objects.regions).features;
assert.ok(sjFeatures.some(f=>f.properties.name==='Santa Clara'));
assert.ok(sjFeatures.some(f=>f.properties.name==='San Jose' && f.properties.place_keys.includes('USA|San Jose')));
assert.ok(!sjFeatures.find(f=>f.properties.name==='Santa Clara').properties.place_keys.length);
const projection=d3.geoOrthographic().rotate([121.9,-37.3]).scale(43000),path=d3.geoPath(projection);
const start=performance.now();for(let i=0;i<30;i++){projection.rotate([121.9+i*.001,-37.3]);path({type:'FeatureCollection',features:sjFeatures});}
console.log(`${regions.length} local extracts; ${count} boundaries. Largest optional region ${Math.round(max/1024)} KB; all extracts ${Math.round(total/1024)} KB. San Jose local paths ${((performance.now()-start)/30).toFixed(1)} ms/frame.`);

const mendocino=JSON.parse(fs.readFileSync('assets/maps/neighbors/mendocino-census.json'));
const localLand=topojson.feature(mendocino,mendocino.objects.coast);
assert.ok(d3.geoContains(localLand,[-123.795,39.308]),'Town center should be on land');
assert.ok(!d3.geoContains(localLand,[-123.815,39.31]),'Pacific should stay water');
