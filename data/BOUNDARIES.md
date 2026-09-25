# Place boundary sources

Reviewed 2026-09-24. `boundary-selections.json` maps exact site place names to selected source geometries and their provenance. These are simplified outlines for a personal travel globe, not a detailed navigation map. Current boundaries are used for historical visits.

OpenStreetMap data © OpenStreetMap contributors, available under the Open Database License (ODbL): https://www.openstreetmap.org/copyright . The cached source geometries and derived `assets/maps/visited-boundaries.json` are provided under ODbL: https://opendatacommons.org/licenses/odbl/1-0/ . Nominatim responses were cached with a 0.003° simplification threshold, then rounded to four decimal places and rewound for D3. Queries were sequential, at most one per second; no requests are made from the website.

Mendocino uses the US Census Bureau's Mendocino CDP polygon (GEOID 0646814), from TIGERweb Places layer 5, queried with `NAME LIKE 'Mendocino%' AND STATE='06'`, output EPSG:4326, maximum allowable offset 0.0005°. Source: https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/5 . This is the settlement, not Mendocino County.

Geographic scope is retained: Glasgow is the council area, Kota Kinabalu is the district, Los Cabos is the municipality, Shanghai and Beijing are municipalities. Maldives has only a country-level visit record. Hawaii/Maui/Kauai are islands; Yosemite is the park and Tahoe is the lake. These types are exposed by the map's boundary zoom button. Seattle and Redmond combine the two city boundaries. No circle has been presented as an administrative boundary.

Run `node scripts/build-place-boundaries.cjs` to rebuild offline, then `node scripts/check-place-boundaries.cjs` to validate coverage, winding, size and rendering cost.
