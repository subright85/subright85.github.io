// Offline only: reviewed OSM / Census selections, cached and simplified at source.
const fs = require('node:fs');
const path = require('node:path');
const d3 = require('../assets/vendor/d3.v7.min.js');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const selections = read('data/boundary-selections.json');
const features = selections.map(selection => {
  const polygons = selection.sources.flatMap(source => {
    const cache = read(`data/boundary-cache/${source.cache}.json`);
    const geometry = cache.features ? cache.features[source.index].geometry : cache[source.index].geojson;
    if (!['Polygon','MultiPolygon'].includes(geometry.type)) throw new Error(`Not a boundary: ${source.cache}`);
    return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  }).map(polygon => {
    const rounded = polygon.map(ring => ring.map(point => point.map(n => +n.toFixed(4))));
    // D3 expects the opposite winding to RFC 7946 for small geographic polygons.
    if (d3.geoArea({type:'Polygon',coordinates:rounded}) > 2 * Math.PI) rounded.forEach(ring => ring.reverse());
    return rounded;
  });
  return {type:'Feature',properties:{place_keys:selection.place_keys,kind:selection.kind,region:selection.sources[0].cache},geometry:{type:'MultiPolygon',coordinates:polygons}};
});
const output = JSON.stringify({type:'FeatureCollection',features});
fs.writeFileSync(path.join(root,'assets/maps/visited-boundaries.json'),output+'\n');
console.log(`Built ${features.length} place boundaries (${Math.round(output.length/1024)} KB).`);
