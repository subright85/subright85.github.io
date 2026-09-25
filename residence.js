function renderResidenceTimeline(data, selectPlace) {
  const container = document.querySelector('#residence-chart');
  const detail = document.querySelector('#residence-detail');
  const scaleButton = document.querySelector('#residence-scale');
  const scaleNote = document.querySelector('#residence-scale-note');
  const svg = d3.select(container).append('svg').attr('role', 'group');
  const start = new Date(Date.UTC(data.start_year || 2010, 0, 1)), end = new Date();
  const time = value => new Date(value + 'T00:00:00Z');
  const fraction = date => (date - start) / (end - start || 1);
  const anchors = [start, end];
  data.rows.forEach(row => row.periods.forEach(p => { if (p.start) anchors.push(time(p.start)); if (p.end) anchors.push(time(p.end)); }));
  const dates = [...new Set(anchors.map(Number))].filter(d => d >= +start && d <= +end).sort((a,b) => a-b);
  const yearMs = 365.25 * 86400000;
  const segments = dates.slice(1).map((to, i) => ({from: dates[i], to, factor: to - dates[i] > 3 * yearMs ? 1.5 * yearMs / (to - dates[i]) : 1}));
  const weighted = date => segments.reduce((sum, part) => sum + Math.max(0, Math.min(+date, part.to) - part.from) * part.factor, 0);
  const weightedTotal = weighted(end);
  let compact = true, width = 0, cursorDate = null;
  const countries = new Map();
  function city(country, name) {
    if (!countries.has(country)) countries.set(country, {name: country, open: false, cities: new Map()});
    const group = countries.get(country);
    if (!group.cities.has(name)) group.cities.set(name, {name, periods: []});
    return group.cities.get(name);
  }
  data.rows.forEach(row => {
    const entry = city(row.country || 'Other', row.label);
    entry.periods.push(...row.periods.map(period => ({...period, place_id: row.place_id})));
    entry.date_note = row.date_note;
  });
  const grid = svg.append('g');
  const rows = svg.append('g');
  const cursor = svg.append('line').attr('class', 'residence-cursor');
  const activate = (selection, callback) => selection.on('click', callback).on('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); }
  });
  function dateX(date) {
    const f = fraction(date), left = width < 450 ? 96 : 130;
    return left + (compact ? weighted(date) / weightedTotal : f) * (width - left - 36);
  }
  function draw() {
    if (!width) return;
    rows.selectAll('*').remove(); grid.selectAll('*').remove();
    const layout = [];
    countries.forEach(country => {
      layout.push({country, entry: {name: country.name, periods: [...country.cities.values()].flatMap(c => c.periods)}, parent: true});
      if (country.open) country.cities.forEach(entry => layout.push({country, entry, parent: false}));
    });
    const height = layout.length * 28 + 35;
    svg.attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
    let lastTick = -Infinity;
    const tickYears = new Set([start.getUTCFullYear()]);
    for (let year = Math.ceil(start.getUTCFullYear() / 5) * 5; year <= end.getUTCFullYear(); year += 5) tickYears.add(year);
    if (compact) segments.filter(p => p.factor < 1).forEach(p => tickYears.add(new Date(p.to).getUTCFullYear()));
    for (const year of [...tickYears].sort((a,b) => a-b)) {
      const x = dateX(new Date(Date.UTC(year, 0, 1)));
      if (x - lastTick < 48 || width - 36 - x < 34) continue;
      lastTick = x;
      grid.append('line').attr('class', 'residence-grid').attr('x1', x).attr('x2', x).attr('y1', 24).attr('y2', height - 8);
      grid.append('text').attr('class', 'residence-tick').attr('x', x).attr('y', 13).text(year);
    }
    if (compact) segments.filter(p => p.factor < 1).forEach(p => grid.append('text').attr('class', 'residence-break').attr('x', dateX(new Date((p.from + p.to) / 2))).attr('y', 24).text('//').append('title').text('Quiet period compressed'));
    grid.append('text').attr('class', 'residence-tick').attr('x', width - 36).attr('y', 13).attr('text-anchor', 'end').text('Now');
    layout.forEach(({country, entry, parent}, index) => {
      const y = index * 28 + 37;
      const group = rows.append('g');
      const label = group.append('text').attr('class', `residence-label${parent ? ' country-label' : ''}`).attr('x', parent ? 0 : 12).attr('y', y + 4);
      const max = width < 450 ? 12 : 18;
      label.text(entry.name.length > max ? entry.name.slice(0, max - 1) + '…' : entry.name);
      label.append('title').text(entry.name);
      if (parent) {
        group.append('line').attr('class', 'country-row-rule').attr('x1', 0).attr('x2', width).attr('y1', y + 16).attr('y2', y + 16);
        const plus = group.append('text').attr('class', 'country-row-plus').attr('x', width - 8).attr('y', y + 5).attr('text-anchor', 'middle').attr('aria-hidden', 'true').text(country.open ? '×' : '+');
        plus.on('click', () => { country.open = !country.open; draw(); });
      }
      if (parent) activate(label.attr('role', 'button').attr('tabindex', 0).attr('aria-expanded', String(country.open)).attr('aria-label', `${country.open ? 'Collapse' : 'Expand'} ${country.name}`), () => {
        country.open = !country.open; draw();
        rows.selectAll('.country-label').filter(function() { return this.getAttribute('aria-label').endsWith(country.name); }).node()?.focus();
      });
      else {
        const id = entry.periods.find(p => p.place_id)?.place_id;
        if (id) activate(label.attr('role', 'button').attr('tabindex', 0).attr('aria-label', `Show ${entry.name}`), () => selectPlace(id));
      }
      if (parent && country.open) return;
      entry.periods.forEach(period => {
        const from = period.start ? time(period.start) : start;
        const to = period.end ? time(period.end) : period.current ? end : from;
        const x = dateX(from), length = Math.max(2, dateX(to) - x);
        const mark = group.append('g').attr('class', 'residence-period').attr('role', 'button').attr('tabindex', 0).attr('aria-label', period.description);
        mark.append('rect').attr('class', 'residence-hit').attr('x', x - 3).attr('y', y - 9).attr('width', Math.max(10, length + 6)).attr('height', 22);
        mark.append('rect').attr('class', `residence-bar${period.current ? ' current' : ''}${period.approximate ? ' approximate' : ''}`).attr('x', x).attr('y', y).attr('width', length).attr('height', 5).attr('rx', 2);
        mark.append('title').text(period.description);
        activate(mark, () => { detail.textContent = period.description; if (period.place_id) selectPlace(period.place_id); });
      });
    });
    cursor.attr('y1', 23).attr('y2', height - 8);
    updateCursor();
  }
  function updateCursor() { cursor.attr('display', cursorDate ? null : 'none'); if (cursorDate) cursor.attr('x1', dateX(cursorDate)).attr('x2', dateX(cursorDate)); }
  function scaleLabel() {
    scaleButton.textContent = compact ? 'Expand time' : 'Compact time';
    scaleButton.setAttribute('aria-pressed', String(compact));
    scaleNote.textContent = compact ? 'Quiet periods compressed' : 'Linear time scale';
    svg.attr('aria-label', `Residence by country. ${scaleNote.textContent}. Expand a country to show its cities.`);
  }
  function toggleScale() { compact = !compact; scaleLabel(); draw(); }
  scaleButton.addEventListener('click', toggleScale);
  const renderer = createFrameScheduler(next => { if (next && next !== width) { width = next; draw(); } });
  const observer = new ResizeObserver(entries => renderer.schedule(entries[0].contentRect.width));
  observer.observe(container); renderer.schedule(container.clientWidth); scaleLabel();
  return {setDate(date) { cursorDate = date; updateCursor(); }, destroy() { scaleButton.removeEventListener('click', toggleScale); observer.disconnect(); renderer.cancel(); svg.remove(); }};
}
