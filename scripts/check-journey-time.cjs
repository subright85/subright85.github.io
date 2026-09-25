const assert = require('node:assert/strict');
const {journeyAtMonth} = require('../journey.js');
const journey = require('../journey.json');
for (const [month, city] of [['1985-01', 'Incheon'], ['2003-12', 'Incheon'], ['2004-01', 'Pohang'], ['2010-01', 'Pohang'], ['2010-09', 'Beijing'], ['2011-05', 'Beijing'], ['2011-06', 'Seattle / Redmond'], ['2011-09', 'Pohang'], ['2015-08', 'San Jose'], ['2016-03', 'Korea (city to add)'], ['2016-07', 'San Jose']]) {
  const state = journeyAtMonth(journey, month);
  assert.equal(journey.locations[state.active.location].city, city, month);
  assert(state.visited.has(state.active.location));
}
const beijing = journeyAtMonth(journey, '2010-09');
assert(![...beijing.visited].some(id => journey.locations[id].city === 'San Jose'));
assert.equal(beijing.moveIds.size, 2);
assert.equal(journeyAtMonth(journey, '2026-09').moveIds.size, 7);
assert.equal(journeyAtMonth(journey, '2016-03').active.approximate, true);
const unknown = {locations: {}, stops: [
  {id: 'a', location: 'a', arrived: null, departed: null},
  {id: 'b', location: 'b', arrived: '2020-01', departed: '2020-02'},
  {id: 'c', location: 'c', arrived: '2021-01', departed: null, current: true}
]};
assert.equal(journeyAtMonth(unknown, '2020-06').active, undefined);
assert.deepEqual([...journeyAtMonth(unknown, '2020-06').visited], ['a', 'b']);
console.log('Journey time checks passed: inclusive month boundaries, return visits, missing dates, gaps, and future routes.');
