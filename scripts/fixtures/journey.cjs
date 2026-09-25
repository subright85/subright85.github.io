// Fictional data only. Never copy the owner's chronology into public tests.
module.exports = {format_version: 1, locations: {
  a: {city: 'Example A', country: 'Example', coordinates: [0, 40]},
  b: {city: 'Example B', country: 'Example', coordinates: [10, 40]},
  unknown: {city: 'Unknown', country: 'Example', coordinates: null}
}, stops: [
  {id: 'first', location: 'a', arrived: '2001-01', departed: '2003-12'},
  {id: 'second', location: 'b', arrived: '2004-01', departed: '2004-05'},
  {id: 'return', location: 'a', arrived: '2004-06', departed: '2005-12'},
  {id: 'uncertain', location: 'unknown', arrived: '2006-01', departed: '2006-06', approximate: true},
  {id: 'last', location: 'b', arrived: '2006-07', departed: null, current: true}
]};
