// Build once: browsers receive one low-resolution coastline, not a GIS library.
const fs = require('node:fs');
const path = require('node:path');
const topojson = require('../assets/vendor/topojson-client.min.js');
const root = path.join(__dirname, '..');
const world = JSON.parse(fs.readFileSync(path.join(root, 'assets/maps/countries-110m.json')));
const geometry = topojson.merge(world, world.objects.countries.geometries);
const round = value => Array.isArray(value) ? value.map(round) : Number(value.toFixed(3));
function simplify(points, tolerance = .16) {
  if (points.length <= 2) return points;
  const a = points[0], b = points.at(-1), dx = b[0] - a[0], dy = b[1] - a[1];
  let furthest = -1, distance = tolerance * tolerance;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const t = dx || dy ? Math.max(0, Math.min(1, ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) : 0;
    const d = (p[0]-a[0]-t*dx)**2 + (p[1]-a[1]-t*dy)**2;
    if (d > distance) { distance = d; furthest = i; }
  }
  return furthest < 0 ? [a,b] : [...simplify(points.slice(0,furthest+1), tolerance).slice(0,-1), ...simplify(points.slice(furthest), tolerance)];
}
geometry.coordinates = round(geometry.coordinates.map(polygon => polygon.map(ring => {
  const reduced = simplify(ring);
  return reduced.length >= 4 ? reduced : ring;
})));
const result = {type: 'FeatureCollection', features: [{type: 'Feature', properties: {}, geometry}]};
const output = JSON.stringify(result);
fs.writeFileSync(path.join(root, 'assets/maps/land-natural.json'), output);
console.log(`Natural coastline: ${Buffer.byteLength(output)} bytes.`);

const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
borders.coordinates = round(borders.coordinates);
fs.writeFileSync(path.join(root, "assets/maps/country-borders.json"), JSON.stringify(borders));
