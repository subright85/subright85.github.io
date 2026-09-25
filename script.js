// One lightweight, keyboard- and touch-accessible explanation at a time.
let activeSummary = null;
let pinnedSummary = false;
let summaryCloseTimer = null;
function closeSummary() {
  clearTimeout(summaryCloseTimer);
  if (!activeSummary) return;
  activeSummary.querySelector('.paper-tooltip').hidden = true;
  activeSummary.querySelector('button').setAttribute('aria-expanded', 'false');
  activeSummary = null;
  pinnedSummary = false;
}
function openSummary(wrapper) {
  clearTimeout(summaryCloseTimer);
  if (activeSummary !== wrapper) closeSummary();
  activeSummary = wrapper;
  const button = wrapper.querySelector('button');
  const tip = wrapper.querySelector('.paper-tooltip');
  tip.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  const rect = button.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const width = Math.min(410, viewportWidth - 32);
  tip.style.width = `${width}px`;
  tip.style.left = `${Math.max(16, Math.min(rect.right - width, viewportWidth - width - 16))}px`;
  const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
  const safeTop = Math.max(16, headerBottom + 12);
  tip.style.maxHeight = `${Math.max(40, window.innerHeight - safeTop - 16)}px`;
  const height = tip.getBoundingClientRect().height;
  const above = rect.top - height - 12;
  const below = Math.min(rect.bottom + 12, window.innerHeight - height - 16);
  tip.style.top = `${above >= safeTop ? above : Math.max(safeTop, below)}px`;
}
document.querySelectorAll('.paper-explanation').forEach(wrapper => {
  const button = wrapper.querySelector('button');
  wrapper.addEventListener('mouseenter', () => openSummary(wrapper));
  wrapper.addEventListener('mouseleave', () => {
    if (!pinnedSummary && !wrapper.contains(document.activeElement)) summaryCloseTimer = setTimeout(closeSummary, 150);
  });
  button.addEventListener('focus', () => openSummary(wrapper));
  button.addEventListener('click', () => {
    if (activeSummary === wrapper && pinnedSummary) closeSummary();
    else { openSummary(wrapper); pinnedSummary = true; }
  });
  wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget) && !pinnedSummary) closeSummary(); });
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSummary(); });
document.addEventListener('click', event => { if (activeSummary && !activeSummary.contains(event.target)) closeSummary(); });
window.addEventListener('resize', closeSummary);
window.addEventListener('scroll', closeSummary, {passive: true});
document.querySelectorAll('.year-group').forEach(group => group.addEventListener('toggle', closeSummary));

const toolbar = document.querySelector('.publication-toolbar');
const search = document.querySelector('#paper-search');
const groups = [...document.querySelectorAll('.year-group')];
const count = document.querySelector('#result-count');
const empty = document.querySelector('#no-results');
let previousState = null;
toolbar.hidden = false;
document.querySelector('#year').textContent = new Date().getFullYear();
let publicationScope = 'selected';
const scopeControls = document.querySelector('.publication-scope');
scopeControls.hidden = false;
function filterPublications() {
  closeSummary();
  const query = search.value.toLocaleLowerCase().trim();
  if (query && !previousState) previousState = groups.map(group => group.open);
  let matches = 0;
  groups.forEach((group, index) => {
    let found = 0;
    group.querySelectorAll('.paper').forEach(paper => {
      const inScope = publicationScope === 'all' || paper.dataset.selected === 'true';
      const match = inScope && (!query || `${group.dataset.year} ${paper.dataset.year || ''} ${paper.textContent}`.toLocaleLowerCase().includes(query));
      paper.hidden = !match;
      if (match) found++;
    });
    group.hidden = found === 0;
    group.querySelector('.count').textContent = `${found} paper${found === 1 ? '' : 's'}`;
    if (query) group.open = true;
    else if (previousState) group.open = previousState[index];
    matches += found;
  });
  if (!query) previousState = null;
  count.textContent = `${matches} publication${matches === 1 ? '' : 's'}`;
  empty.hidden = matches !== 0;
}
search.addEventListener('input', filterPublications);
scopeControls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
  publicationScope = button.dataset.scope;
  scopeControls.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#publications h2').textContent = publicationScope === 'selected' ? 'Selected publications' : 'Publications';
  filterPublications();
}));
filterPublications();

// Track the section nearest the sticky header at every viewport shape.
const sections = [...document.querySelectorAll('main > section')];
const navLinks = [...document.querySelectorAll('nav a')];
let navigationFrame = null;
function updateNavigation() {
  const headerEdge = document.querySelector('.header').getBoundingClientRect().bottom + 24;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  const current = atBottom ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= headerEdge).at(-1) || sections[0];
  navLinks.forEach(link => {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navigationFrame = null;
}
function scheduleNavigation() {
  if (navigationFrame === null) navigationFrame = requestAnimationFrame(updateNavigation);
}
window.addEventListener('scroll', scheduleNavigation, { passive: true });
window.addEventListener('resize', scheduleNavigation);
updateNavigation();

// Fit the compact chart to its container without scaling down text or centering
// a narrow fixed-size drawing inside a wider viewport.
const compactChart = document.querySelector('.career-chart-mobile');
if (compactChart && 'ResizeObserver' in window) {
  const coordinates = [...compactChart.querySelectorAll('text, line, rect, circle')].map(node => ({
    node,
    values: Object.fromEntries(['x', 'x1', 'x2', 'cx', 'width']
      .filter(attribute => node.hasAttribute(attribute))
      .map(attribute => [attribute, Number(node.getAttribute(attribute))]))
  }));
  const chartObserver = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (width <= 0) return;
    const scale = Math.max(1, width - 68) / 278;
    compactChart.setAttribute('viewBox', `0 0 ${width} 170`);
    coordinates.forEach(({ node, values }) => {
      Object.entries(values).forEach(([attribute, original]) => {
        const adjusted = attribute === 'width' ? original * scale
          : original >= 56 ? 56 + (original - 56) * scale : original;
        node.setAttribute(attribute, adjusted.toFixed(2));
      });
    });
  });
  chartObserver.observe(compactChart.parentElement);
}

const carousel = document.querySelector('.profile');
const slides = [...carousel.querySelectorAll('.photo-slide')];
if (slides.length > 1) {
  const controls = carousel.querySelector('.photo-controls');
  const dots = carousel.querySelector('.photo-dots');
  let activePhoto = 0;
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show photo ${index + 1}`);
    button.addEventListener('click', () => showPhoto(index));
    dots.append(button);
    return button;
  });
  function showPhoto(index) {
    activePhoto = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== activePhoto;
      buttons[i].setAttribute('aria-pressed', String(i === activePhoto));
    });
  }
  controls.hidden = false;
  carousel.querySelector('.photo-prev').addEventListener('click', () => showPhoto(activePhoto - 1));
  carousel.querySelector('.photo-next').addEventListener('click', () => showPhoto(activePhoto + 1));
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(activePhoto + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  let touchStart = null;
  carousel.addEventListener('touchstart', event => { touchStart = event.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 45) showPhoto(activePhoto + (distance < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  showPhoto(0);
}
