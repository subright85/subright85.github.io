const assert = require('node:assert/strict');
const fs = require('node:fs');
const d3 = require('../assets/vendor/d3.v7.min.js');
const {prepareJourney} = require('../journey');
const {prepareTripRoutes} = require('../trip-routes');
const journey = require('./fixtures/journey.cjs');
const confirmed = require('../visited-places.json');
const boundaries = require('../assets/maps/visited-boundaries.json');
const keys = new Set(boundaries.features.flatMap(f=>f.properties.place_keys));
confirmed.forEach(p => assert.ok(keys.has(`${p.country}|${p.city}`), `Missing boundary: ${p.city}`));
boundaries.features.forEach(f=>{
  assert.ok(d3.geoArea(f) > 0 && d3.geoArea(f) < .1, `Inverted polygon: ${f.properties.place_keys}`);
  assert.ok(d3.geoCentroid(f).every(Number.isFinite));
});
assert.ok(fs.statSync('assets/maps/visited-boundaries.json').size < 150000);
const missing = {id:'unknown',status:'travel',month:'2006-05',coordinates:[100,0]};
assert.deepEqual(prepareTripRoutes(journey,[missing]),[], 'Unknown departure city must not create a route');
assert.deepEqual(prepareTripRoutes(journey,[{...missing,month:undefined,year:2002}]),[], 'Year-only visits have no known monthly home');
const trip=prepareTripRoutes(journey,[{...missing,month:'2007-05'}])[0];
assert.equal(trip.home.city,'Example B');
const projection=d3.geoOrthographic().scale(274), path=d3.geoPath(projection);
const land=require('../assets/maps/land-natural.json');
const start=performance.now();
for(let i=0;i<100;i++){projection.rotate([i*3,-25]);path(land);path(boundaries);}
console.log(`${keys.size} boundaries cover all confirmed places. Coast + boundaries average ${((performance.now()-start)/100).toFixed(1)} ms/frame.`);
