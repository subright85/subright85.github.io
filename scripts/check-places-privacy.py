"""Keep private chronology out of the public map and test local access limits."""
import json
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError

root = Path(__file__).resolve().parents[1]
allowed = {'id', 'city', 'country', 'country_code', 'coordinates', 'status'}
places = json.loads((root / 'visited-places.json').read_text())
assert len(places) == len({(p['country'], p['city']) for p in places})
assert all(set(p) <= allowed for p in places)
assert all(p['status'] in {'visited', 'visit', 'travel'} for p in places)
assert not any((root / p).exists() for p in ['journey.json', 'places.json'])
assert 'journey-time' not in (root / 'places.html').read_text()
assert "fetch('journey.json" not in (root / 'places.js').read_text()
assert "fetch('places.json" not in (root / 'places.js').read_text()

def status(path, host=None):
    request = Request('http://127.0.0.1:8001/' + path, headers={'Host': host} if host else {})
    try:
        with urlopen(request) as r:
            assert r.headers['Cache-Control'] == 'no-store'
            return r.status
    except HTTPError as e:
        return e.code

assert status('journey.json') == 200
assert status('assets/maps/country-borders.json') == 200
for path in ['before-privacy.bundle', 'JOURNEY.md', '.git/config', 'assets/', '%2e%2e/journey.json', 'assets/../../journey.json']:
    assert status(path) == 404, path
assert status('journey.json', 'untrusted.example') == 403
print(f'{len(places)} public places: no chronology; owner server rejects traversal, backups, directories, and foreign Host headers.')
