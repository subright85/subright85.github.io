const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {prepareJourney} = require('../journey.js');
const input = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'journey.json'), 'utf8'));
const result = prepareJourney(input);
assert.equal(result.residence.start_year, 1985);
assert.equal(result.residence.rows[0].place_id, 'incheon');
assert.equal(result.residence.rows[0].periods[0].start, '1985-01-01');
assert.equal(result.residence.rows[0].periods[0].end, '2004-01-01');
assert.equal(result.moves.length, input.stops.length - 1);
for (let i = 0; i < result.moves.length; i++) {
  assert.equal(result.moves[i].from, input.stops[i].location);
  assert.equal(result.moves[i].to, input.stops[i + 1].location);
  if (!input.locations[input.stops[i].location].coordinates || !input.locations[input.stops[i + 1].location].coordinates) assert.equal(result.moves[i].coordinates, null);
}
const invalid = structuredClone(input); invalid.stops[0].arrived = '2000-13';
assert.throws(() => prepareJourney(invalid), /YYYY-MM/);
const unknownEnd = structuredClone(input); unknownEnd.stops[1].departed = null; unknownEnd.stops[1].arrived = '2004-03';
const unknownResult = prepareJourney(unknownEnd);
assert.ok(unknownResult.residence.rows.find(r => r.place_id === unknownEnd.stops[1].location).periods.some(p => p.end_unknown && !p.current));
console.log(`${input.stops.length} stays; ${result.moves.length} moves; ${result.moves.filter(m => m.coordinates).length} drawable routes. Journey checks passed.`);
