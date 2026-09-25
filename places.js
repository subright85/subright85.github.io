async function initializeGlobe() {
  const status = document.querySelector('#globe-status');
  try {
    const [world, places, boundaries, countryBorders] = await Promise.all([
      fetch('assets/maps/land-natural.json?v=1').then(r => { if (!r.ok) throw new Error('Map unavailable'); return r.json(); }),
      fetch('visited-places.json?v=1').then(r => { if (!r.ok) throw new Error('Places unavailable'); return r.json(); }),
      fetch('assets/maps/visited-boundaries.json?v=2').then(r => { if (!r.ok) throw new Error('Boundaries unavailable'); return r.json(); }),
      fetch('assets/maps/country-borders.json?v=1').then(r => { if (!r.ok) throw new Error('Borders unavailable'); return r.json(); })
    ]);
    const placeCategory = p => ({visited: 'Lived', visit: 'Conference', travel: 'Trip'}[p.status] || '');
    const pinGroups = new Map();
    places.forEach(place => {
      const key = `${place.country}|${place.city}`;
      if (!pinGroups.has(key)) pinGroups.set(key, {...place, events: []});
      pinGroups.get(key).events.push(place);
    });
    const pinPlaces = [...pinGroups.values()];
    const placeById = new Map(places.map(place => [place.id, place]));
    const detail = document.querySelector('#place-detail');
    const choiceButtons = new Map();
    const svg = d3.select('#globe');
    const projection = d3.geoOrthographic().translate([320, 300]).scale(274).rotate([-180, -25]).clipAngle(90).clipExtent([[0, 0], [640, 600]]);
    const path = d3.geoPath(projection);
    let detailCoast = null, detailCoastRequest = null;
    function loadDetailCoast() {
      if (!detailCoastRequest) detailCoastRequest = fetch('assets/maps/land-detail.json?v=1').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { detailCoast = data.features[0]; scheduleDraw(); }).catch(() => { detailCoastRequest = null; });
    }
    const gradient = svg.append('defs').append('radialGradient').attr('id', 'ocean-color').attr('gradientUnits', 'userSpaceOnUse').attr('cx', 224).attr('cy', 150).attr('r', 544);
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#b3e6ee');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#438fbc');
    svg.append('path').datum({type: 'Sphere'}).attr('class', 'ocean');
    svg.append('path').datum(d3.geoGraticule().step([15, 15])()).attr('class', 'graticule');
    svg.append('g').selectAll('path').data(world.features).join('path').attr('class', 'land').attr('id', 'land-outline');
    // Clip colored administrative areas to the land actually shown at this zoom.
    // Keep source polygons intact: municipal limits can legitimately include water.
    const landMask = svg.select('defs').append('mask').attr('id', 'visible-land').attr('maskUnits', 'userSpaceOnUse').attr('x', 0).attr('y', 0).attr('width', 640).attr('height', 600).attr('style', 'mask-type:luminance');
    const maskBase = landMask.append('path').attr('fill', 'white');
    const maskCoverage = landMask.append('path').attr('fill', 'black');
    const maskCoast = landMask.append('path').attr('fill', 'white');
    let localCoast = null, localCoverage = null;
    const boundaryByPlace = new Map();
    boundaries.features.forEach(feature => feature.properties.place_keys.forEach(key => boundaryByPlace.set(key, feature)));
    const localBasemap = svg.append('g').attr('aria-hidden', 'true');
    const contextLayer = svg.append('g').attr('class', 'neighbor-boundaries').attr('aria-hidden', 'true').attr('mask', 'url(#visible-land)');
    const contextLabels = svg.append('g').attr('class', 'neighbor-labels').attr('aria-hidden', 'true');
    const regionCache = new Map();
    let activeRegion = null;
    let regionalShapes = new Map();
    function loadRegion(boundary) {
      const slug = boundary?.properties.region;
      if (!slug || activeRegion === slug) return;
      activeRegion = slug;
      regionalShapes = new Map();
      localCoast = null; localCoverage = null;
      localBasemap.selectAll('*').remove();
      contextLayer.selectAll('*').remove(); contextLabels.selectAll('*').remove();
      if (!regionCache.has(slug)) regionCache.set(slug, fetch(`assets/maps/neighbors/${slug}.json?v=1`).then(r => {
        if (!r.ok) throw new Error('Region unavailable'); return r.json();
      }).catch(error => { regionCache.delete(slug); throw error; }));
      regionCache.get(slug).then(raw => {
        const data = topojson.feature(raw, raw.objects.regions);
        if (activeRegion !== slug) return;
        if (raw.objects.coast && raw.objects.coverage) {
          localCoverage = topojson.feature(raw, raw.objects.coverage);
          localCoast = topojson.feature(raw, raw.objects.coast);
          localBasemap.append('path').datum(localCoverage).attr('class', 'local-sea');
          localBasemap.append('path').datum(localCoast).attr('class', 'local-land');
        }
        data.features.forEach(feature => feature.properties.place_keys.forEach(key => {
          if (!regionalShapes.has(key)) regionalShapes.set(key, {type: 'MultiPolygon', coordinates: []});
          regionalShapes.get(key).coordinates.push(...(feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates));
        }));
        contextLayer.selectAll('path').data(data.features).join('path').attr('class', 'neighbor-boundary');
        contextLabels.selectAll('text').data(data.features.filter(f => !f.properties.place_keys.length).map(f => ({name: f.properties.name, center: d3.geoCentroid(f)}))).join('text').text(d => d.name);
        scheduleDraw();
      }).catch(() => { if (activeRegion === slug) activeRegion = null; });
    }
    function loadNearestRegion() {
      const center = projection.invert([320, 300]);
      const nearest = pinPlaces.filter(p => p.status !== 'conference').reduce((best, place) => !best || d3.geoDistance(center, place.coordinates) < d3.geoDistance(center, best.coordinates) ? place : best, null);
      if (nearest && d3.geoDistance(center, nearest.coordinates) < .15) loadRegion(boundaryByPlace.get(`${nearest.country}|${nearest.city}`));
    }
    const areaFeatures = pinPlaces.filter(p => p.status !== 'conference').flatMap(place => {
      const boundary = boundaryByPlace.get(`${place.country}|${place.city}`);
      return boundary ? [{...boundary, place}] : [];
    });
    const areas = svg.append('g').attr('class', 'visited-areas').attr('mask', 'url(#visible-land)').attr('aria-hidden', 'true').selectAll('path').data(areaFeatures).join('path').attr('class', d => `visit-area area-${d.place.status}`);
    contextLayer.raise(); contextLabels.raise();
    const countryLines = svg.append('path').datum(countryBorders).attr('class', 'country-boundaries').attr('mask', 'url(#visible-land)').attr('aria-hidden', 'true');

    const geographicPaths = svg.selectAll('.ocean, .graticule, .land, .visit-area, .country-boundaries');
    const markers = svg.append('g').selectAll('g').data(pinPlaces).join('g')
      .attr('class', p => `place-marker ${p.status}`).attr('role', 'button')
      .attr('aria-label', p => `${p.city}, ${p.country}. ${placeCategory(p)}${p.status === 'conference' ? '. Conference location; visit unconfirmed' : ''}`)
      .on('click', (event, p) => selectPlace(p)).on('keydown', (event, p) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); selectPlace(p); }
      });
    markers.append('title').text(p => `${p.city} · ${placeCategory(p)}`);
    markers.append('circle').attr('class', 'pin-hit').attr('cy', -9).attr('r', 13);
    markers.append('path').attr('class', 'pin-body').attr('d', 'M0 1C-2-2-8-7-8-12a8 8 0 1 1 16 0C8-7 2-2 0 1Z');
    markers.append('circle').attr('class', 'pin-center').attr('cy', -12).attr('r', 2.8);
    let selected = null;
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
      projection.rotate([rotation[0] + Math.min(now - lastRotation, 100) * .003 * Math.min(1, 274 / projection.scale()), rotation[1], rotation[2]]);
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
      rotating = !reducedMotion.matches; updateRotation();
      projection.rotate([-180, -25]).scale(274);
      selected = null;
      detail.hidden = true; status.textContent = '';
      syncSelection(); scheduleDraw();
    }
    function draw(projectionChanged) {
      if (projectionChanged) { svg.select('#land-outline').datum(projection.scale() > 1000 && detailCoast ? detailCoast : world.features[0]); geographicPaths.attr('d', path); }
      const center = projection.invert([320, 300]);
      const localView = projection.scale() > 1500;
      countryLines.attr('display', localView ? 'none' : null);
      if (projectionChanged) {
        maskBase.datum(projection.scale() > 1000 && detailCoast ? detailCoast : world.features[0]).attr('d', path);
        maskCoverage.datum(localView ? localCoverage : null).attr('d', path);
        maskCoast.datum(localView ? localCoast : null).attr('d', path);
      }
      localBasemap.attr('display', localView ? null : 'none');
      contextLayer.attr('display', localView ? null : 'none');
      contextLabels.attr('display', localView ? null : 'none');
      if (projectionChanged && localView) {
        localBasemap.selectAll('path').attr('d', path);
        contextLayer.selectAll('path').attr('d', path);
        areas.attr('d', d => path(regionalShapes.get(`${d.place.country}|${d.place.city}`) || d));
        const occupied = [];
        contextLabels.selectAll('text').each(function(d) {
          const [x, y] = projection(d.center);
          const width = Math.min(110, (d.name || '').length * 5);
          const visible = x > 18 && x < 622 && y > 22 && y < 578 && d3.geoDistance(center, d.center) < Math.PI / 2 && !occupied.some(box => Math.abs(box.x-x) < (box.width+width)/2+8 && Math.abs(box.y-y) < 20);
          if (visible) occupied.push({x, y, width});
          d3.select(this).attr('x', x).attr('y', y).attr('display', visible ? null : 'none');
        });
      }
      markers.each(function(p) {
        const visible = d3.geoDistance(center, p.coordinates) < Math.PI / 2;
        const point = projection(p.coordinates);
        d3.select(this).attr('transform', `translate(${point[0]},${point[1]}) scale(.8)`).attr('display', visible ? null : 'none')
          .attr('tabindex', visible ? 0 : -1).classed('selected', p.city === placeById.get(selected)?.city && p.country === placeById.get(selected)?.country);
      });
    }
    function selectPlace(p) {
      pauseRotation();
      selected = p.id;
      if (projection.scale() <= 1500 || d3.geoDistance(projection.invert([320,300]), p.coordinates) > .15) projection.rotate([-p.coordinates[0], -p.coordinates[1]]).scale(274);
      syncSelection();
      detail.replaceChildren(); detail.hidden = false;
      const flag = p.country_code ? [...p.country_code].map(letter => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('') + ' ' : '';
      const title = document.createElement('h3'); title.textContent = `${flag}${p.city}, ${p.country}`; detail.append(title);
      const note = document.createElement('p'); note.textContent = placeCategory(p); detail.append(note);
      const boundary = boundaryByPlace.get(`${p.country}|${p.city}`);
      if (boundary) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'boundary-zoom';
        button.textContent = `View ${boundary.properties.kind.toLowerCase()} boundary`;
        button.addEventListener('click', () => {
          const center = d3.geoCentroid(boundary);
          const bounds = d3.geoBounds(boundary);
          const radius = Math.max(...[bounds[0], bounds[1], [bounds[0][0],bounds[1][1]], [bounds[1][0],bounds[0][1]]].map(point => d3.geoDistance(center, point)));
          projection.rotate([-center[0], -center[1]]).scale(Math.max(500, Math.min(1000000, 210 / Math.max(radius, .00008))));
          detail.hidden = true;
          status.textContent = `${p.city} · ${boundary.properties.kind} boundary`;
          loadDetailCoast(); loadRegion(boundary); pauseRotation(); scheduleDraw();
        });
        detail.append(button);
      }
      status.textContent = `${p.city} · ${placeCategory(p)}${p.status === 'conference' ? ' · Visit unconfirmed' : ''}`;
      scheduleDraw();
    }
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
      cities.forEach((entries, city) => countryDetails.append(placeButton(entries[0], city)));
      countryList.append(countryDetails);
    });
    document.querySelector('#close-place').addEventListener('click', () => { detail.hidden = true; });
    svg.call(d3.drag().on('start', pauseRotation).on('drag', event => {
      const rotation = projection.rotate(); const factor = 60 / projection.scale();
      projection.rotate([rotation[0] + event.dx * factor, Math.max(-85, Math.min(85, rotation[1] - event.dy * factor))]); scheduleDraw();
    }).on('end', () => { if (projection.scale() > 1500) loadNearestRegion(); }));
    function zoom(factor) { pauseRotation(); if (projection.scale() * factor > 1000) loadDetailCoast(); projection.scale(Math.max(180, Math.min(1000000, projection.scale() * factor))); if (projection.scale() > 1500) loadNearestRegion(); scheduleDraw(); }
    svg.on('wheel', event => { event.preventDefault(); zoom(Math.exp(-event.deltaY * .001)); }, {passive: false});
    svg.on('keydown', event => {
      const rotation = projection.rotate(); let handled = true;
      const step = Math.min(10, 2800 / projection.scale());
      if (event.key === 'ArrowLeft') rotation[0] -= step;
      else if (event.key === 'ArrowRight') rotation[0] += step;
      else if (event.key === 'ArrowUp') rotation[1] = Math.min(85, rotation[1] + step);
      else if (event.key === 'ArrowDown') rotation[1] = Math.max(-85, rotation[1] - step);
      else if (event.key === '+' || event.key === '=') zoom(1.15);
      else if (event.key === '-') zoom(1 / 1.15);
      else handled = false;
      if (handled) { pauseRotation(); event.preventDefault(); projection.rotate(rotation); if (projection.scale() > 1500) loadNearestRegion(); scheduleDraw(); }
    });
    document.querySelector('#zoom-in').addEventListener('click', () => zoom(1.15));
    document.querySelector('#zoom-out').addEventListener('click', () => zoom(1 / 1.15));
    document.querySelector('#reset-globe').addEventListener('click', resetView);
    svg.on('focusin', pauseRotation);
    scheduleDraw(); updateRotation();
  } catch (error) {
    status.classList.add('load-error');
    status.textContent = 'The globe could not load. Please reload the page.';
    console.error(error);
  }
}
initializeGlobe();
