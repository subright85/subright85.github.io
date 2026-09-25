# Owner-only journey

The public Places page contains undated cities only, in `visited-places.json`. Its small lock icon opens `journey.html`, where a password decrypts the detailed timeline in browser memory. Do not add dates, personal notes, stay order, or travel routes to that file.

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

After editing the private JSON files, run `node scripts/encrypt-journey.cjs` from the repository. It validates the journey, generates a random password if none exists, and writes only `journey.enc.json` for publication. Commit the encrypted file, never the source JSON or password. To change the password, edit the local `website-password.txt` to a new unique password of at least 16 characters, then encrypt and publish again.

Encryption uses AES-256-GCM with a fresh 96-bit IV and 128-bit salt, and PBKDF2-SHA256 with 600,000 iterations. Browser Web Crypto decrypts after password entry. Passwords and decrypted data are not stored in browser storage. Lock returns to the public map; reload requires the password again. This is client-side encrypted static content, not server-side account authentication. Anyone with the password can open it, and downloaded older ciphertext remains decryptable with its old password. Earlier plaintext Git history is unaffected.

`owner-globe.js` renders the full map using decrypted input; it contains no personal chronology. `journey.html` is an empty UI shell until unlocked. Test encryption and rejection of invalid passwords/tampered ciphertext with `node scripts/check-encrypted-journey.cjs`.
