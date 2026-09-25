// One ordered file drives the map, moves, and residence bars.
function prepareJourney(data) {
  if (data.format_version !== 1 || !data.locations || !Array.isArray(data.stops) || !data.stops.length) throw new Error('Invalid journey format');
  const month = /^\d{4}-(0[1-9]|1[0-2])$/;
  const ids = new Set();
  Object.entries(data.locations).forEach(([id, p]) => {
    if (!p.city || !p.country) throw new Error(`Missing city/country: ${id}`);
    if (p.coordinates !== null && (!Array.isArray(p.coordinates) || p.coordinates.length !== 2 || !p.coordinates.every(Number.isFinite) || Math.abs(p.coordinates[0]) > 180 || Math.abs(p.coordinates[1]) > 90)) throw new Error(`Invalid longitude/latitude: ${id}`);
  });
  data.stops.forEach((s, i) => {
    if (!s.id || ids.has(s.id) || !data.locations[s.location]) throw new Error(`Invalid stop: ${s.id}`);
    ids.add(s.id);
    for (const key of ['arrived', 'departed']) if (s[key] !== null && !month.test(s[key])) throw new Error(`Use YYYY-MM or null: ${s.id}.${key}`);
    if (s.arrived && s.departed && s.arrived > s.departed) throw new Error(`Reversed dates: ${s.id}`);
    if (s.current && (s.departed !== null || i !== data.stops.length - 1)) throw new Error('Only the final, open-ended stay can be current');
    if (s.arrived && i && data.stops[i - 1].arrived && s.arrived < data.stops[i - 1].arrived) throw new Error('Stops must be chronological');
  });
  const formatter = new Intl.DateTimeFormat('en-US', {month: 'short', year: 'numeric', timeZone: 'UTC'});
  const dateLabels = new Map();
  const dateLabel = value => {
    if (!dateLabels.has(value)) dateLabels.set(value, formatter.format(new Date(`${value}-01T00:00:00Z`)));
    return dateLabels.get(value);
  };
  const periodLabel = s => s.period_label || (s.arrived ? `${dateLabel(s.arrived)}–${s.current ? 'present' : s.departed ? dateLabel(s.departed) : 'end unknown'}` : s.age_note || 'Dates to add');
  const describe = s => {
    const period = periodLabel(s);
    return `${data.locations[s.location].city} · ${period}${s.note ? ` · ${s.note}` : ''}${s.approximate ? ' (approximate)' : ''}`;
  };
  const byLocation = new Map();
  const descriptions = new Map();
  const periods = new Map();
  let earliestDate = null;
  data.stops.forEach(stop => {
    if (!byLocation.has(stop.location)) byLocation.set(stop.location, []);
    byLocation.get(stop.location).push(stop);
    descriptions.set(stop.id, describe(stop));
    periods.set(stop.id, periodLabel(stop));
    for (const value of [stop.arrived, stop.departed]) {
      if (value && (!earliestDate || value < earliestDate)) earliestDate = value;
    }
  });
  const used = [...byLocation.keys()];
  const places = used.filter(id => data.locations[id].coordinates).map(id => ({
    id, ...data.locations[id], status: 'visited', note: byLocation.get(id).map(s => periods.get(s.id)).join(' / '), stays: byLocation.get(id).map(s => descriptions.get(s.id))
  }));
  const nextMonth = value => {
    const date = new Date(`${value}-01T00:00:00Z`); date.setUTCMonth(date.getUTCMonth() + 1); return date.toISOString().slice(0, 10);
  };
  const rows = used.map(id => ({date_note: byLocation.get(id).filter(s => !s.arrived && !s.departed && !s.current).map(s => `${s.age_note || 'Dates unknown'} · years to add`).join(' / '), place_id: data.locations[id].coordinates ? id : null, label: data.locations[id].city.replace(' / Redmond', '').replace(' (city to add)', ''), periods: byLocation.get(id).filter(s => s.arrived || s.departed || s.current).map(s => ({
    start: s.arrived ? `${s.arrived}-01` : null, end: s.departed ? nextMonth(s.departed) : null,
    current: !!s.current, approximate: !!s.approximate, description: descriptions.get(s.id), end_unknown: !s.departed && !s.current
  }))})).filter(r => r.periods.length || r.date_note);
  const moves = data.stops.slice(1).map((to, i) => {
    const from = data.stops[i];
    const a = data.locations[from.location], b = data.locations[to.location];
    return {id: `${from.id}--${to.id}`, from: from.location, to: to.location, coordinates: a.coordinates && b.coordinates ? [a.coordinates, b.coordinates] : null,
      label: `${a.city} → ${b.city}`, date: to.arrived ? dateLabel(to.arrived) : to.age_note || 'Date to add', approximate: !!to.approximate, note: to.note};
  });
  return {places, moves, residence: {start_year: Number(earliestDate?.slice(0, 4)) || 2010, early_life: data.early_life || '', rows}};
}
if (typeof module !== 'undefined') module.exports = {prepareJourney};

// Month boundaries follow journey.json: departed includes the whole month.
function journeyAtMonth(journey, month) {
  const active = journey.stops.find(stop =>
    (stop.arrived ? stop.arrived <= month : !!stop.departed) &&
    (stop.departed ? month <= stop.departed : !!stop.current));
  const reachedIndex = journey.stops.reduce((latest, stop, index) =>
    (stop === active || (stop.arrived && stop.arrived <= month) || (stop.departed && stop.departed <= month)) ? index : latest, -1);
  const visited = new Set();
  const moveIds = new Set();
  journey.stops.forEach((stop, index) => {
    const reached = stop.arrived ? stop.arrived <= month : index <= reachedIndex;
    if (!reached) return;
    visited.add(stop.location);
    if (index) moveIds.add(`${journey.stops[index - 1].id}--${stop.id}`);
  });
  return {active, visited, moveIds};
}
if (typeof module !== 'undefined') module.exports.journeyAtMonth = journeyAtMonth;
