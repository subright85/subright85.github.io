async function decryptJourney(envelope, password) {
  if (envelope.version !== 1 || envelope.kdf !== 'PBKDF2-SHA256' || envelope.cipher !== 'AES-256-GCM' || envelope.iterations !== 600000) throw new Error('Unsupported data');
  const bytes = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: bytes(envelope.salt), iterations: envelope.iterations, hash: 'SHA-256'}, material, {name: 'AES-GCM', length: 256}, false, ['decrypt']);
  const decoded = await crypto.subtle.decrypt({name: 'AES-GCM', iv: bytes(envelope.iv)}, key, bytes(envelope.ciphertext));
  return JSON.parse(new TextDecoder().decode(decoded));
}
if (typeof module !== 'undefined') module.exports = {decryptJourney};
if (typeof document !== 'undefined') {
  const form = document.querySelector('#unlock-form');
  const password = document.querySelector('#journey-password');
  const feedback = document.querySelector('#unlock-message');
  form.addEventListener('submit', async event => {
    event.preventDefault();
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
    try { payload = await decryptJourney(envelope, password.value); }
    catch {
      feedback.textContent = 'That password didn’t work.';
      password.value = ''; password.focus(); button.disabled = false; return;
    }
    password.value = ''; feedback.textContent = '';
    document.querySelector('#unlock-panel').hidden = true;
    document.querySelector('#owner-content').hidden = false;
    document.querySelector('#lock-journey').hidden = false;
    await initializeOwnerGlobe(payload);
    document.querySelector('#owner-heading').focus();
  });
  document.querySelector('#lock-journey').addEventListener('click', () => location.replace('places.html?v=nav21'));
  // Never retain decrypted data or passwords in local/session storage or BFCache.
  window.addEventListener('pagehide', () => {
    password.value = '';
    document.querySelector('#owner-content').replaceChildren();
    document.querySelector('#owner-content').hidden = true;
  });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
}
