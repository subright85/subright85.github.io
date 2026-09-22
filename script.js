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
