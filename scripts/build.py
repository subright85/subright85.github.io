"""Rebuild static HTML after editing publications.json or index.template.html."""
import json
import re
from career import render_career
from pathlib import Path
from html import escape
ROOT = Path(__file__).resolve().parent.parent
papers = json.loads((ROOT / 'publications.json').read_text())
reviews = json.loads((ROOT / 'publication-summaries.json').read_text())['papers']
review_by_id = {review['id']: review for review in reviews}
assert len(review_by_id) == len(papers), 'Every paper must have one review'
latest_year = max(int(p['year']) for p in papers if p['year'].isdigit())
recent_years = [str(latest_year - offset) for offset in range(3)]
groups = {year: [] for year in [*recent_years, 'Older']}
for paper in papers:
    group = paper['year'] if paper['year'] in recent_years else 'Older'
    groups[group].append(paper)
blocks = []
for year, entries in groups.items():
    if not entries:
        continue
    items = []
    for paper in entries:
        citation = paper['citation']
        title = paper['title']
        rest = citation[len(paper['citation_title']):].lstrip(' ,.')
        review = review_by_id[paper['id']]
        author_prefix = re.split(r'Sungch[u]?l\s+Kim', rest, maxsplit=1)[0]
        author_rank = author_prefix.count(',') + 1
        selected = not re.search(r'\bsurvey\b', title, re.I) and author_rank <= 5
        rest = re.sub(r'Sungchul\s+Kim', '<strong>Sungchul Kim</strong>', escape(rest))
        links = ''.join(f'<a class="paper-link" href="{escape(link["url"], quote=True)}">Read paper ↗</a>' for link in paper['links'])
        if not links and review.get('source_url'):
            links = f'<a class="paper-link" href="{escape(review["source_url"], quote=True)}">Source ↗</a>'
        tooltip_id = f'{paper["id"]}-summary'
        explanation = f'<span class="paper-explanation"><button class="summary-trigger" type="button" aria-label="Summary: {escape(title, quote=True)}" aria-describedby="{tooltip_id}" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 5.8v1"/></svg></button><span class="paper-tooltip" role="tooltip" id="{tooltip_id}" hidden>{escape(review["summary"])}</span></span>'
        source_year = escape(paper['year'])
        year_label = f'{source_year} · ' if year == 'Older' and paper['year'].isdigit() else ''
        thumbnail = ''
        if paper.get('image'):
            thumbnail = f'<a class="paper-thumbnail" href="{escape(paper["links"][0]["url"], quote=True)}" aria-label="Read {escape(title, quote=True)}"><img src="{escape(paper["image"], quote=True)}" alt="{escape(paper["image_alt"], quote=True)}" width="1536" height="1024" loading="lazy"></a>'
        items.append(f'<li id="{paper["id"]}" class="paper{" paper-illustrated" if thumbnail else ""}" data-year="{source_year}" data-selected="{str(selected).lower()}">{thumbnail}<div class="paper-copy"><div class="paper-heading"><h3>{escape(title)}</h3>{explanation}</div><p>{year_label}{rest}</p>{links}</div></li>')
    opened = ' open' if year == recent_years[0] else ''
    blocks.append(f'<details class="year-group" data-year="{escape(year)}"{opened}><summary>{escape(year)} <span class="count">{len(entries)} papers</span><span class="plus" aria-hidden="true">+</span></summary><ol class="papers">{"".join(items)}</ol></details>')
template = (ROOT / 'index.template.html').read_text()
photos = json.loads((ROOT / 'photos.json').read_text())
slides = ''.join(f'<div class="photo-slide" role="group" aria-roledescription="slide" aria-label="{i+1} of {len(photos)}"{" hidden" if i else ""}><img class="profile-photo" src="{escape(p["src"], quote=True)}" alt="{escape(p["alt"], quote=True)}" style="object-position:{escape(p.get("position", "center"), quote=True)}" width="{p["width"]}" height="{p["height"]}"{ " loading=\"lazy\"" if i else ""}></div>' for i, p in enumerate(photos))
template = template.replace('{{PHOTO_SLIDES}}', slides)
(ROOT / 'index.html').write_text(template.replace('{{PUBLICATIONS}}', '\n'.join(blocks)).replace('{{CAREER_TIMELINE}}', render_career() + render_career(compact=True)))
print(f'Built index.html with {len(papers)} publications.')

# JSON is the editable source; this file is the readable owner-review copy.
notes = ['# Publication explanations — review copy', '',
         'Edit `publication-summaries.json`, then run `python3 scripts/build.py` to regenerate this file and the website.', '',
         'These are short explanatory overviews based on available abstracts or paper excerpts, not full-text peer reviews. All remain drafts for the owner to check. Source gaps and related-version matches are explicitly noted below.', '']
review_year = None
for review in reviews:
    if review['year'] != review_year:
        review_year = review['year']
        notes += [f'## {review_year}', '']
    notes += [f'### {review["title"]}', '', review['summary'], '',
              f'- ID: `{review["id"]}`',
              f'- Source: {review.get("source_url") or "Not located"}',
              f'- Basis: `{review["review_basis"]}` · Status: `{review["review_status"]}`',
              f'- [{"x" if review["owner_approved"] else " "}] Owner approved']
    if review.get('review_notes'):
        notes += [f'- Check: {review["review_notes"]}']
    notes += ['']
(ROOT / 'PUBLICATION_REVIEW.md').write_text('\n'.join(notes))
