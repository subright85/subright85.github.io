function renderResidenceTimeline(data, selectPlace) {
  const container = document.querySelector('#residence-chart');
  const detail = document.querySelector('#residence-detail');
  const svg = d3.select(container).append('svg').attr('role', 'group');
  document.querySelector('#residence-earlier').textContent = data.early_life;
  const startYear = data.start_year || 2010;
  const start = new Date(Date.UTC(startYear, 0, 1));
  const end = new Date();
  const compression = new Date('2017-01-01T00:00:00Z');
  const earlyCompression = new Date('2010-01-01T00:00:00Z');
  const compressionLabel = startYear < 2010 ? 'Time compressed before 2010 & after 2017' : 'Time compressed after 2017';
  document.querySelector('.residence-footer span').textContent = `// ${compressionLabel}`;
  svg.attr('aria-label', `Residence timeline. ${compressionLabel}.`);
  const time = value => new Date(value + 'T00:00:00Z');
  const weighted = date => {
    const early = Math.max(0, Math.min(+date, +earlyCompression) - +start) * .25;
    const middle = Math.max(0, Math.min(+date, +compression) - Math.max(+start, +earlyCompression));
    const late = Math.max(0, +date - +compression) * .35;
    return early + middle + late;
  };
  const total = weighted(end) || 1;
  const fraction = date => weighted(date) / total;
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
  const tickYears = [...new Set([startYear, 2010, 2015])].filter(year => year >= startYear && year <= end.getUTCFullYear());
  const ticks = tickYears.map(year => {
    const f = fraction(new Date(Date.UTC(year, 0, 1)));
    const group = svg.append('g');
    const line = group.append('line').attr('class', 'residence-grid').attr('y1', 24).attr('y2', height - 8);
    at(line, 'x1', f); at(line, 'x2', f);
    at(group.append('text').attr('class', 'residence-tick').attr('y', 13).text(year), 'x', f);
    return {year, group};
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
        bar.attr('width', Math.max(2, length * span));
      });
      group.append('title').text(description);
      activate(group, () => { detail.textContent = description; if (row.place_id) selectPlace(row.place_id); });
      if (!period.start) at(group.append('text').attr('class', 'residence-break').attr('y', y + 7).text('‹'), 'x', 0, -7);
      if (period.current && from <= compression) {
        const f = fraction(compression);
        at(group.append('rect').attr('y', y - 3).attr('width', 13).attr('height', 12).attr('fill', 'var(--bg)'), 'x', f, -4);
        at(group.append('text').attr('class', 'residence-break').attr('y', y + 7).text('//'), 'x', f, -3);
      }
    });
  });
  if (compression >= start && compression <= end) at(svg.append('text').attr('class', 'residence-tick').attr('y', 13).text('//'), 'x', fraction(compression));
  if (startYear < 2010) at(svg.append('text').attr('class', 'residence-tick').attr('y', 13).text('//'), 'x', fraction(earlyCompression), 27);
  let lastWidth = 0;
  const renderer = createFrameScheduler(width => {
    if (!width || width === lastWidth) return;
    lastWidth = width;
    const left = width < 450 ? 72 : 95;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    ticks.forEach(({year, group}) => group.attr('display', width < 450 && year !== startYear && year !== 2015 ? 'none' : null));
    positionUpdates.forEach(update => update(left, width - 12 - left));
  });
  const observer = new ResizeObserver(entries => renderer.schedule(entries[0].contentRect.width));
  observer.observe(container);
  renderer.schedule(container.clientWidth);
  return () => { observer.disconnect(); renderer.cancel(); svg.remove(); };
}
