function renderResidenceTimeline(data, selectPlace, visits = []) {
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
  let compact = false;
  const scaleButton = document.querySelector('#residence-scale');
  const scaleNote = document.querySelector('#residence-scale-note');
  const early = Math.max(0, Math.min(1, fraction(new Date('2010-01-01T00:00:00Z'))));
  const late = Math.max(early, Math.min(1, fraction(new Date('2017-01-01T00:00:00Z'))));
  const weight = f => Math.min(f, early) * .25 + Math.max(0, Math.min(f, late) - early) + Math.max(0, f - late) * .35;
  const scaled = f => compact ? weight(f) / weight(1) : f;
  const height = data.rows.length * 29 + 41;
  svg.attr('height', height);
  const positionUpdates = [];
  const at = (selection, attribute, value, offset = 0) => {
    positionUpdates.push((left, span) => selection.attr(attribute, left + scaled(value) * span + offset));
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
    if (row.date_note) at(svg.append('text').attr('class', 'residence-undated').attr('y', y + 4).text(row.date_note), 'x', 0);
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
        const pixels = (scaled(fromFraction + length) - scaled(fromFraction)) * span;
        hit.attr('width', Math.max(12, pixels + 8));
        bar.attr('width', length > 0 ? pixels : 2);
      });
      group.append('title').text(description);
      activate(group, () => { detail.textContent = description; if (row.place_id) selectPlace(row.place_id); });
      if (!period.start) at(group.append('text').attr('class', 'residence-break').attr('y', y + 7).text('‹'), 'x', 0, -7);
    });
  });
  const conferenceTypes = ['CIKM', 'KDD', 'ICWSM', 'IMCOM'];
  const visitType = visit => conferenceTypes.find(type => visit.note.includes(type)) || 'Other';
  const visitRows = [...new Set(visits.map(visitType))];
  const visitMarks = visits.map(visit => {
    const date = time(visit.date || `${visit.year}-07-01`);
    const flag = visit.country_code ? [...visit.country_code].map(letter => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('') : '';
    const type = visitType(visit);
    const description = `${visit.city}, ${visit.country} · ${visit.note}${visit.date ? '' : ' · year only; month unknown'}`;
    const group = svg.append('g').attr('class', `residence-visit visit-${type.toLowerCase()}`).attr('role', 'button').attr('tabindex', 0).attr('aria-label', description);
    group.append('circle').attr('class', 'visit-hit').attr('r', 11);
    group.append('circle').attr('class', 'visit-dot').attr('r', 4);
    group.append('title').text(`${flag} ${description}`);
    activate(group, () => {
      svg.selectAll('.residence-visit').classed('active', false);
      group.classed('active', true);
      detail.textContent = `${flag} ${visit.note} · ${visit.city}${visit.date ? '' : ' · month unknown'}`;
      selectPlace(visit.id);
    });
    return {fraction: fraction(date), group, row: visitRows.indexOf(type)};
  });
  if (visits.length) {
    svg.append('text').attr('class', 'residence-visit-heading').attr('x', 0).attr('y', height + 10).text('CONFERENCES');
    visitRows.forEach((type, row) => {
      const y = height + 32 + row * 25;
      svg.append('text').attr('class', 'residence-label').attr('x', 0).attr('y', y + 4).text(type);
      const rail = svg.insert('line', '.residence-visit').attr('class', 'visit-rail').attr('y1', y).attr('y2', y);
      at(rail, 'x1', 0); at(rail, 'x2', 1);
    });
  }
  const cursor = svg.append('line').attr('class', 'residence-cursor').attr('y1', 22).attr('y2', height - 8).attr('display', 'none');
  let cursorDate = null;
  function updateCursor() {
    const left = lastWidth < 450 ? 72 : 95;
    const x = left + scaled(fraction(cursorDate)) * (lastWidth - 12 - left);
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
      const x = left + scaled(fraction) * (width - 12 - left);
      const visible = index === 0 || (x - previousTick >= 55 && width - 12 - x >= 45);
      group.attr('display', visible ? null : 'none');
      if (visible) previousTick = x;
    });
    positionUpdates.forEach(update => update(left, width - 12 - left));
    visitMarks.forEach(mark => {
      const x = left + scaled(mark.fraction) * (width - 12 - left);
      mark.group.attr('transform', `translate(${x},${height + 32 + mark.row * 25})`);
    });
    const fullHeight = height + (visits.length ? 50 + visitRows.length * 25 : 0);
    svg.attr('height', fullHeight).attr('viewBox', `0 0 ${width} ${fullHeight}`);
    svg.selectAll('.residence-grid').attr('y2', fullHeight - 8);
    cursor.attr('y2', fullHeight - 8);
    updateCursor();
  });
  function toggleScale() {
    compact = !compact;
    scaleButton.textContent = compact ? 'Expand time' : 'Compact time';
    scaleButton.setAttribute('aria-pressed', String(compact));
    scaleNote.textContent = compact ? `${early > 0 ? 'Before 2010 ×¼ · ' : ''}After 2017 ×0.35` : 'Linear time scale';
    svg.attr('aria-label', compact ? `Residence timeline. Compressed time scale. ${scaleNote.textContent}` : 'Residence timeline. Linear time scale: equal distances represent equal durations.');
    lastWidth = 0;
    renderer.schedule(container.clientWidth);
  }
  scaleButton.addEventListener('click', toggleScale);
  const observer = new ResizeObserver(entries => renderer.schedule(entries[0].contentRect.width));
  observer.observe(container);
  renderer.schedule(container.clientWidth);
  return {
    setDate(date) { cursorDate = date; updateCursor(); },
    destroy() { scaleButton.removeEventListener('click', toggleScale); observer.disconnect(); renderer.cancel(); svg.remove(); }
  };
}
