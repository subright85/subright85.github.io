# Owner-only journey

The public Places page uses `visited-places.json`: cities plus curated conference/travel visit dates. A keyboard Easter egg on the homepage and Places decrypts the detailed timeline and opens it in a modal. There is no visible entry button. `journey.html` still supports direct password entry. Do not add residence periods, personal notes, stay order, or travel routes to that file. Public visit records accept only `date` (year or year-month), `kind`, `conference`, `venue`, and `unconfirmed`.

Personal files live outside this repository at `~/Documents/Codex-private/subright-journey/`:

- `journey.json`: ordered residence periods and moves.
- `places.json`: dated visits, trips, and notes.
- `places.html` and `places.js`: the full owner view.
- `JOURNEY.md`: the detailed editing guide.
- `website-password.txt`: the unique website password (never published).

Run from this repository:

```sh
python3 scripts/serve-owner.py
```

Open http://127.0.0.1:8001/. This binds only to this computer, disables caching, and serves only the required files. Stop it with Ctrl+C. It is not a remotely authenticated website; other users with access to this computer may access it while it runs. Do not copy the private files into the public preview directory or commit them.

Removing files from the current site does not remove earlier Git commits, forks, or third-party caches. Historical cleanup must be handled separately.

## Password-protected website

After editing the private JSON files, run `node scripts/encrypt-journey.cjs` from the repository. It validates the journey, generates a random password if none exists, and writes only `journey.enc.json` for publication. Commit the encrypted file, never the source JSON or password. To change the password, edit the local `website-password.txt` to a new unique password of at least 10 characters, then encrypt and publish again.

Encryption uses AES-256-GCM with a fresh 96-bit IV and 128-bit salt, and PBKDF2-SHA256 with 600,000 iterations. Browser Web Crypto decrypts after code/password entry. The Easter egg collects a rolling 10-character alphanumeric buffer outside input fields, resetting after five seconds idle or window blur. Change the buffer length in `easter-egg.js` if changing to a different-length code. It uses authenticated decryption to recognize the code, without publishing the code or a fast password hash. Passwords and decrypted data are not stored in browser storage. Escape or the close button destroys the modal and its decrypted frame; reload requires the code again. The direct standalone view has a Lock button returning to the public map. This is client-side encrypted static content, not server-side account authentication. Anyone with the password can open it, and downloaded older ciphertext remains decryptable with its old password. Earlier plaintext Git history is unaffected.

`owner-globe.js` renders the full map using decrypted input; it contains no personal chronology. `journey.html` is an empty UI shell until unlocked. Test encryption and rejection of invalid passwords/tampered ciphertext with `node scripts/check-encrypted-journey.cjs`.
