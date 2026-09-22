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
      const match = !query || `${group.dataset.year} ${paper.textContent}`.toLocaleLowerCase().includes(query);
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

// Keep the navigation in step with the visible section.
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('nav a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('main > section').forEach(section => sectionObserver.observe(section));
}
