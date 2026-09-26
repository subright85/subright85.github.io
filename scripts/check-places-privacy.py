"""Keep private residence chronology out of the public map and test local access limits."""
import json
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError

root = Path(__file__).resolve().parents[1]
allowed = {'id', 'city', 'country', 'country_code', 'coordinates', 'status', 'visits'}
places = json.loads((root / 'visited-places.json').read_text())
assert len(places) == len({(p['country'], p['city']) for p in places})
assert all(set(p) <= allowed for p in places)
assert all(p['status'] in {'visited', 'visit', 'travel'} for p in places)
for place in places:
    for visit in place.get('visits', []):
        assert set(visit) <= {'date', 'kind', 'conference', 'venue', 'unconfirmed'}
        assert visit['kind'] in {'conference', 'trip', 'visit'}
        assert len(visit['date']) in (4, 7)
        if visit['kind'] == 'conference': assert visit.get('conference')
# Personal residence dates are still excluded; the public visits are separate events.
assert all(not p.get('visits') for p in places if p['city'] in {'Incheon', 'Pohang', 'San Jose', 'Seattle / Redmond'})

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
print(f'{len(places)} public places: curated visit dates, no residence chronology; owner server rejects traversal, backups, directories, and foreign Host headers.')
