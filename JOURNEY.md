# Owner-only journey

The public Places page contains undated cities only, in `visited-places.json`. Do not add dates, personal notes, stay order, or travel routes to that file.

Personal files live outside this repository at `~/Documents/Codex-private/subright-journey/`:

- `journey.json`: ordered residence periods and moves.
- `places.json`: dated visits, trips, and notes.
- `places.html` and `places.js`: the full owner view.
- `JOURNEY.md`: the detailed editing guide.

Run from this repository:

```sh
python3 scripts/serve-owner.py
```

Open http://127.0.0.1:8001/. This binds only to this computer, disables caching, and serves only the required files. Stop it with Ctrl+C. It is not a remotely authenticated website; other users with access to this computer may access it while it runs. Do not copy the private files into the public preview directory or commit them.

Removing files from the current site does not remove earlier Git commits, forks, or third-party caches. Historical cleanup must be handled separately.
