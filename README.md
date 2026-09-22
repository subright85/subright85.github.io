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
- Career timeline: the `experience` section in `index.template.html`; button data attributes supply the detail panel. Bar positions are proportional to the 2008–September 2026 axis. Update the axis and proportions when extending its range.
- Design: `style.css`
- Search: `script.js`
- Photo: `assets/profile.png`

After editing the template or publication data, run `python3 scripts/build.py` and commit the generated `index.html` too. All publication text is available without JavaScript; JavaScript only adds search.

## GitHub Pages

Publish the `main` branch, `/ (root)` folder, using Settings → Pages → Deploy from a branch. A repository named `subright85.github.io` will be served at https://subright85.github.io/.

Source content copied from the owner's existing homepage on September 22, 2026. Publication metadata follows that source; no unverified paper links or author profiles were added.
