const assert = require('node:assert/strict');
const {journeyAtMonth} = require('../journey.js');
const journey = require('./fixtures/journey.cjs');
for (const [month, location] of [['2001-01', 'a'], ['2003-12', 'a'], ['2004-01', 'b'], ['2004-05', 'b'], ['2004-06', 'a'], ['2006-03', 'unknown'], ['2006-07', 'b']]) {
  const state = journeyAtMonth(journey, month);
  assert.equal(state.active.location, location, month);
  assert(state.visited.has(location));
}
assert.equal(journeyAtMonth(journey, '2004-01').moveIds.size, 1);
assert.equal(journeyAtMonth(journey, '2006-07').moveIds.size, 4);
assert.equal(journeyAtMonth(journey, '2006-03').active.approximate, true);
const unknown = {locations: {}, stops: [
  {id: 'a', location: 'a', arrived: null, departed: null},
  {id: 'b', location: 'b', arrived: '2020-01', departed: '2020-02'},
  {id: 'c', location: 'c', arrived: '2021-01', departed: null, current: true}
]};
assert.equal(journeyAtMonth(unknown, '2020-06').active, undefined);
assert.deepEqual([...journeyAtMonth(unknown, '2020-06').visited], ['a', 'b']);
console.log('Journey time checks passed: inclusive month boundaries, return visits, missing dates, gaps, and future routes.');
