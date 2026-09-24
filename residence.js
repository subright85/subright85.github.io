function renderResidenceTimeline(data, selectPlace) {
  const container = document.querySelector('#residence-chart');
  const detail = document.querySelector('#residence-detail');
  const svg = d3.select(container).append('svg').attr('role', 'group');
  document.querySelector('#residence-earlier').textContent = data.early_life;
  const startYear = data.start_year || 2010;
  const start = new Date(Date.UTC(startYear, 0, 1));
  const end = new Date();
  svg.attr('aria-label', 'Residence timeline. Linear time scale: equal distances represent equal durations.');
  const time = value => new Date(value + 'T00:00:00Z');
  const total = end - start || 1;
  const fraction = date => (date - start) / total;
  const height = data.rows.length * 29 + 41;
  svg.attr('height', height);
  const positionUpdates = [];
  const at = (selection, attribute, value, offset = 0) => {
    positionUpdates.push((left, span) => selection.attr(attribute, left + value * span + offset));
    return selection;
  };
  const activate = (selection, handler) => selection.on('click', handler).on('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handler(); }
  });

  // Build once; resizing preserves elements, listeners, and keyboard focus.
  const tickYears = [startYear];
  for (let year = Math.floor(startYear / 5) * 5 + 5; year <= end.getUTCFullYear(); year += 5) tickYears.push(year);
  const ticks = tickYears.map(year => {
    const f = fraction(new Date(Date.UTC(year, 0, 1)));
    const group = svg.append('g');
    const line = group.append('line').attr('class', 'residence-grid').attr('y1', 24).attr('y2', height - 8);
    at(line, 'x1', f); at(line, 'x2', f);
    at(group.append('text').attr('class', 'residence-tick').attr('y', 13).text(year), 'x', f);
    return {fraction: f, group};
  });
  at(svg.append('text').attr('class', 'residence-tick').attr('y', 13).attr('text-anchor', 'end').text('Now'), 'x', 1);
  data.rows.forEach((row, i) => {
    const y = 37 + i * 29;
    const label = svg.append('text').attr('class', 'residence-label').attr('x', 0).attr('y', y + 4).text(row.label);
    if (row.place_id) activate(label.attr('role', 'button').attr('tabindex', 0).attr('aria-label', `Show ${row.label} on the globe`), () => selectPlace(row.place_id));
    row.periods.forEach(period => {
      const from = period.start ? time(period.start) : start;
      const to = period.end ? time(period.end) : period.current ? end : from;
      const fromFraction = fraction(from), length = Math.max(0, fraction(to) - fromFraction);
      const months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + to.getUTCMonth() - from.getUTCMonth();
      const duration = [Math.floor(months / 12) ? `${Math.floor(months / 12)} years` : '', months % 12 ? `${months % 12} months` : ''].filter(Boolean).join(', ');
      const description = period.description + (period.start && !period.approximate && duration && !period.end_unknown ? ` · ${duration}` : '');
      const group = svg.append('g').attr('class', 'residence-period').attr('role', 'button').attr('tabindex', 0).attr('aria-label', description);
      const hit = at(group.append('rect').attr('class', 'residence-hit').attr('y', y - 10).attr('height', 24), 'x', fromFraction, -4);
      const bar = at(group.append('rect').attr('class', `residence-bar${period.current ? ' current' : ''}${period.approximate ? ' approximate' : ''}`).attr('y', y).attr('height', 5).attr('rx', 2), 'x', fromFraction);
      positionUpdates.push((left, span) => {
        hit.attr('width', Math.max(12, length * span + 8));
        bar.attr('width', length > 0 ? length * span : 2);
      });
      group.append('title').text(description);
      activate(group, () => { detail.textContent = description; if (row.place_id) selectPlace(row.place_id); });
      if (!period.start) at(group.append('text').attr('class', 'residence-break').attr('y', y + 7).text('‹'), 'x', 0, -7);
    });
  });
  const cursor = svg.append('line').attr('class', 'residence-cursor').attr('y1', 22).attr('y2', height - 8).attr('display', 'none');
  let cursorDate = null;
  function updateCursor() {
    const left = lastWidth < 450 ? 72 : 95;
    const x = left + fraction(cursorDate) * (lastWidth - 12 - left);
    cursor.attr('x1', x).attr('x2', x).attr('display', cursorDate ? null : 'none');
  }
  let lastWidth = 0;
  const renderer = createFrameScheduler(width => {
    if (!width || width === lastWidth) return;
    lastWidth = width;
    const left = width < 450 ? 72 : 95;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    let previousTick = -Infinity;
    ticks.forEach(({fraction, group}, index) => {
      const x = left + fraction * (width - 12 - left);
      const visible = index === 0 || (x - previousTick >= 55 && width - 12 - x >= 45);
      group.attr('display', visible ? null : 'none');
      if (visible) previousTick = x;
    });
    positionUpdates.forEach(update => update(left, width - 12 - left));
    updateCursor();
  });
  const observer = new ResizeObserver(entries => renderer.schedule(entries[0].contentRect.width));
  observer.observe(container);
  renderer.schedule(container.clientWidth);
  return {
    setDate(date) { cursorDate = date; updateCursor(); },
    destroy() { observer.disconnect(); renderer.cancel(); svg.remove(); }
  };
}
