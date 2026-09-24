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
  const dateLabel = value => new Date(`${value}-01T00:00:00Z`).toLocaleDateString('en-US', {month: 'short', year: 'numeric', timeZone: 'UTC'});
  const periodLabel = s => s.arrived ? `${dateLabel(s.arrived)}–${s.current ? 'present' : s.departed ? dateLabel(s.departed) : 'end unknown'}` : s.age_note || 'Dates to add';
  const describe = s => {
    const period = periodLabel(s);
    return `${data.locations[s.location].city} · ${period}${s.note ? ` · ${s.note}` : ''}${s.approximate ? ' (approximate)' : ''}`;
  };
  const used = [...new Set(data.stops.map(s => s.location))];
  const places = used.filter(id => data.locations[id].coordinates).map(id => ({
    id, ...data.locations[id], status: 'visited', note: data.stops.filter(s => s.location === id).map(periodLabel).join(' / '), stays: data.stops.filter(s => s.location === id).map(describe)
  }));
  const nextMonth = value => {
    const date = new Date(`${value}-01T00:00:00Z`); date.setUTCMonth(date.getUTCMonth() + 1); return date.toISOString().slice(0, 10);
  };
  const dated = data.stops.flatMap(s => [s.arrived, s.departed]).filter(Boolean).sort();
  const rows = used.map(id => ({place_id: data.locations[id].coordinates ? id : null, label: data.locations[id].city.replace(' / Redmond', '').replace(' (city to add)', ''), periods: data.stops.filter(s => s.location === id && (s.arrived || s.departed || s.current)).map(s => ({
    start: s.arrived ? `${s.arrived}-01` : null, end: s.departed ? nextMonth(s.departed) : null,
    current: !!s.current, approximate: !!s.approximate, description: describe(s), end_unknown: !s.departed && !s.current
  }))})).filter(r => r.periods.length);
  const moves = data.stops.slice(1).map((to, i) => {
    const from = data.stops[i];
    const a = data.locations[from.location], b = data.locations[to.location];
    return {id: `${from.id}--${to.id}`, from: from.location, to: to.location, coordinates: a.coordinates && b.coordinates ? [a.coordinates, b.coordinates] : null,
      label: `${a.city} → ${b.city}`, date: to.arrived ? dateLabel(to.arrived) : to.age_note || 'Date to add', approximate: !!to.approximate, note: to.note};
  });
  return {places, moves, residence: {start_year: Number(dated[0]?.slice(0, 4)) || 2010, early_life: data.early_life || '', rows}};
}
if (typeof module !== 'undefined') module.exports = {prepareJourney};
