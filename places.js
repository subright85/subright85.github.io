async function initializeGlobe() {
  const status = document.querySelector('#globe-status');
  try {
    const [world, savedPlaces, journey, boundaries] = await Promise.all([
      fetch('assets/maps/land-natural.json?v=1').then(r => { if (!r.ok) throw new Error('Map unavailable'); return r.json(); }),
      fetch('places.json?v=5').then(r => { if (!r.ok) throw new Error('Places unavailable'); return r.json(); }),
      fetch('journey.json?v=3').then(r => { if (!r.ok) throw new Error('Journey unavailable'); return r.json(); }),
      fetch('assets/maps/visited-boundaries.json?v=1').then(r => { if (!r.ok) throw new Error('Boundaries unavailable'); return r.json(); })
    ]);
    const {places: journeyPlaces, residence, moves} = prepareJourney(journey);
    const places = [...journeyPlaces, ...savedPlaces.filter(p => ['conference', 'visit', 'travel'].includes(p.status))];
    const pinGroups = new Map();
    places.forEach(place => {
      const key = `${place.country}|${place.city}`;
      if (!pinGroups.has(key)) pinGroups.set(key, {...place, events: []});
      pinGroups.get(key).events.push(place);
    });
    const pinPlaces = [...pinGroups.values()];
    const placeById = new Map(places.map(place => [place.id, place]));
    const moveIndexById = new Map(moves.map((move, index) => [move.id, index]));
    const detail = document.querySelector('#place-detail');
    const moveSelect = document.querySelector('#journey-move');
    const routeOptions = document.querySelector('#route-options');
    const conferenceList = document.querySelector('#conference-list');
    const choiceButtons = new Map();
    const tripRoutes = prepareTripRoutes(journey, savedPlaces);
    const tripGeometry = new Map(tripRoutes.map(trip => { const interpolate = d3.geoInterpolate(...trip.coordinates); return [trip.id, {point: interpolate(.72), ahead: interpolate(.74)}]; }));
    const tripToggle = document.querySelector('#show-trip-routes');
    const drawableMoves = moves.filter(move => move.coordinates);
    const routeGeometry = new Map(drawableMoves.map(move => {
      const interpolate = d3.geoInterpolate(...move.coordinates);
      return [move.id, {point: interpolate(.58), ahead: interpolate(.60), midpoint: interpolate(.5)}];
    }));
    const svg = d3.select('#globe');
    const projection = d3.geoOrthographic().translate([320, 300]).scale(274).rotate([-180, -25]).clipAngle(90);
    const path = d3.geoPath(projection);
    const gradient = svg.append('defs').append('radialGradient').attr('id', 'ocean-color').attr('cx', '35%').attr('cy', '25%').attr('r', '85%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#b3e6ee');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#438fbc');
    svg.append('path').datum({type: 'Sphere'}).attr('class', 'ocean');
    svg.append('path').datum(d3.geoGraticule().step([15, 15])()).attr('class', 'graticule');
    svg.append('g').selectAll('path').data(world.features).join('path').attr('class', 'land').attr('id', 'land-outline');
    const boundaryByPlace = new Map();
    boundaries.features.forEach(feature => feature.properties.place_keys.forEach(key => boundaryByPlace.set(key, feature)));
    const areaFeatures = pinPlaces.filter(p => p.status !== 'conference').flatMap(place => {
      const boundary = boundaryByPlace.get(`${place.country}|${place.city}`);
      return boundary ? [{...boundary, place}] : [];
    });
    const areas = svg.append('g').attr('aria-hidden', 'true').selectAll('path').data(areaFeatures).join('path').attr('class', d => `visit-area area-${d.place.status}`);

    const routes = svg.append('g').attr('class', 'journey-routes').selectAll('path').data(drawableMoves).join('path')
      .attr('class', 'journey-route')
      .datum(m => ({type: 'LineString', coordinates: m.coordinates, move: m}));
    routes.append('title').text(d => `${d.move.label} · ${d.move.date}`);
    const travelPaths = svg.append('g').selectAll('path').data(tripRoutes).join('path').attr('class', 'trip-route').datum(trip => ({type: 'LineString', coordinates: trip.coordinates, trip}));
    travelPaths.append('title').text(d => `${d.trip.label} · ${d.trip.month} · Illustrative route from home`);
    const tripArrows = svg.append('g').attr('aria-hidden', 'true').selectAll('polygon').data(tripRoutes).join('polygon').attr('class', 'trip-arrow');
    const geographicPaths = svg.selectAll('.ocean, .graticule, .land, .visit-area, .journey-route, .trip-route');
    const arrows = svg.append('g').attr('aria-hidden', 'true').selectAll('polygon').data(drawableMoves).join('polygon').attr('class', 'journey-arrow');
    const markers = svg.append('g').selectAll('g').data(pinPlaces).join('g')
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
    let timeState = null;
    const timeSlider = document.querySelector('#journey-time');
    const timeLabel = document.querySelector('#journey-date');
    const rotationButton = document.querySelector('#rotate-globe');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let rotating = !reducedMotion.matches;
    let rotationTimer = null;
    let globeVisible = true;
    let lastRotation = 0;
    function updateRotation() {
      clearTimeout(rotationTimer);
      rotationTimer = null;
      rotationButton.textContent = rotating ? 'Pause rotation' : 'Resume rotation';
      rotationButton.setAttribute('aria-pressed', String(rotating));
      if (!rotating || document.hidden || !globeVisible) return;
      lastRotation = performance.now();
      rotationTimer = setTimeout(rotateFrame, 50);
    }
    function rotateFrame() {
      const now = performance.now();
      const rotation = projection.rotate();
      projection.rotate([rotation[0] + Math.min(now - lastRotation, 100) * .003, rotation[1], rotation[2]]);
      lastRotation = now;
      scheduleDraw();
      rotationTimer = setTimeout(rotateFrame, 50);
    }
    function pauseRotation() { rotating = false; updateRotation(); }
    rotationButton.addEventListener('click', () => { rotating = !rotating; updateRotation(); });
    document.addEventListener('visibilitychange', updateRotation);
    reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) pauseRotation(); });
    const visibilityObserver = new IntersectionObserver(entries => {
      globeVisible = entries[0].isIntersecting; updateRotation();
    });
    visibilityObserver.observe(svg.node());
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
      clearTime();
      rotating = !reducedMotion.matches; updateRotation();
      projection.rotate([-180, -25]).scale(274);
      selected = null; selectedMove = null; moveSelect.value = '';
      detail.hidden = true; status.textContent = '';
      syncSelection(); scheduleDraw();
    }
    function placeReached(p) { return p.events.some(event => event.status === 'visited' ? !timeState || timeState.visited.has(event.id) : ['visit', 'travel'].includes(event.status) ? !timeState || (event.month ? event.month <= timeState.month : event.year != null && event.year <= timeState.year) : toggle.checked); }
    function draw(projectionChanged) {
      if (projectionChanged) geographicPaths.attr('d', path);
      const center = projection.invert([320, 300]);
      routes.classed('active', d => d.move.id === selectedMove).attr('display', d => routeOptions.open && (!timeState || timeState.moveIds.has(d.move.id)) ? null : 'none');
      arrows.classed('active', m => m.id === selectedMove);
      arrows.each(function(m) {
        const {point, ahead} = routeGeometry.get(m.id);
        const visible = routeOptions.open && (!timeState || timeState.moveIds.has(m.id)) && d3.geoDistance(center, point) < Math.PI / 2 && d3.geoDistance(center, ahead) < Math.PI / 2;
        const a = projection(point), b = projection(ahead);
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        const dx = Math.cos(angle), dy = Math.sin(angle);
        d3.select(this).attr('display', visible ? null : 'none').attr('points', `${a[0]+dx*5},${a[1]+dy*5} ${a[0]-dx*4-dy*3},${a[1]-dy*4+dx*3} ${a[0]-dx*4+dy*3},${a[1]-dy*4-dx*3}`);
      });
      const showTrip = trip => tripToggle.checked && (timeState ? trip.month === timeState.month : selected ? trip.place.city === placeById.get(selected)?.city && trip.place.country === placeById.get(selected)?.country : false);
      travelPaths.attr('display', d => showTrip(d.trip) ? null : 'none');
      tripArrows.each(function(trip) {
        const {point, ahead} = tripGeometry.get(trip.id);
        const visible = showTrip(trip) && d3.geoDistance(center, point) < Math.PI / 2 && d3.geoDistance(center, ahead) < Math.PI / 2;
        const a = projection(point), b = projection(ahead), angle = Math.atan2(b[1]-a[1], b[0]-a[0]);
        const dx = Math.cos(angle), dy = Math.sin(angle);
        d3.select(this).attr('display', visible ? null : 'none').attr('points', `${a[0]+dx*6},${a[1]+dy*6} ${a[0]-dx*4-dy*3},${a[1]-dy*4+dx*3} ${a[0]-dx*4+dy*3},${a[1]-dy*4-dx*3}`);
      });
      areas.attr('display', d => placeReached(d.place) ? null : 'none');
      markers.each(function(p) {
        const visible = placeReached(p) && d3.geoDistance(center, p.coordinates) < Math.PI / 2;
        const point = projection(p.coordinates);
        d3.select(this).attr('transform', `translate(${point[0]},${point[1]}) scale(.8)`).attr('display', visible ? null : 'none')
          .attr('tabindex', visible ? 0 : -1).classed('selected', p.city === placeById.get(selected)?.city && p.country === placeById.get(selected)?.country);
      });
    }
    function selectPlace(p) {
      pauseRotation(); clearTime();
      selectedMove = null;
      moveSelect.value = '';
      selected = p.id;
      projection.rotate([-p.coordinates[0], -p.coordinates[1]]).scale(274);
      syncSelection();
      detail.replaceChildren(); detail.hidden = false;
      const flag = p.country_code ? [...p.country_code].map(letter => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('') + ' ' : '';
      const title = document.createElement('h3'); title.textContent = `${flag}${p.city}, ${p.country}`; detail.append(title);
      const note = document.createElement('p'); note.textContent = p.note; detail.append(note);
      const related = places.filter(other => other.id !== p.id && other.status !== 'conference' && other.country === p.country && other.city === p.city).sort((a,b) => (b.month || String(b.year || '')).localeCompare(a.month || String(a.year || '')));
      if (related.length) {
        const history = document.createElement('ul'); history.className = 'place-history';
        related.forEach(other => { const item = document.createElement('li'); item.textContent = other.note; history.append(item); });
        detail.append(history);
      }
      if (p.summary_notes?.length) { const memo = document.createElement('p'); memo.textContent = p.summary_notes.join(' · '); detail.append(memo); }
      const boundary = boundaryByPlace.get(`${p.country}|${p.city}`);
      if (boundary) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'boundary-zoom';
        button.textContent = `View ${boundary.properties.kind.toLowerCase()} boundary`;
        button.addEventListener('click', () => {
          const center = d3.geoCentroid(boundary);
          const bounds = d3.geoBounds(boundary);
          const radius = Math.max(...[bounds[0], bounds[1], [bounds[0][0],bounds[1][1]], [bounds[1][0],bounds[0][1]]].map(point => d3.geoDistance(center, point)));
          projection.rotate([-center[0], -center[1]]).scale(Math.max(500, Math.min(40000, 170 / Math.max(radius, .004))));
          pauseRotation(); scheduleDraw();
        });
        detail.append(button);
      }
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
      pauseRotation(); clearTime();
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
    tripToggle.addEventListener('change', () => scheduleDraw(false));
    routeOptions.addEventListener('toggle', () => scheduleDraw(false));
    moveSelect.addEventListener('change', () => showMove(moveIndexById.get(moveSelect.value)));
    document.querySelector('#previous-move').addEventListener('click', () => {
      const index = moveIndexById.get(selectedMove) ?? -1; showMove(index <= 0 ? moves.length - 1 : index - 1);
    });
    document.querySelector('#next-move').addEventListener('click', () => {
      const index = moveIndexById.get(selectedMove) ?? -1; showMove((index + 1) % moves.length);
    });
    const countryList = document.querySelector('#visited-list'); countryList.replaceChildren();
    const countryGroups = new Map();
    places.filter(p => p.status !== 'conference').forEach(p => {
      if (!countryGroups.has(p.country)) countryGroups.set(p.country, new Map());
      const cities = countryGroups.get(p.country);
      const name = p.city.replace(' / Redmond', '');
      if (!cities.has(name)) cities.set(name, []);
      cities.get(name).push(p);
    });
    function placeButton(place, label) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'place-choice';
      button.textContent = label; button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => selectPlace(place)); choiceButtons.set(place.id, button);
      return button;
    }
    countryGroups.forEach((cities, country) => {
      const countryDetails = document.createElement('details'); countryDetails.className = 'country-places';
      const summary = document.createElement('summary');
      const name = document.createElement('span'); name.textContent = country;
      const count = document.createElement('span'); count.className = 'count'; count.textContent = cities.size;
      const plus = document.createElement('span'); plus.className = 'plus'; plus.setAttribute('aria-hidden', 'true'); plus.textContent = '+';
      summary.append(name, count, plus); countryDetails.append(summary);
      cities.forEach((entries, city) => {
        const cityDetails = document.createElement('details'); cityDetails.className = 'city-places';
        const label = document.createElement('summary');
        const cityName = document.createElement('span'); cityName.textContent = city;
        const cityPlus = document.createElement('span'); cityPlus.className = 'plus'; cityPlus.setAttribute('aria-hidden', 'true'); cityPlus.textContent = '+';
        label.append(cityName, cityPlus); cityDetails.append(label);
        entries.sort((a,b) => (b.month || String(b.year || '')) .localeCompare(a.month || String(a.year || ''))).forEach(p => cityDetails.append(placeButton(p, p.note)));
        countryDetails.append(cityDetails);
      });
      countryList.append(countryDetails);
    });
    conferenceList.replaceChildren();
    places.filter(p => p.status === 'conference').forEach(p => conferenceList.append(placeButton(p, `${p.city} · ${p.note}`)));
    document.querySelector('#close-place').addEventListener('click', () => { detail.hidden = true; });
    toggle.addEventListener('change', () => {
      conferenceList.hidden = !toggle.checked;
      if (!toggle.checked && placeById.get(selected)?.status === 'conference') {
        selected = null; detail.hidden = true; status.textContent = ''; syncSelection();
      }
      scheduleDraw(false);
    });
    svg.call(d3.drag().on('start', pauseRotation).on('drag', event => {
      const rotation = projection.rotate(); const factor = 60 / projection.scale();
      projection.rotate([rotation[0] + event.dx * factor, Math.max(-85, Math.min(85, rotation[1] - event.dy * factor))]); scheduleDraw();
    }));
    function zoom(factor) { pauseRotation(); projection.scale(Math.max(180, Math.min(40000, projection.scale() * factor))); scheduleDraw(); }
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
      if (handled) { pauseRotation(); event.preventDefault(); projection.rotate(rotation); scheduleDraw(); }
    });
    document.querySelector('#zoom-in').addEventListener('click', () => zoom(1.15));
    document.querySelector('#zoom-out').addEventListener('click', () => zoom(1 / 1.15));
    document.querySelector('#reset-globe').addEventListener('click', resetView);
    const timeline = renderResidenceTimeline(residence, id => {
      const place = placeById.get(id);
      if (place) selectPlace(place);
    });
    const now = new Date();
    timeSlider.min = residence.start_year * 12;
    timeSlider.max = now.getUTCFullYear() * 12 + now.getUTCMonth();
    timeSlider.value = timeSlider.max;
    timeSlider.disabled = false;
    timeSlider.setAttribute('aria-valuetext', 'All years');
    const monthFormatter = new Intl.DateTimeFormat('en-US', {month: 'short', year: 'numeric', timeZone: 'UTC'});
    function clearTime() {
      timeState = null; focusedStop = null;
      timeLabel.textContent = 'All years';
      timeSlider.value = timeSlider.max;
      timeSlider.setAttribute('aria-valuetext', 'All years');
      timeline.setDate(null);
    }
    let focusedStop = null;
    function showMonth() {
      pauseRotation();
      const value = Number(timeSlider.value);
      const date = new Date(Date.UTC(Math.floor(value / 12), value % 12, 1));
      const month = date.toISOString().slice(0, 7);
      timeState = journeyAtMonth(journey, month);
      timeState.year = date.getUTCFullYear();
      timeState.month = month;
      const stop = timeState.active;
      const location = stop && journey.locations[stop.location];
      const label = `${monthFormatter.format(date)} · ${location ? location.city : 'Location unknown'}`;
      timeLabel.textContent = label;
      timeSlider.setAttribute('aria-valuetext', label);
      timeline.setDate(date);
      selected = stop?.location || null;
      selectedMove = null; moveSelect.value = '';
      let projectionChanged = false;
      if (stop?.id !== focusedStop && location?.coordinates) {
        projection.rotate([-location.coordinates[0], -location.coordinates[1]]);
        projectionChanged = true;
      }
      focusedStop = stop?.id;
      detail.hidden = true;
      status.textContent = label + (stop?.note ? ` · ${stop.note}` : '');
      syncSelection(); scheduleDraw(projectionChanged);
    }
    timeSlider.addEventListener('input', showMonth);
    document.querySelector('#all-years').addEventListener('click', () => {
      clearTime(); focusedStop = null; selected = null; selectedMove = null;
      moveSelect.value = ''; detail.hidden = true; status.textContent = '';
      syncSelection(); scheduleDraw(false);
    });
    svg.on('focusin', pauseRotation);
    scheduleDraw(); updateRotation();
  } catch (error) {
    status.classList.add('load-error');
    status.textContent = 'The globe could not load. Please reload the page.';
    console.error(error);
  }
}
initializeGlobe();
