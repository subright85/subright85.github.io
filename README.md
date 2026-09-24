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
- Residence timeline: `residence.json` stores living periods; `residence.js` draws responsive bars and connects them to the globe. Early calendar years remain unspecified until confirmed. Month-level intervals include each internship’s final month; the early-2016 Korea return is approximate.
- Places: `places.json` holds confirmed places and separate conference candidates. `places.html` uses a locally bundled D3 globe, with rotation, zoom, and accessible place buttons.
- Paper illustrations: `paper-visuals.json` records source papers, concepts, and generation prompts. Six plain conceptual illustrations were made with built-in image generation, independently of the site colors.
- Article images: `story-images.json` records original article and image URLs. Images are locally hosted and link back to the stories.

After editing the template or publication data, run `python3 scripts/build.py` and commit the generated `index.html` too. All publication text is available without JavaScript; JavaScript adds search, responsive chart sizing, and carousel controls.

## GitHub Pages

Publish the `main` branch, `/ (root)` folder, using Settings → Pages → Deploy from a branch. A repository named `subright85.github.io` will be served at https://subright85.github.io/.

Source content copied from the owner's existing homepage on September 22, 2026. Publication metadata follows that source; the six 2026 papers now link to their verified source pages. Conference city candidates link to venue sources and do not imply attendance.
