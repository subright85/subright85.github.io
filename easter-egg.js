// A short-lived keyboard buffer; no logging, storage, password, or password hash.
(() => {
  let buffer = '', lastKey = 0, envelope, loading, dialog, generation = 0;
  const reset = () => { buffer = ''; lastKey = 0; generation++; };
  async function tryOpen(candidate, token) {
    try {
      if (!loading) loading = fetch('journey.enc.json', {cache: 'no-store'}).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => envelope = data).catch(error => { loading = null; throw error; });
      await loading;
      const payload = await decryptJourney(envelope, candidate);
      if (dialog || token !== generation) return;
      reset();
      const previousFocus = document.activeElement;
      dialog = document.createElement('dialog'); dialog.className = 'journey-secret';
      dialog.setAttribute('aria-label', 'Personal journey');
      const close = document.createElement('button'); close.className = 'journey-secret-close'; close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', 'Close personal journey');
      const frame = document.createElement('iframe'); frame.title = 'Personal journey'; frame.src = 'journey.html?v=egg1';
      frame.addEventListener('load', () => {
        if (frame.contentWindow && payload.journey) frame.contentWindow.postMessage({type: 'open-journey', payload}, location.origin);
        delete payload.journey; delete payload.places;
      }, {once: true});
      const receive = event => { if (event.origin === location.origin && event.source === frame.contentWindow && event.data?.type === 'close-journey') dialog?.close(); };
      window.addEventListener('message', receive);
      close.addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => {
        window.removeEventListener('message', receive);
        dialog.remove(); dialog = null; reset();
        document.documentElement.classList.remove('journey-secret-open');
        previousFocus?.focus();
      }, {once: true});
      dialog.append(close, frame); document.body.append(dialog);
      document.documentElement.classList.add('journey-secret-open'); dialog.showModal(); close.focus();
    } catch { /* Other typing has no visible effect. */ }
  }
  document.addEventListener('keydown', event => {
    if (dialog || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) { reset(); return; }
    if (event.key === 'Escape') { reset(); return; }
    if (event.key.length !== 1 || !/^[a-zA-Z0-9]$/.test(event.key)) return;
    if (Date.now() - lastKey > 5000) reset();
    lastKey = Date.now(); buffer = (buffer + event.key).slice(-10);
    const token = ++generation;
    if (buffer.length === 10) tryOpen(buffer, token);
  });
  window.addEventListener('blur', reset);
  window.addEventListener('pagehide', () => { reset(); dialog?.close(); });
})();
