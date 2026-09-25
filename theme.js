// Apply before styles paint; only the appearance preference is persisted.
(() => {
  const key = 'site-color-mode';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem(key); } catch {}
  const valid = value => value === 'light' || value === 'dark';
  const preferred = () => valid(preference) ? preference : system.matches ? 'dark' : 'light';
  function apply(mode) {
    document.documentElement.dataset.theme = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#101117' : '#fbfafd');
    document.querySelectorAll('.theme-toggle').forEach(button => {
      const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', label); button.title = label;
    });
    document.querySelectorAll('iframe[title="Personal journey"]').forEach(frame => frame.contentWindow?.postMessage({type: 'site-theme', theme: mode}, location.origin));
  }
  let initial = preferred();
  try { if (parent !== window && valid(parent.document.documentElement.dataset.theme)) initial = parent.document.documentElement.dataset.theme; } catch {}
  apply(initial);
  system.addEventListener('change', () => { if (!valid(preference)) apply(preferred()); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { preference = event.newValue; apply(preferred()); }
  });
  window.addEventListener('message', event => {
    if (parent !== window && event.source === parent && event.origin === location.origin && event.data?.type === 'site-theme' && valid(event.data.theme)) apply(event.data.theme);
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch {}
      apply(preference);
    }));
  });
})();
