async function initializeGlobe() {
  const status = document.querySelector('#globe-status');
  try {
    const [world, places, residence] = await Promise.all([
      fetch('assets/maps/countries-110m.json').then(r => { if (!r.ok) throw new Error('Map unavailable'); return r.json(); }),
      fetch('places.json').then(r => { if (!r.ok) throw new Error('Places unavailable'); return r.json(); }),
      fetch('residence.json').then(r => { if (!r.ok) throw new Error('Residence data unavailable'); return r.json(); })
    ]);
    const svg = d3.select('#globe');
    const projection = d3.geoOrthographic().translate([320, 300]).scale(274).rotate([-180, -25]).clipAngle(90);
    const path = d3.geoPath(projection);
    svg.append('path').datum({type: 'Sphere'}).attr('class', 'ocean');
    svg.append('path').datum(d3.geoGraticule10()).attr('class', 'graticule');
    svg.append('path').datum(topojson.feature(world, world.objects.countries)).attr('class', 'land');
    const markers = svg.append('g').selectAll('circle').data(places).join('circle')
      .attr('class', p => `place-marker ${p.status}`).attr('r', 6).attr('role', 'button')
      .attr('aria-label', p => `${p.city}, ${p.country}. ${p.note}${p.status === 'conference' ? '. Conference location; visit unconfirmed' : ''}`)
      .on('click', (event, p) => selectPlace(p)).on('keydown', (event, p) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); selectPlace(p); }
      });
    markers.append('title').text(p => `${p.city} · ${p.note}`);
    let selected = null;
    const toggle = document.querySelector('#show-conferences');
    function draw() {
      svg.selectAll('path').attr('d', path);
      const center = projection.invert([320, 300]);
      markers.each(function(p) {
        const visible = (p.status === 'visited' || toggle.checked) && d3.geoDistance(center, p.coordinates) < Math.PI / 2;
        const point = projection(p.coordinates);
        d3.select(this).attr('cx', point[0]).attr('cy', point[1]).attr('display', visible ? null : 'none')
          .attr('tabindex', visible ? 0 : -1).classed('selected', p.id === selected);
      });
    }
    function selectPlace(p) {
      selected = p.id;
      projection.rotate([-p.coordinates[0], -p.coordinates[1]]);
      document.querySelectorAll('.place-choice').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === selected)));
      const detail = document.querySelector('#place-detail');
      detail.replaceChildren(); detail.hidden = false;
      const title = document.createElement('h3'); title.textContent = `${p.city}, ${p.country}`; detail.append(title);
      const note = document.createElement('p'); note.textContent = p.note; detail.append(note);
      if (p.paper) {
        const paper = document.createElement('p'); paper.textContent = `${p.paper} · ${p.author_role} author`; detail.append(paper);
        for (const [label, href] of [['Venue source', p.venue_source], ['Paper', p.paper_source]]) {
          if (!href) continue;
          const link = document.createElement('a'); link.href = href; link.textContent = `${label} ↗`; detail.append(link);
        }
      }
      status.textContent = `${p.city} · ${p.note}${p.status === 'conference' ? ' · Visit unconfirmed' : ''}`;
      draw();
    }
    for (const [target, kind] of [['#visited-list', 'visited'], ['#conference-list', 'conference']]) {
      const list = document.querySelector(target); list.replaceChildren();
      places.filter(p => p.status === kind).forEach(p => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'place-choice'; button.dataset.id = p.id;
        button.textContent = `${p.city}, ${p.country}`; button.setAttribute('aria-pressed', 'false');
        const note = document.createElement('span'); note.textContent = p.note; button.append(note);
        button.addEventListener('click', () => selectPlace(p)); list.append(button);
      });
    }
    toggle.addEventListener('change', () => {
      document.querySelector('#conference-list').hidden = !toggle.checked;
      if (!toggle.checked && places.some(p => p.id === selected && p.status === 'conference')) {
        selected = null; document.querySelector('#place-detail').hidden = true; status.textContent = '';
      }
      draw();
    });
    svg.call(d3.drag().on('drag', event => {
      const rotation = projection.rotate(); const factor = 60 / projection.scale();
      projection.rotate([rotation[0] + event.dx * factor, Math.max(-85, Math.min(85, rotation[1] - event.dy * factor))]); draw();
    }));
    function zoom(factor) { projection.scale(Math.max(180, Math.min(600, projection.scale() * factor))); draw(); }
    svg.on('wheel', event => { event.preventDefault(); zoom(Math.exp(-event.deltaY * .001)); }, {passive: false});
    svg.on('keydown', event => {
      const rotation = projection.rotate(); let handled = true;
      if (event.key === 'ArrowLeft') rotation[0] -= 10;
      else if (event.key === 'ArrowRight') rotation[0] += 10;
      else if (event.key === 'ArrowUp') rotation[1] = Math.min(85, rotation[1] + 10);
      else if (event.key === 'ArrowDown') rotation[1] = Math.max(-85, rotation[1] - 10);
      else if (event.key === '+' || event.key === '=') zoom(1.15);
      else if (event.key === '-') zoom(1 / 1.15);
      else handled = false;
      if (handled) { event.preventDefault(); projection.rotate(rotation); draw(); }
    });
    document.querySelector('#zoom-in').addEventListener('click', () => zoom(1.15));
    document.querySelector('#zoom-out').addEventListener('click', () => zoom(1 / 1.15));
    document.querySelector('#reset-globe').addEventListener('click', () => {
      projection.rotate([-180, -25]).scale(274); selected = null; document.querySelector('#place-detail').hidden = true;
      document.querySelectorAll('.place-choice').forEach(button => button.setAttribute('aria-pressed', 'false'));
      status.textContent = ''; draw();
    });
    renderResidenceTimeline(residence, id => {
      const place = places.find(p => p.id === id);
      if (place) selectPlace(place);
    });
    draw();
  } catch (error) {
    status.textContent = 'The globe could not load. Please reload the page.';
    console.error(error);
  }
}
initializeGlobe();
