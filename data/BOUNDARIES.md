# Place boundary sources

Reviewed 2026-09-24. `boundary-selections.json` maps exact site place names to selected source geometries and their provenance. These are simplified outlines for a personal travel globe, not a detailed navigation map. Current boundaries are used for historical visits.

OpenStreetMap data © OpenStreetMap contributors, available under the Open Database License (ODbL): https://www.openstreetmap.org/copyright . The cached source geometries and derived `assets/maps/visited-boundaries.json` are provided under ODbL: https://opendatacommons.org/licenses/odbl/1-0/ . Nominatim responses were cached with a 0.003° simplification threshold, then rounded to four decimal places and rewound for D3. Queries were sequential, at most one per second; no requests are made from the website.

Mendocino uses the US Census Bureau's Mendocino CDP polygon (GEOID 0646814), from TIGERweb Places layer 5, queried with `NAME LIKE 'Mendocino%' AND STATE='06'`, output EPSG:4326, maximum allowable offset 0.0005°. Source: https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/5 . This is the settlement, not Mendocino County.

Geographic scope is retained: Glasgow is the council area, Kota Kinabalu is the district, Los Cabos is the municipality, Shanghai and Beijing are municipalities. Maldives has only a country-level visit record. Hawaii/Maui/Kauai are islands; Yosemite is the park and Tahoe is the lake. These types are exposed by the map's boundary zoom button. Seattle and Redmond combine the two city boundaries. No circle has been presented as an administrative boundary.

Run `node scripts/build-place-boundaries.cjs` to rebuild offline, then `node scripts/check-place-boundaries.cjs` to validate coverage, winding, size and rendering cost.

## Neighboring cities (2026-09-24)

`data/neighbor-regions.json` records the fixed extract bounding boxes and Overpass queries. `assets/maps/neighbors/` contains derived ODbL TopoJSON extracts. The browser loads only the selected region on zoom, with an in-memory cache. No live OSM API requests are made by visitors. Queries were run sequentially, with responses cached locally in the ignored `data/neighbor-cache/`; failed/rate-limited requests were paused before retrying. Primary endpoint: https://overpass-api.de/api/interpreter ; initial fallback extracts also used the documented Private.coffee and VK instances.

OSM relation IDs, rather than fuzzy city names or nearby coordinates, match the visited places to this layer. Shared arcs are simplified together before quantization, so neighboring borders remain coincident. The exact regional geometries replace the lighter overview outlines at city zoom. The administrative level varies across countries; these are municipal, district, or council boundaries, not uniformly comparable geographic units. OSM completeness and current administrative definitions limit the data. Water-inclusive administrative limits are retained rather than being represented as coastlines.

Hawaii's neighboring settlements additionally use US Census TIGERweb CDPs (`data/hawaii-census-places.json`, layer 5, `STATE='15'`, EPSG:4326, maximum offset 0.0005°). Their CDP boundaries are statistical areas, not incorporated city limits. Reviewed Honolulu, island, lake, park and country outlines keep their original geographic scope. An island-level visit does not assert visits to each settlement on that island. Mendocino retains its separately sourced Census CDP geometry.

Detailed coastlines load only on zoom from `assets/maps/land-detail.json`, built from public-domain Natural Earth 1:50m data via World Atlas. They remain a generalized cartographic backdrop, not parcel-level coastline data.

Offline rebuild (development dependencies only):

```sh
npm install --prefix /tmp/subright-map-tools osmtogeojson topojson-server topojson-simplify
python3 scripts/fetch-neighbor-boundaries.py
node scripts/build-place-boundaries.cjs
NODE_PATH=/tmp/subright-map-tools/node_modules node scripts/build-neighbor-boundaries.cjs
node scripts/build-detail-map.cjs
node scripts/check-place-boundaries.cjs
node scripts/check-neighbor-boundaries.cjs
```

`--partial` is supported by the neighbor builder only for local previews while extracts download. Production checks require all 38 regions.

Las Vegas and its neighboring incorporated cities use US Census TIGERweb layer 4 (`data/nevada-census-cities.json`, `STATE='32'`, EPSG:4326, maximum offset 0.0005°). Las Vegas is matched by GEOID **3240000**, with Henderson, North Las Vegas and Boulder City retained as unvisited context. This authoritative fallback is used at regional zoom after repeated Overpass retrieval failures. The overview retains the reviewed simplified OSM outline.

### Coastlines at local zoom

For coastal extracts, `data/coastline-query.ql` fetches OSM `natural=coastline` ways in the same regional bounding boxes (one combined request, cached in ignored `data/neighbor-cache/coastlines.json`). `scripts/build-regional-coasts.py` uses Shapely 2 to polygonize the clipped coast with the bounding box, classifies land using OSM's land-on-the-left direction, and simplifies it by 0.0001°. `data/regional-coasts/` stores these derived ODbL land masks; the neighbor builder bundles them into the same optional regional TopoJSON file. This prevents generalized world coastlines from cutting through small coastal cities at deep zoom. It adds no extra request at runtime. Shanghai and Maldives had ambiguous coastline faces and retain the generalized fallback, rather than guessing their land mask. Inland lakes are not marine coastline data.

To regenerate these optional masks, fetch the recorded query with a descriptive User-Agent using an Overpass endpoint, then run `python3 scripts/build-regional-coasts.py` in a Python environment with `shapely` installed, before the neighbor builder. The bounding boxes and query are public place-level map extents, not precise travel routes. Administrative boundaries can legitimately extend across water; their extent is not changed to match a coastline.

The regional builder removes coastal polygon slivers below roughly 400 m² before quantization to prevent collapsed rings from inverting the spherical land mask. These tiny islets/slivers are below the intended overview precision.
