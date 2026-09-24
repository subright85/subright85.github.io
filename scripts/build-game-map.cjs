// Bake a coarse land grid once; the browser only projects the resulting shapes.
const fs = require('node:fs');
const path = require('node:path');
const d3 = require('../assets/vendor/d3.v7.min.js');
const topojson = require('../assets/vendor/topojson-client.min.js');
const root = path.join(__dirname, '..');
const world = JSON.parse(fs.readFileSync(path.join(root, 'assets/maps/countries-110m.json')));
const land = topojson.merge(world, world.objects.countries.geometries);
const groups = new Map();
const step = 6;
for (let lat = -90; lat < 90; lat += step) {
  for (let lon = -180; lon < 180; lon += step) {
    const center = [lon + step / 2, lat + step / 2];
    if (!d3.geoContains(land, center)) continue;
    const [x, y] = center;
    let terrain = Math.abs(y) > 66 ? 'polar' : Math.abs(y) > 48 ? 'north' : Math.abs(y) < 20 ? 'tropical' : 'green';
    if ((y > 12 && y < 35 && x > -18 && x < 62) || (y < -18 && y > -36 && x > 112 && x < 150)) terrain = 'sand';
    if (!groups.has(terrain)) groups.set(terrain, []);
    const ring = [[lon, lat], [lon, lat + step], [lon + step, lat + step], [lon + step, lat], [lon, lat]];
    // D3 uses clockwise spherical polygons for their smaller interior.
    if (d3.geoArea({type: 'Polygon', coordinates: [ring]}) > 2 * Math.PI) ring.reverse();
    groups.get(terrain).push([ring]);
  }
}
const map = {type: 'FeatureCollection', features: [...groups].map(([terrain, coordinates]) => ({type: 'Feature', properties: {terrain}, geometry: {type: 'MultiPolygon', coordinates}}))};
fs.writeFileSync(path.join(root, 'assets/maps/land-game.json'), JSON.stringify(map));
console.log(`Built ${map.features.length} land layers from ${[...groups.values()].reduce((n, cells) => n + cells.length, 0)} coarse cells.`);
