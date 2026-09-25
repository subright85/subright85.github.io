async function decryptJourney(envelope, password) {
  if (envelope.version !== 1 || envelope.kdf !== 'PBKDF2-SHA256' || envelope.cipher !== 'AES-256-GCM' || envelope.iterations !== 600000) throw new Error('Unsupported data');
  const bytes = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: bytes(envelope.salt), iterations: envelope.iterations, hash: 'SHA-256'}, material, {name: 'AES-GCM', length: 256}, false, ['decrypt']);
  const decoded = await crypto.subtle.decrypt({name: 'AES-GCM', iv: bytes(envelope.iv)}, key, bytes(envelope.ciphertext));
  return JSON.parse(new TextDecoder().decode(decoded));
}
if (typeof module !== 'undefined') module.exports = {decryptJourney};
