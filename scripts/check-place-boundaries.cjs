const assert = require('node:assert/strict');
const fs = require('node:fs');
const d3 = require('../assets/vendor/d3.v7.min.js');
const {prepareJourney} = require('../journey');
const {prepareTripRoutes} = require('../trip-routes');
const journey = require('../journey.json'), visits = require('../places.json');
const boundaries = require('../assets/maps/visited-boundaries.json');
const keys = new Set(boundaries.features.flatMap(f=>f.properties.place_keys));
const confirmed = [...prepareJourney(journey).places,...visits.filter(p=>['travel','visit'].includes(p.status))];
confirmed.forEach(p => assert.ok(keys.has(`${p.country}|${p.city}`), `Missing boundary: ${p.city}`));
boundaries.features.forEach(f=>{
  assert.ok(d3.geoArea(f) > 0 && d3.geoArea(f) < .1, `Inverted polygon: ${f.properties.place_keys}`);
  assert.ok(d3.geoCentroid(f).every(Number.isFinite));
});
assert.ok(fs.statSync('assets/maps/visited-boundaries.json').size < 150000);
const routes=prepareTripRoutes(journey,visits);
assert.ok(routes.length > 20);
assert.ok(routes.every(r=>r.place.status !== 'conference' && r.month));
const missing = {id:'unknown',status:'travel',month:'2016-05',coordinates:[100,0]};
assert.deepEqual(prepareTripRoutes(journey,[missing]),[], 'Do not invent a departure city for the unknown Korea stay');
assert.deepEqual(prepareTripRoutes(journey,[{...missing,month:undefined,year:2010}]),[], 'Year-only visits have no known monthly home');
const trip=prepareTripRoutes(journey,[{...missing,month:'2025-05'}])[0];
assert.equal(trip.home.city,'San Jose');
const projection=d3.geoOrthographic().scale(274), path=d3.geoPath(projection);
const land=require('../assets/maps/land-natural.json');
const start=performance.now();
for(let i=0;i<100;i++){projection.rotate([i*3,-25]);path(land);path(boundaries);}
console.log(`${keys.size} boundaries cover all confirmed places; ${routes.length} dated travel links. Coast + boundaries average ${((performance.now()-start)/100).toFixed(1)} ms/frame.`);
