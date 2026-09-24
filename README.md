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
- Design: `style.css`
- Search: `script.js`
- Photos: `photos.json` lists carousel images, alt text, dimensions, and framing. Add photos to `assets/`, then rebuild. Arrows, dots, keyboard navigation, and swiping activate when two or more photos are listed. No autoplay.
- Journey, residence timeline, and globe routes: edit `journey.json`. See `JOURNEY.md` for the field guide and a sample entry. The ordered stays drive all three automatically, including return visits. Validate with `node scripts/check-journey.cjs`. No rebuild required for journey edits.
- Conference candidates: `places.json` is separate from confirmed journey stops.
- Paper illustrations: `paper-visuals.json` records source papers, concepts, and generation prompts. Six plain conceptual illustrations were made with built-in image generation, independently of the site colors.
- Article images: `story-images.json` records original article and image URLs. Images are locally hosted and link back to the stories.

After editing the template or publication data, run `python3 scripts/build.py` and commit the generated `index.html` too. All publication text is available without JavaScript; JavaScript adds search, responsive chart sizing, and carousel controls.


## Map implementation

The Places residence timeline uses an uncompressed linear time scale, independent of the compressed career chart on the home page.

The globe uses a small, precomputed tile map (`assets/maps/land-game.json`) generated from Natural Earth. Terrain colors are stylized. Regenerate it with `node scripts/build-game-map.cjs`; TopoJSON conversion runs only in that build script, not in visitors’ browsers.

Globe updates are batched once per animation frame. Route interpolation and data formatting are cached, and the timeline retains its SVG elements when resized. The globe rotates slowly by default (20 updates per second), pausing during interaction, off-screen, or in a hidden tab. Reduced-motion preferences disable rotation by default. A monthly slider filters the journey and marks the linear residence timeline; All years restores the full journey.

Checks: `node scripts/check-journey.cjs` and `node scripts/check-rendering.cjs`.

## GitHub Pages

Publish the `main` branch, `/ (root)` folder, using Settings → Pages → Deploy from a branch. A repository named `subright85.github.io` will be served at https://subright85.github.io/.

Source content copied from the owner's existing homepage on September 22, 2026. Publication metadata follows that source; the six 2026 papers now link to their verified source pages. Conference city candidates link to venue sources and do not imply attendance.
