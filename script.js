const toolbar = document.querySelector('.publication-toolbar');
const search = document.querySelector('#paper-search');
const groups = [...document.querySelectorAll('.year-group')];
const count = document.querySelector('#result-count');
const empty = document.querySelector('#no-results');
let previousState = null;
toolbar.hidden = false;
document.querySelector('#year').textContent = new Date().getFullYear();
search.addEventListener('input', () => {
  const query = search.value.toLocaleLowerCase().trim();
  if (query && !previousState) previousState = groups.map(group => group.open);
  let matches = 0;
  groups.forEach((group, index) => {
    let found = 0;
    group.querySelectorAll('.paper').forEach(paper => {
      const match = !query || `${group.dataset.year} ${paper.dataset.year || ''} ${paper.textContent}`.toLocaleLowerCase().includes(query);
      paper.hidden = !match;
      if (match) found++;
    });
    group.hidden = found === 0;
    group.querySelector('.count').textContent = `${found} papers`;
    if (query) group.open = true;
    else if (previousState) group.open = previousState[index];
    matches += found;
  });
  if (!query) previousState = null;
  count.textContent = `${matches} publication${matches === 1 ? '' : 's'}`;
  empty.hidden = matches !== 0;
});

// Timeline chapters are ordinary buttons, usable by mouse, touch, or keyboard.
const journeyRows = [...document.querySelectorAll('.journey-row')];
const journeyDetail = document.querySelector('#journey-detail');
journeyRows.forEach(row => {
  row.addEventListener('click', () => {
    journeyRows.forEach(chapter => {
      const selected = chapter === row;
      chapter.classList.toggle('selected', selected);
      chapter.setAttribute('aria-pressed', String(selected));
    });
    journeyDetail.querySelector('h3').textContent = row.dataset.org;
    journeyDetail.querySelector('.detail-date').textContent = row.dataset.dates;
    journeyDetail.querySelector('.detail-role').textContent = row.dataset.role;
    journeyDetail.querySelector('.detail-note').textContent = row.dataset.note;
  });
});

// Track the section nearest the sticky header at every viewport shape.
const sections = [...document.querySelectorAll('main > section')];
const navLinks = [...document.querySelectorAll('nav a')];
let navigationFrame = null;
function updateNavigation() {
  const current = sections.filter(section => section.getBoundingClientRect().top <= 150).at(-1) || sections[0];
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
