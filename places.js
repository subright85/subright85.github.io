async function initializeGlobe() {
  const status = document.querySelector('#globe-status');
  try {
    const [world, savedPlaces, journey] = await Promise.all([
      fetch('assets/maps/land-game.json').then(r => { if (!r.ok) throw new Error('Map unavailable'); return r.json(); }),
      fetch('places.json').then(r => { if (!r.ok) throw new Error('Places unavailable'); return r.json(); }),
      fetch('journey.json').then(r => { if (!r.ok) throw new Error('Journey unavailable'); return r.json(); })
    ]);
    const {places: journeyPlaces, residence, moves} = prepareJourney(journey);
    const places = [...journeyPlaces, ...savedPlaces.filter(p => p.status === 'conference')];
    const placeById = new Map(places.map(place => [place.id, place]));
    const moveIndexById = new Map(moves.map((move, index) => [move.id, index]));
    const detail = document.querySelector('#place-detail');
    const moveSelect = document.querySelector('#journey-move');
    const conferenceList = document.querySelector('#conference-list');
    const choiceButtons = new Map();
    const drawableMoves = moves.filter(move => move.coordinates);
    const routeGeometry = new Map(drawableMoves.map(move => {
      const interpolate = d3.geoInterpolate(...move.coordinates);
      return [move.id, {point: interpolate(.58), ahead: interpolate(.60), midpoint: interpolate(.5)}];
    }));
    const svg = d3.select('#globe');
    const projection = d3.geoOrthographic().translate([320, 300]).scale(274).rotate([-180, -25]).clipAngle(90);
    const path = d3.geoPath(projection);
    const gradient = svg.append('defs').append('radialGradient').attr('id', 'ocean-color').attr('cx', '35%').attr('cy', '25%').attr('r', '85%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#65cbd9');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#246da9');
    svg.append('path').datum({type: 'Sphere'}).attr('class', 'ocean');
    svg.append('path').datum(d3.geoGraticule().step([30, 30])()).attr('class', 'graticule');
    svg.append('g').selectAll('path').data(world.features).join('path').attr('class', feature => `land terrain-${feature.properties.terrain}`);
    const routes = svg.append('g').attr('class', 'journey-routes').selectAll('path').data(drawableMoves).join('path')
      .attr('class', 'journey-route')
      .datum(m => ({type: 'LineString', coordinates: m.coordinates, move: m}));
    routes.append('title').text(d => `${d.move.label} · ${d.move.date}`);
    const geographicPaths = svg.selectAll('.ocean, .graticule, .land, .journey-route');
    const arrows = svg.append('g').attr('aria-hidden', 'true').selectAll('polygon').data(drawableMoves).join('polygon').attr('class', 'journey-arrow');
    const markers = svg.append('g').selectAll('g').data(places).join('g')
      .attr('class', p => `place-marker ${p.status}`).attr('role', 'button')
      .attr('aria-label', p => `${p.city}, ${p.country}. ${p.note}${p.status === 'conference' ? '. Conference location; visit unconfirmed' : ''}`)
      .on('click', (event, p) => selectPlace(p)).on('keydown', (event, p) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); selectPlace(p); }
      });
    markers.append('title').text(p => `${p.city} · ${p.note}`);
    markers.append('circle').attr('class', 'pin-hit').attr('cy', -9).attr('r', 13);
    markers.append('path').attr('class', 'pin-body').attr('d', 'M0 1C-2-2-8-7-8-12a8 8 0 1 1 16 0C8-7 2-2 0 1Z');
    markers.append('circle').attr('class', 'pin-center').attr('cy', -12).attr('r', 2.8);
    let selected = null;
    let selectedMove = null;
    const toggle = document.querySelector('#show-conferences');
    let projectionDirty = true;
    const renderer = createFrameScheduler(() => {
      draw(projectionDirty);
      projectionDirty = false;
    });
    function scheduleDraw(projectionChanged = true) {
      projectionDirty = projectionDirty || projectionChanged;
      renderer.schedule();
    }
    function syncSelection() {
      choiceButtons.forEach((button, id) => button.setAttribute('aria-pressed', String(id === selected)));
    }
    function resetView() {
      projection.rotate([-180, -25]).scale(274);
      selected = null; selectedMove = null; moveSelect.value = '';
      detail.hidden = true; status.textContent = '';
      syncSelection(); scheduleDraw();
    }
    function draw(projectionChanged) {
      if (projectionChanged) geographicPaths.attr('d', path);
      const center = projection.invert([320, 300]);
      routes.classed('active', d => d.move.id === selectedMove);
      arrows.classed('active', m => m.id === selectedMove);
      if (projectionChanged) arrows.each(function(m) {
        const {point, ahead} = routeGeometry.get(m.id);
        const visible = d3.geoDistance(center, point) < Math.PI / 2 && d3.geoDistance(center, ahead) < Math.PI / 2;
        const a = projection(point), b = projection(ahead);
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const dx = Math.cos(angle), dy = Math.sin(angle);
        d3.select(this).attr('display', visible ? null : 'none').attr('points', `${a[0]+dx*5},${a[1]+dy*5} ${a[0]-dx*4-dy*3},${a[1]-dy*4+dx*3} ${a[0]-dx*4+dy*3},${a[1]-dy*4-dx*3}`);
      });
      markers.each(function(p) {
        const visible = (p.status === 'visited' || toggle.checked) && d3.geoDistance(center, p.coordinates) < Math.PI / 2;
        const point = projection(p.coordinates);
        d3.select(this).attr('transform', `translate(${point[0]},${point[1]})`).attr('display', visible ? null : 'none')
          .attr('tabindex', visible ? 0 : -1).classed('selected', p.id === selected);
      });
    }
    function selectPlace(p) {
      selectedMove = null;
      moveSelect.value = '';
      selected = p.id;
      projection.rotate([-p.coordinates[0], -p.coordinates[1]]);
      syncSelection();
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
      scheduleDraw();
    }
    moves.forEach((move, i) => {
      const option = document.createElement('option'); option.value = move.id;
      option.textContent = `${i + 1}. ${move.label} · ${move.date}`; moveSelect.append(option);
    });
    function showMove(index) {
      const move = moves[index];
      if (!move) {
        resetView(); return;
      }
      selectedMove = move.id; moveSelect.value = move.id; selected = move.to;
      const destination = placeById.get(move.to);
      const origin = placeById.get(move.from);
      const center = routeGeometry.get(move.id)?.midpoint || (destination || origin)?.coordinates;
      if (center) projection.rotate([-center[0], -center[1]]);
      projection.scale(274);
      detail.replaceChildren(); detail.hidden = false;
      const title = document.createElement('h3'); title.textContent = move.label; detail.append(title);
      const note = document.createElement('p'); note.textContent = `${move.date}${move.approximate ? ' (approximate)' : ''}${move.note ? ` · ${move.note}` : ''}`; detail.append(note);
      status.textContent = `${index + 1} / ${moves.length} · ${move.label} · ${move.date}${move.coordinates ? '' : ' · Add the missing city coordinates to draw this move.'}`;
      syncSelection(); scheduleDraw();
    }
    moveSelect.addEventListener('change', () => showMove(moveIndexById.get(moveSelect.value)));
    document.querySelector('#previous-move').addEventListener('click', () => {
      const index = moveIndexById.get(selectedMove) ?? -1; showMove(index <= 0 ? moves.length - 1 : index - 1);
    });
    document.querySelector('#next-move').addEventListener('click', () => {
      const index = moveIndexById.get(selectedMove) ?? -1; showMove((index + 1) % moves.length);
    });
    for (const [target, kind] of [['#visited-list', 'visited'], ['#conference-list', 'conference']]) {
      const list = document.querySelector(target); list.replaceChildren();
      places.filter(p => p.status === kind).forEach(p => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'place-choice'; button.dataset.id = p.id;
        button.textContent = `${p.city}, ${p.country}`; button.setAttribute('aria-pressed', 'false');
        const note = document.createElement('span'); note.textContent = p.note; button.append(note);
        button.addEventListener('click', () => selectPlace(p)); list.append(button);
        choiceButtons.set(p.id, button);
      });
    }
    toggle.addEventListener('change', () => {
      conferenceList.hidden = !toggle.checked;
      if (!toggle.checked && placeById.get(selected)?.status === 'conference') {
        selected = null; detail.hidden = true; status.textContent = ''; syncSelection();
      }
      scheduleDraw(false);
    });
    svg.call(d3.drag().on('drag', event => {
      const rotation = projection.rotate(); const factor = 60 / projection.scale();
      projection.rotate([rotation[0] + event.dx * factor, Math.max(-85, Math.min(85, rotation[1] - event.dy * factor))]); scheduleDraw();
    }));
    function zoom(factor) { projection.scale(Math.max(180, Math.min(600, projection.scale() * factor))); scheduleDraw(); }
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
      if (handled) { event.preventDefault(); projection.rotate(rotation); scheduleDraw(); }
    });
    document.querySelector('#zoom-in').addEventListener('click', () => zoom(1.15));
    document.querySelector('#zoom-out').addEventListener('click', () => zoom(1 / 1.15));
    document.querySelector('#reset-globe').addEventListener('click', resetView);
    renderResidenceTimeline(residence, id => {
      const place = placeById.get(id);
      if (place) selectPlace(place);
    });
    scheduleDraw();
  } catch (error) {
    status.textContent = 'The globe could not load. Please reload the page.';
    console.error(error);
  }
}
initializeGlobe();
