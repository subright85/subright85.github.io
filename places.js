async function initializeGlobe() {
  const status = document.querySelector('#globe-status');
  try {
    const [world, savedPlaces, journey] = await Promise.all([
      fetch('assets/maps/countries-110m.json').then(r => { if (!r.ok) throw new Error('Map unavailable'); return r.json(); }),
      fetch('places.json').then(r => { if (!r.ok) throw new Error('Places unavailable'); return r.json(); }),
      fetch('journey.json').then(r => { if (!r.ok) throw new Error('Journey unavailable'); return r.json(); })
    ]);
    const {places: journeyPlaces, residence, moves} = prepareJourney(journey);
    const places = [...journeyPlaces, ...savedPlaces.filter(p => p.status === 'conference')];
    const svg = d3.select('#globe');
    const projection = d3.geoOrthographic().translate([320, 300]).scale(274).rotate([-180, -25]).clipAngle(90);
    const path = d3.geoPath(projection);
    svg.append('path').datum({type: 'Sphere'}).attr('class', 'ocean');
    svg.append('path').datum(d3.geoGraticule10()).attr('class', 'graticule');
    svg.append('path').datum(topojson.feature(world, world.objects.countries)).attr('class', 'land');
    const routes = svg.append('g').attr('class', 'journey-routes').selectAll('path').data(moves.filter(m => m.coordinates)).join('path')
      .attr('class', 'journey-route')
      .datum(m => ({type: 'LineString', coordinates: m.coordinates, move: m}));
    routes.append('title').text(d => `${d.move.label} · ${d.move.date}`);
    const arrows = svg.append('g').attr('aria-hidden', 'true').selectAll('polygon').data(moves.filter(m => m.coordinates)).join('polygon').attr('class', 'journey-arrow');
    const markers = svg.append('g').selectAll('circle').data(places).join('circle')
      .attr('class', p => `place-marker ${p.status}`).attr('r', 6).attr('role', 'button')
      .attr('aria-label', p => `${p.city}, ${p.country}. ${p.note}${p.status === 'conference' ? '. Conference location; visit unconfirmed' : ''}`)
      .on('click', (event, p) => selectPlace(p)).on('keydown', (event, p) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); selectPlace(p); }
      });
    markers.append('title').text(p => `${p.city} · ${p.note}`);
    let selected = null;
    let selectedMove = null;
    const toggle = document.querySelector('#show-conferences');
    function draw() {
      svg.selectAll('.ocean, .graticule, .land, .journey-route').attr('d', path);
      const center = projection.invert([320, 300]);
      routes.classed('active', d => d.move.id === selectedMove);
      arrows.each(function(m) {
        const interpolate = d3.geoInterpolate(...m.coordinates);
        const point = interpolate(.58), ahead = interpolate(.60);
        const visible = d3.geoDistance(center, point) < Math.PI / 2 && d3.geoDistance(center, ahead) < Math.PI / 2;
        const a = projection(point), b = projection(ahead);
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const dx = Math.cos(angle), dy = Math.sin(angle);
        d3.select(this).attr('display', visible ? null : 'none').attr('points', `${a[0]+dx*5},${a[1]+dy*5} ${a[0]-dx*4-dy*3},${a[1]-dy*4+dx*3} ${a[0]-dx*4+dy*3},${a[1]-dy*4-dx*3}`).classed('active', m.id === selectedMove);
      });
      markers.each(function(p) {
        const visible = (p.status === 'visited' || toggle.checked) && d3.geoDistance(center, p.coordinates) < Math.PI / 2;
        const point = projection(p.coordinates);
        d3.select(this).attr('cx', point[0]).attr('cy', point[1]).attr('display', visible ? null : 'none')
          .attr('tabindex', visible ? 0 : -1).classed('selected', p.id === selected);
      });
    }
    function selectPlace(p) {
      selectedMove = null;
      document.querySelector('#journey-move').value = '';
      selected = p.id;
      projection.rotate([-p.coordinates[0], -p.coordinates[1]]);
      document.querySelectorAll('.place-choice').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === selected)));
      const detail = document.querySelector('#place-detail');
      detail.replaceChildren(); detail.hidden = false;
      const title = document.createElement('h3'); title.textContent = `${p.city}, ${p.country}`; detail.append(title);
      const note = document.createElement('p'); note.textContent = p.note; detail.append(note);
      (p.stays || []).forEach(stay => {
        const paragraph = document.createElement('p'); paragraph.textContent = stay; detail.append(paragraph);
      });
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
    const moveSelect = document.querySelector('#journey-move');
    moves.forEach((move, i) => {
      const option = document.createElement('option'); option.value = move.id;
      option.textContent = `${i + 1}. ${move.label} · ${move.date}`; moveSelect.append(option);
    });
    function showMove(index) {
      const move = moves[index];
      if (!move) {
        selectedMove = null; selected = null; moveSelect.value = '';
        projection.rotate([-180, -25]).scale(274);
        document.querySelector('#place-detail').hidden = true; status.textContent = '';
        document.querySelectorAll('.place-choice').forEach(button => button.setAttribute('aria-pressed', 'false'));
        draw(); return;
      }
      selectedMove = move.id; moveSelect.value = move.id; selected = move.to;
      const destination = places.find(p => p.id === move.to);
      const origin = places.find(p => p.id === move.from);
      const center = move.coordinates ? d3.geoInterpolate(...move.coordinates)(.5) : (destination || origin)?.coordinates;
      if (center) projection.rotate([-center[0], -center[1]]);
      projection.scale(274);
      const detail = document.querySelector('#place-detail'); detail.replaceChildren(); detail.hidden = false;
      const title = document.createElement('h3'); title.textContent = move.label; detail.append(title);
      const note = document.createElement('p'); note.textContent = `${move.date}${move.approximate ? ' (approximate)' : ''}${move.note ? ` · ${move.note}` : ''}`; detail.append(note);
      status.textContent = `${index + 1} / ${moves.length} · ${move.label} · ${move.date}${move.coordinates ? '' : ' · Add the missing city coordinates to draw this move.'}`;
      document.querySelectorAll('.place-choice').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === selected)));
      draw();
    }
    moveSelect.addEventListener('change', () => showMove(moves.findIndex(m => m.id === moveSelect.value)));
    document.querySelector('#previous-move').addEventListener('click', () => {
      const index = moves.findIndex(m => m.id === selectedMove); showMove(index <= 0 ? moves.length - 1 : index - 1);
    });
    document.querySelector('#next-move').addEventListener('click', () => {
      const index = moves.findIndex(m => m.id === selectedMove); showMove((index + 1) % moves.length);
    });
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
      projection.rotate([-180, -25]).scale(274); selected = null; selectedMove = null; moveSelect.value = ''; document.querySelector('#place-detail').hidden = true;
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
