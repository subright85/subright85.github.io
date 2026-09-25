// Personal source and password stay outside the repository. Publish ciphertext only.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {prepareJourney} = require('../journey.js');
function seal(payload, password) {
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12), iterations = 600000;
  const key = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final(), cipher.getAuthTag()]);
  key.fill(0);
  return {version: 1, kdf: 'PBKDF2-SHA256', iterations, cipher: 'AES-256-GCM', salt: salt.toString('base64'), iv: iv.toString('base64'), ciphertext: ciphertext.toString('base64')};
}
if (require.main === module) {
  const root = path.join(__dirname, '..');
  const dir = path.resolve(process.argv[2] || path.join(os.homedir(), 'Documents/Codex-private/subright-journey'));
  const passwordFile = path.join(dir, 'website-password.txt');
  if (!fs.existsSync(passwordFile)) fs.writeFileSync(passwordFile, crypto.randomBytes(18).toString('base64url') + '\n', {mode: 0o600, flag: 'wx'});
  const password = fs.readFileSync(passwordFile, 'utf8').trim();
  if (password.length < 16) throw new Error('Use a unique password with at least 16 characters.');
  const journey = JSON.parse(fs.readFileSync(path.join(dir, 'journey.json')));
  const places = JSON.parse(fs.readFileSync(path.join(dir, 'places.json')));
  prepareJourney(journey);
  fs.writeFileSync(path.join(root, 'journey.enc.json'), JSON.stringify(seal({journey, places}, password)) + '\n');
  console.log('Encrypted journey.enc.json. Password stays in the local private folder.');
}
module.exports = {seal};
