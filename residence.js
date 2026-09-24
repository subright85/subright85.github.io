function renderResidenceTimeline(data, selectPlace) {
  const container = document.querySelector('#residence-chart');
  const svg = d3.select(container).append('svg').attr('role', 'group').attr('aria-label', 'Residence timeline. Years after 2017 are compressed.');
  const earlier = document.querySelector('#residence-earlier');
  earlier.textContent = data.early_life;
  const startYear = data.start_year || data.birth_year || data.pohang_move_year || 2010;
  const start = new Date(Date.UTC(startYear, 0, 1));
  document.querySelector('.residence-footer span').textContent = startYear < 2010 ? '// Time compressed before 2010 & after 2017' : '// Time compressed after 2017';
  const end = new Date();
  const compression = new Date('2017-01-01T00:00:00Z');
  const earlyCompression = new Date('2010-01-01T00:00:00Z');
  const time = value => new Date(value + 'T00:00:00Z');
  const weighted = date => {
    const early = Math.max(0, Math.min(+date, +earlyCompression) - +start) * .25;
    const middle = Math.max(0, Math.min(+date, +compression) - Math.max(+start, +earlyCompression));
    const late = Math.max(0, +date - +compression) * .35;
    return early + middle + late;
  };
  function draw() {
    const width = container.clientWidth;
    if (!width) return;
    const left = width < 450 ? 72 : 95, right = width - 12;
    const height = data.rows.length * 29 + 41;
    const x = value => left + weighted(value) / weighted(end) * (right - left);
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('height', height);
    svg.selectAll('*').remove();
    const years = width < 450 ? [startYear, 2015] : [...new Set([startYear, 2010, 2015])];
    years.forEach(year => {
      const px = x(new Date(Date.UTC(year, 0, 1)));
      svg.append('line').attr('class', 'residence-grid').attr('x1', px).attr('x2', px).attr('y1', 24).attr('y2', height - 8);
      svg.append('text').attr('class', 'residence-tick').attr('x', px).attr('y', 13).text(year);
    });
    svg.append('text').attr('class', 'residence-tick').attr('x', right).attr('y', 13).attr('text-anchor', 'end').text('Now');
    data.rows.forEach((row, i) => {
      const y = 37 + i * 29;
      const label = svg.append('text').attr('class', 'residence-label').attr('x', 0).attr('y', y + 4).text(row.label);
      if (row.place_id) label.attr('role', 'button').attr('tabindex', 0).attr('aria-label', `Show ${row.label} on the globe`).on('click', () => selectPlace(row.place_id)).on('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPlace(row.place_id); }
      });
      row.periods.forEach(period => {
        const from = period.start ? time(period.start) : new Date(Date.UTC(data.pohang_move_year || startYear, 0, 1));
        const to = period.end ? time(period.end) : period.current ? end : from;
        const group = svg.append('g').attr('class', 'residence-period').attr('role', 'button').attr('tabindex', 0).attr('aria-label', period.description);
        group.append('rect').attr('class', 'residence-hit').attr('x', x(from) - 4).attr('y', y - 10).attr('width', Math.max(12, x(to) - x(from) + 8)).attr('height', 24);
        group.append('rect').attr('class', `residence-bar${period.current ? ' current' : ''}${period.approximate ? ' approximate' : ''}`).attr('x', x(from)).attr('y', y).attr('width', Math.max(2, x(to) - x(from))).attr('height', 5).attr('rx', 2);
        const months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + to.getUTCMonth() - from.getUTCMonth();
        const duration = [Math.floor(months / 12) ? `${Math.floor(months / 12)} years` : '', months % 12 ? `${months % 12} months` : ''].filter(Boolean).join(', ');
        const description = period.description + (period.start && !period.approximate && duration && !period.end_unknown ? ` · ${duration}` : '');
        group.attr('aria-label', description);
        group.append('title').text(description);
        const show = () => {
          document.querySelector('#residence-detail').textContent = description;
          if (row.place_id) selectPlace(row.place_id);
        };
        group.on('click', show).on('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(); }
        });
        if (!period.start && !data.pohang_move_year) {
          group.append('text').attr('class', 'residence-break').attr('x', left - 7).attr('y', y + 7).text('‹');
        }
        if (period.current && from <= compression) {
          const cut = x(compression);
          group.append('rect').attr('x', cut - 4).attr('y', y - 3).attr('width', 13).attr('height', 12).attr('fill', 'var(--bg)');
          group.append('text').attr('class', 'residence-break').attr('x', cut - 3).attr('y', y + 7).text('//');
        }
      });
    });
    svg.append('text').attr('class', 'residence-tick').attr('x', x(compression)).attr('y', 13).text('//');
    if (startYear < 2010) svg.append('text').attr('class', 'residence-tick').attr('x', x(earlyCompression) + 27).attr('y', 13).text('//');
  }
  new ResizeObserver(draw).observe(container);
  draw();
}
