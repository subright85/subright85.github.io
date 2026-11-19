// Coalesce input bursts into one render using the latest state.
function createFrameScheduler(render, requestFrame = callback => requestAnimationFrame(callback), cancelFrame = id => cancelAnimationFrame(id)) {
  let frame = null;
  let latestArgs;
  return {
    schedule(...args) {
      latestArgs = args;
      if (frame !== null) return;
      frame = requestFrame(() => {
        frame = null;
        render(...latestArgs);
      });
    },
    cancel() {
      if (frame !== null) cancelFrame(frame);
      frame = null;
    }
  };
}
if (typeof module !== 'undefined') module.exports = {createFrameScheduler};

// Render geography on a single logical pixel grid, then enlarge without smoothing.
// No screen-space texture: coastlines, shelves and country fills share the rotation.
function createPixelGlobe(svg, projection) {
  const factor = 2, width = 320, height = 300;
  const surface = svg.append('foreignObject').attr('class', 'pixel-globe')
    .attr('width', 640).attr('height', 600).attr('aria-hidden', 'true');
  const canvas = surface.append('xhtml:canvas').attr('width', width).attr('height', height).node();
  const context = canvas.getContext('2d', {willReadFrequently: true});
  const surfaceProjection = d3.geoOrthographic().clipAngle(90).clipExtent([[0, 0], [width, height]]);
  const surfacePath = d3.geoPath(surfaceProjection, context);
  function paint(geometry, color) {
    context.beginPath(); surfacePath(geometry); context.fillStyle = color; context.fill();
  }
  function coast(land, color, width) {
    context.beginPath(); surfacePath(land);
    context.strokeStyle = color; context.lineWidth = width; context.lineJoin = 'round'; context.stroke();
  }
  return {
    visible(show) { surface.attr('display', show ? null : 'none'); },
    draw(land, borders, visitedCountries = []) {
      const [tx, ty] = projection.translate().map(value => value / factor);
      const radius = projection.scale() / factor;
      surfaceProjection.translate([tx, ty]).scale(radius).rotate(projection.rotate());
      context.clearRect(0, 0, width, height);
      context.save();
      context.beginPath(); surfacePath({type: 'Sphere'}); context.clip();
      paint({type: 'Sphere'}, '#367f98');
      // Two shallow-water bands trace the actual coastline, including during rotation.
      coast(land, '#459da9', 7);
      coast(land, '#75b9b2', 3.5);
      coast(land, '#d0d8b9', 1.5);
      paint(land, '#a4b4ac');
      context.save();
      context.beginPath(); surfacePath(land); context.clip();
      visitedCountries.forEach(country => {
        paint(country, country.properties.souvenirColor || '#91b86e');
      });
      // A one-pixel coastal bevel gives land weight without adding a grid or noise.
      coast(land, '#e1dec0', 1);
      context.restore();
      context.restore();
      const frame = context.getImageData(0, 0, width, height);
      const pixels = frame.data;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          if (!pixels[i + 3]) continue;
          const nx = (x + .5 - tx) / radius, ny = (y + .5 - ty) / radius;
          const r2 = nx * nx + ny * ny;
          if (r2 > 1 || pixels[i + 3] < 96) { pixels[i + 3] = 0; continue; }
          const nz = Math.sqrt(1 - r2);
          // Restricted, hue-shifted light ramps: broad tones, no random pixel mottling.
          const light = Math.max(0, -.32 * nx - .42 * ny + .85 * nz);
          const band = Math.min(5, Math.floor(light * 6));
          const gain = [.69, .77, .85, .93, 1, 1.05][band];
          pixels[i] = Math.round(pixels[i] * gain);
          pixels[i + 1] = Math.round(pixels[i + 1] * gain);
          pixels[i + 2] = Math.round(pixels[i + 2] * gain + (1 - gain) * 24);
          pixels[i + 3] = 255;
        }
      }
      context.putImageData(frame, 0, 0);
    }
  };
}

// Generated city illustrations are anchored geographically, never nudged to avoid overlap.
function createCountryDecorations(svg, projection, topology, places, selectPlace) {
  const aliases = {USA: 'United States of America'};
  const palette = {Canada: '#d9987d', USA: '#daba72', 'South Korea': '#d68f9e', China: '#91b86e',
    Malaysia: '#c7afe5', Maldives: '#edb995', Mexico: '#eeb674', Singapore: '#efa2a0',
    Spain: '#e4b0cf', Taiwan: '#f4d17d', 'United Kingdom': '#b7b5e5'};
  const cityArt = {
    'Anaheim, CA': ['us', 0, 'Fairytale castle', [-117.9189, 33.8121]],
    'Anchorage, AK': ['us', 1, 'Moose and mountain'],
    'Aspen, CO': ['us', 2, 'Aspen trees and chalet'],
    'Boston, MA': ['us', 3, 'Historic Boston'],
    'Hawaii Island': ['us', 4, 'Kilauea volcano', [-155.287, 19.421]],
    'Honolulu, Hawaii': ['us', 5, 'Diamond Head', [-157.805, 21.262]],
    'Kauai, Hawaii': ['us', 6, 'Na Pali coast', [-159.65, 22.17]],
    'Lake Tahoe': ['us', 7, 'Lake Tahoe'],
    'Las Vegas, NV': ['us', 8, 'Las Vegas skyline'],
    'Long Beach, CA': ['us', 9, 'Queen Mary', [-118.1897, 33.7527]],
    'Maui, Hawaii': ['us', 10, 'Maui waterfall'],
    'Mendocino, CA': ['us', 11, 'Coastal cottage'],
    'Napa, CA': ['us', 12, 'Napa vineyard'],
    'Reno, NV': ['us', 13, 'Reno arch', [-119.813, 39.529]],
    'Sacramento, CA': ['us', 14, 'Tower Bridge', [-121.507, 38.580]],
    'San Diego, CA': ['us', 15, 'San Diego seaside'],
    'San Jose': ['cities', 0, 'San Jose city souvenir'],
    'Seattle / Redmond': ['cities', 1, 'Space Needle', [-122.3493, 47.6205]],
    'Washington, DC': ['cities', 2, 'US Capitol', [-77.0091, 38.8899]],
    'Yosemite National Park': ['cities', 3, 'Half Dome', [-119.533, 37.746]],
    'Niagara Falls': ['cities', 4, 'Horseshoe Falls', [-79.074, 43.079]],
    'Toronto': ['world', 0, 'Maple beaver souvenir'],
    'Beijing': ['world', 3, 'Panda souvenir'],
    'Hong Kong': ['cities', 7, 'Victoria Harbour', [114.17, 22.29]],
    'Qingdao': ['cities', 8, 'Zhanqiao pavilion', [120.317, 36.06]],
    'Shanghai': ['cities', 9, 'Oriental Pearl Tower', [121.4998, 31.2397]],
    'Kota Kinabalu': ['cities', 10, 'Mount Kinabalu', [116.558, 6.075]],
    'Incheon': ['cities', 11, 'Chinatown gate', [126.617, 37.475]],
    'Pohang': ['cities', 12, 'Homigot hand', [129.567, 36.077]],
    'Seoul': ['world', 2, 'Gyeongbokgung', [126.977, 37.5796]],
    'Girona': ['cities', 14, 'Onyar river houses', [2.823, 41.985]],
    'Glasgow': ['cities', 15, 'University of Glasgow', [-4.288, 55.872]],
    'New York, NY': ['world', 1, 'Statue of Liberty', [-74.0445, 40.6892]],
    'Maldives': ['world', 5, 'Island retreat'],
    'Los Cabos': ['world', 6, 'Mexico souvenir'],
    'Singapore': ['world', 7, 'Merlion', [103.8545, 1.2868]],
    'Barcelona': ['world', 8, 'Sagrada Familia', [2.1744, 41.4036]],
    'Taipei': ['world', 9, 'Taipei 101', [121.5645, 25.0339]]
  };
  const spriteBounds = {"world":[[0.116,0.2044,0.9006,0.9365],[0.1657,0.0912,0.7845,0.9613],[0.0773,0.2459,0.9337,0.9392],[0.1547,0.1713,0.9006,0.942],[0.1492,0.0939,0.9116,0.9254],[0.1077,0.1326,0.8812,0.9365],[0.1105,0.1271,0.9061,0.8978],[0.1243,0.116,0.8508,0.9171],[0.0994,0.0884,0.9199,0.9116],[0.221,0.047,0.8149,0.9199],[0.1519,0.0497,0.8204,0.9282],[0.1243,0.2127,0.8757,0.895]],"us":[[0.1754,0.1818,0.8963,0.9569],[0.1308,0.2041,0.8708,0.9601],[0.1404,0.1818,0.8293,0.9601],[0.1148,0.1659,0.8581,0.9601],[0.1021,0.1531,0.9155,0.9346],[0.185,0.1818,0.8836,0.9314],[0.0702,0.2775,0.9219,0.9027],[0.0861,0.185,0.8868,0.9187],[0.1435,0.1372,0.9059,0.8804],[0.0638,0.1627,0.9187,0.8931],[0.0638,0.201,0.9346,0.8836],[0.0702,0.1978,0.9059,0.8868],[0.2041,0.118,0.8612,0.8676],[0.0797,0.1531,0.9091,0.8421],[0.0574,0.2105,0.925,0.8517],[0.0574,0.118,0.9314,0.8549]],"cities":[[0.2105,0.2775,0.9155,0.9474],[0.2329,0.1308,0.7656,0.9282],[0.1404,0.1722,0.8612,0.9155],[0.0989,0.2807,0.8485,0.9378],[0.1244,0.2552,0.941,0.8995],[0.319,0.0574,0.6794,0.9123],[0.1372,0.1372,0.8772,0.9378],[0.118,0.1627,0.8804,0.9219],[0.1691,0.1627,0.9059,0.8517],[0.2967,0.0415,0.7049,0.9027],[0.0383,0.2233,0.925,0.8931],[0.0829,0.1563,0.9219,0.8485],[0.1595,0.0861,0.8804,0.8995],[0.051,0.1978,0.9474,0.874],[0.0957,0.1978,0.874,0.874],[0.1722,0.0191,0.8357,0.8995]]};
  const atlasFiles = {world: 'assets/globe-souvenirs.png', us: 'assets/globe-city-stickers-us.png?v=1', cities: 'assets/globe-city-stickers-world.png?v=1'};
  const countries = topojson.feature(topology, topology.objects.countries).features;
  const groups = [...new Set(places.map(p => p.country))].map(name => {
    const country = countries.find(f => f.properties.name === (aliases[name] || name));
    if (country) country.properties.souvenirColor = palette[name] || '#a4d68c';
    return {name, country, places: places.filter(p => p.country === name)};
  });
  const cityGroups = places.map(place => {
    const [atlas, icon, label, coordinates] = cityArt[place.city] || ['world', 11, 'Travel souvenir'];
    return {place, atlas, icon, label, bounds: spriteBounds[atlas][icon], coordinates: coordinates || place.coordinates};
  });
  const layer = svg.append('g').attr('class', 'country-colors').attr('aria-hidden', 'true').attr('mask', 'url(#visible-land)');
  const colors = layer.selectAll('path').data(groups.filter(d => d.country)).join('path')
    .attr('fill', d => d.country.properties.souvenirColor);
  const tooltip = d3.select(svg.node().parentNode).append('div')
    .attr('class', 'souvenir-tooltip').attr('id', 'souvenir-tooltip').attr('role', 'tooltip').attr('hidden', true);
  let hovered = null;
  function hideTooltip() { hovered = null; tooltip.attr('hidden', true); }
  function showTooltip(node, d) {
    if (!d.active) return;
    if (hovered !== d) {
    hovered = d;
    tooltip.selectAll('*').remove();
    tooltip.append('strong').text(`${d.place.city}, ${d.place.country}`);
    tooltip.append('span').attr('class', 'souvenir-caption').text(`${d.label} illustration`);
    const visits = (d.place.events || [d.place]).flatMap(p => p.visits || []);
    const lines = [...new Set(visits.map(v => `${v.date || ''} · ${v.conference || (v.kind === 'trip' ? 'Travel' : 'Visit')}${v.unconfirmed ? ' (unconfirmed)' : ''}`))];
    lines.slice(0, 3).forEach(line => tooltip.append('span').text(line));
    if (lines.length > 3) tooltip.append('span').text(`+${lines.length - 3} more visits`);
    if (!lines.length) tooltip.append('span').text({visited: 'Lived here', visit: 'Conference visit', travel: 'Travel'}[d.place.status] || 'Visited');
    tooltip.append('small').text('Click to view details');
    tooltip.attr('hidden', null);
    }
    const panel = svg.node().parentNode.getBoundingClientRect();
    const globe = svg.node().getBoundingClientRect();
    const scale = globe.width / 640;
    const bounds = d.previewBox;
    const anchor = {x: globe.x + bounds.x * scale, top: globe.y + bounds.y * scale, width: bounds.width * scale, bottom: globe.y + (bounds.y + bounds.height) * scale};
    const box = tooltip.node().getBoundingClientRect();
    const left = Math.max(8, Math.min(panel.width - box.width - 8, anchor.x + anchor.width / 2 - panel.x - box.width / 2));
    const above = anchor.top - panel.top - box.height - 12;
    tooltip.style('left', `${left}px`).style('top', `${above >= 8 ? above : anchor.bottom - panel.top + 12}px`);
  }
  const badges = svg.append('g').attr('class', 'country-souvenirs').selectAll('g').data(cityGroups).join('g')
    .attr('class', 'country-souvenir').attr('role', 'button')
    .attr('aria-label', d => `${d.place.city}, ${d.place.country}: ${d.label}`)
    .attr('aria-describedby', 'souvenir-tooltip')
    .on('mouseenter focus', function(event, d) { showTooltip(this, d); })
    .on('mouseleave blur', hideTooltip)
    .on('click', (event, d) => { hideTooltip(); event.stopPropagation(); if (d.active) selectPlace(d.place); })
    .on('keydown', (event, d) => {
      if (event.key === 'Escape') { hideTooltip(); event.stopPropagation(); }
      if ((event.key === 'Enter' || event.key === ' ') && d.active) { event.preventDefault(); event.stopPropagation(); selectPlace(d.place); }
    });
  badges.append('title').text(d => `${d.place.city} · ${d.label} illustration · View visit details`);
  badges.append('ellipse').attr('cy', 0).attr('rx', 17).attr('ry', 5).attr('fill', '#24485f30');
  badges.append('circle').attr('r', 2.5).attr('fill', '#fff5db').attr('stroke', '#63756c').attr('stroke-width', 1);
  const sprites = badges.append('svg').attr('x', d => -39 * (d.bounds[0] + d.bounds[2])).attr('y', d => -78 * d.bounds[3]).attr('width', 78).attr('height', 78)
    .attr('viewBox', d => `${(d.icon % 4) * 256} ${Math.floor(d.icon / 4) * 256} 256 256`)
    .attr('overflow', 'hidden').attr('aria-hidden', 'true');
  sprites.append('image').attr('href', d => atlasFiles[d.atlas]).attr('width', 1024)
    .attr('height', d => d.atlas === 'world' ? 768 : 1024).attr('preserveAspectRatio', 'none');
  const geoPath = d3.geoPath(projection);
  return {draw(reached, selectedId) {
    groups.forEach(d => { d.active = d.places.some(reached); });
    colors.attr('d', d => geoPath(d.country)).attr('display', d => d.active ? null : 'none');
    const center = projection.invert(projection.translate()), occupied = [];
    // Fixed geographic anchors; progressively reveal nearby cities as zoom separates them.
    badges.sort((a, b) => Number(b.place.id === selectedId) - Number(a.place.id === selectedId));
    badges.each(function(d) {
      d.active = reached(d.place);
      const [x, y] = projection(d.coordinates);
      const distance = d3.geoDistance(center, d.coordinates);
      // Keep city art legible at street zoom without letting it grow off the viewport.
      const size = Math.min(1.25, (.73 + .12 * Math.cos(distance)) * Math.pow(projection.scale() / 274, .35));
      const artworkWidth = 78 * (d.bounds[2] - d.bounds[0]) * size;
      const artworkHeight = 78 * (d.bounds[3] - d.bounds[1]) * size;
      const box = {x: x - artworkWidth / 2 - 2, y: y - artworkHeight - 2, width: artworkWidth + 4, height: artworkHeight + 4};
      d.previewBox = box;
      const visible = d.active && box.x < 640 && box.x + box.width > 0 && box.y < 600 && box.y + box.height > 0 &&
        distance < 1.4 && !occupied.some(b => box.x < b.x + b.width && box.x + box.width > b.x && box.y < b.y + b.height && box.y + box.height > b.y);
      if (visible) occupied.push(box);
      if (!visible && hovered === d) hideTooltip();
      d3.select(this).attr('transform', `translate(${x},${y}) scale(${size})`)
        .attr('display', visible ? null : 'none').attr('tabindex', visible ? 0 : -1);
      if (visible && hovered === d) showTooltip(this, d);
    });
    return groups.filter(d => d.active && d.country).map(d => d.country);
  }};
}
