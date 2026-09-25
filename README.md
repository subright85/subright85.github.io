# Sungchul Kim · Research homepage

A simple, responsive static site for GitHub Pages, based on https://sites.google.com/site/subright. Consent and ClearLine Support are excluded.

## Preview

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No Node packages or build service are required.

## Edit

- Biography, experience, and articles: `index.template.html`
- Publications: `publications.json` (newest year first; original full citations preserved). The build shows the latest three years separately and combines all earlier entries into Older, retaining individual years for search.
- Career timeline: `scripts/career.py` generates a compact chart with date-proportional bars. Education, internships, and industry share one horizontal scale; years after 2017 are compressed to 35% of the earlier scale, with a visible break. Full dates and mentor information remain in `index.template.html`. Rebuilding updates the present-day endpoint.
- Design: `style.css`, with the shared charcoal/red palette in `theme.css`.
- Search and Selected / All publications: `script.js`. Selected excludes Survey titles and papers where Sungchul Kim is sixth author or later; `scripts/build.py` derives rank from the citation author list.
- Photos: `photos.json` lists carousel images, alt text, dimensions, and framing. Add photos to `assets/`, then rebuild. Arrows, dots, keyboard navigation, and swiping activate when two or more photos are listed. No autoplay.
- Public places: `visited-places.json` contains unique cities without dates or personal notes.
- Owner timeline: the Places lock icon opens a password-protected, encrypted view. Personal sources and the password stay outside the repository; run `node scripts/encrypt-journey.cjs` to publish encrypted updates. Local viewing remains available with `python3 scripts/serve-owner.py`. See `JOURNEY.md`.
- Paper illustrations: `paper-visuals.json` records source papers, concepts, and generation prompts. Six plain conceptual illustrations were made with built-in image generation, independently of the site colors.
- Article images: `story-images.json` records original article and image URLs. Images are locally hosted and link back to the stories.

After editing the template or publication data, run `python3 scripts/build.py` and commit the generated `index.html` too. All publication text is available without JavaScript; JavaScript adds search, responsive chart sizing, and carousel controls.


## Map implementation

The public Places page shows undated cities grouped by country. The detailed residence chart, time slider, notes, and routes are available in the password-unlocked owner view and the separate local view.

The globe uses one simplified natural coastline (`assets/maps/land-natural.json`, about 58 KB) built from Natural Earth with `node scripts/build-globe-map.cjs`. At city zoom, a small local TopoJSON decoder expands the selected regional extract. Neutral land receives vivid highlights within real simplified place boundaries (`assets/maps/visited-boundaries.json`, about 109 KB). Cities use administrative boundaries; islands, parks, a lake, a district and a census place use their respective outlines. Boundary type is shown on the zoom button. Reviewed source selections are in `data/boundary-selections.json`; rebuild offline with `node scripts/build-place-boundaries.cjs`. OSM data is © OpenStreetMap contributors (ODbL); Mendocino CDP is from the US Census TIGERweb service. Cached source responses avoid API calls during page visits. No live GIS service is called. Neighboring boundaries and local coastal land masks are fetched from static local assets only on zoom; exact source IDs identify the visited polygons. See `data/BOUNDARIES.md` for scope, sources and rebuild commands.

Globe updates are batched once per animation frame. The globe rotates slowly by default, pausing during interaction, off-screen, or in a hidden tab. Reduced-motion preferences disable rotation by default. Country borders remain visible at globe zoom; administrative highlights and nearby boundaries are clipped to the displayed land so water portions are not painted.

Checks: `node scripts/check-journey.cjs` and `node scripts/check-rendering.cjs`.

## GitHub Pages

Publish the `main` branch, `/ (root)` folder, using Settings → Pages → Deploy from a branch. A repository named `subright85.github.io` will be served at https://subright85.github.io/.

Source content copied from the owner's existing homepage on September 22, 2026. Publication metadata follows that source; the six 2026 papers now link to their verified source pages. Conference city candidates link to venue sources and do not imply attendance.

## Publication explanations

Each publication has a stable ID linking `publications.json` to `publication-summaries.json`. Edit the summary, source URL, review notes, or `owner_approved` flag in that JSON, then run `python3 scripts/build.py`. This regenerates the static hover/focus/tap tooltips and the readable `PUBLICATION_REVIEW.md` copy. No runtime fetch or framework is required.

`abstract` and `paper_excerpt` indicate the evidence actually consulted; these are explanatory drafts, not full-paper peer reviews. `related_version_abstract` and `title_only` retain explicit caveats. Source-needed and version-check records are left for owner review rather than filling in unverified methods. Local research downloads under `data/paper-sources/` are excluded from Git.

The charcoal header, white content, and restrained red accents reference the visual contrast of [T1’s official site](https://www.t1.gg/), without reusing its logo, photography, video, or type assets.
