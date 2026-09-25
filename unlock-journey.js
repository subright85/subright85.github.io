if (typeof document !== 'undefined') {
  const form = document.querySelector('#unlock-form');
  const password = document.querySelector('#journey-password');
  const feedback = document.querySelector('#unlock-message');
  async function unlock(secret) {
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    button.disabled = true; feedback.textContent = 'Unlocking…';
    let envelope;
    try {
      const response = await fetch('journey.enc.json', {cache: 'no-store'});
      if (!response.ok) throw new Error();
      envelope = await response.json();
    } catch {
      feedback.textContent = 'Could not load. Please try again.';
      button.disabled = false; return;
    }
    let payload;
    try { payload = await decryptJourney(envelope, secret); }
    catch {
      feedback.textContent = 'That password didn’t work.';
      password.value = ''; password.focus(); button.disabled = false; return;
    }
    showJourney(payload);
  }
  async function showJourney(payload) {
    password.value = ''; feedback.textContent = '';
    document.querySelector('#unlock-panel').hidden = true;
    document.querySelector('#owner-content').hidden = false;
    document.querySelector('#lock-journey').hidden = false;
    await initializeOwnerGlobe(payload);
    document.querySelector('#owner-heading').focus();
  }
  form.addEventListener('submit', event => { event.preventDefault(); unlock(password.value); });
  let embeddedOpened = false;
  window.addEventListener('message', event => {
    if (window.parent === window || event.source !== window.parent || event.origin !== location.origin || event.data?.type !== 'open-journey' || embeddedOpened) return;
    const payload = event.data.payload;
    if (!payload?.journey?.stops || !Array.isArray(payload.places)) return;
    embeddedOpened = true;
    document.body.classList.add('journey-embedded');
    document.querySelector('#lock-journey').textContent = 'Close';
    showJourney(payload);
  });
  const closeJourney = () => {
    if (window.parent !== window) window.parent.postMessage({type: 'close-journey'}, location.origin);
    else location.replace('places.html?v=nav22');
  };
  document.querySelector('#lock-journey').addEventListener('click', closeJourney);
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && window.parent !== window) closeJourney(); });
  // Never retain decrypted data or passwords in local/session storage or BFCache.
  window.addEventListener('pagehide', () => {
    password.value = '';
    document.querySelector('#owner-content').replaceChildren();
    document.querySelector('#owner-content').hidden = true;
  });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
}
