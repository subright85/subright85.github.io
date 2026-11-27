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
def publication_priority(paper):
    if re.search(r'\bsurvey\b', paper['title'], re.I):
        return 2
    citation = paper['citation'][len(paper['citation_title']):].lstrip(' ,.')
    author = re.search(r'\bSungchu?l\s+Kim\b', citation, re.I)
    if author:
        preceding = re.split(r',|\band\b', citation[:author.start()])
        if sum(bool(name.strip()) for name in preceding) < 5:
            return 0
    return 1


groups = {}
for paper in papers:
    year = paper['year']
    if year == 'Older':
        year = re.search(r'(20\d{2})(?:\.\d{1,2})?$', paper['citation']).group(1)
    groups.setdefault(year, []).append(paper)
years = sorted(groups, reverse=True)
blocks = []
for year in years:
    entries = sorted(groups[year], key=publication_priority)
    items = []
    for paper in entries:
        citation = paper['citation']
        title = paper['title']
        rest = citation[len(paper['citation_title']):].lstrip(' ,.')
        review = review_by_id[paper['id']]
        rest = re.sub(r'Sungchul\s+Kim', '<strong>Sungchul Kim</strong>', escape(rest))
        links = ''.join(f'<a class="paper-link" href="{escape(link["url"], quote=True)}">Read paper ↗</a>' for link in paper['links'])
        if not links and review.get('source_url'):
            links = f'<a class="paper-link" href="{escape(review["source_url"], quote=True)}">Source ↗</a>'
        tooltip_id = f'{paper["id"]}-summary'
        explanation = f'<span class="paper-explanation"><button class="summary-trigger" type="button" aria-label="Summary: {escape(title, quote=True)}" aria-describedby="{tooltip_id}" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 5.8v1"/></svg></button><span class="paper-tooltip" role="tooltip" id="{tooltip_id}" hidden><span class="tooltip-heading"><span class="tooltip-label">Summary</span><span class="tooltip-year">{year}</span></span><span class="tooltip-body">{escape(review["summary"])}</span></span></span>'
        thumbnail = ''
        if paper.get('image'):
            thumbnail = f'<a class="paper-thumbnail" href="{escape(paper["links"][0]["url"], quote=True)}" aria-label="Read {escape(title, quote=True)}"><img src="{escape(paper["image"], quote=True)}" alt="{escape(paper["image_alt"], quote=True)}" width="1536" height="1024" loading="lazy"></a>'
        items.append(f'<li id="{paper["id"]}" class="paper{" paper-illustrated" if thumbnail else ""}" data-year="{year}">{thumbnail}<div class="paper-copy"><div class="paper-heading"><h3>{escape(title)}</h3>{explanation}</div><p>{rest}</p>{links}</div></li>')
    opened = ' open' if year in years[:3] else ''
    count_label = f'{len(entries)} paper' if len(entries) == 1 else f'{len(entries)} papers'
    blocks.append(f'<details class="year-group" data-year="{escape(year)}"{opened}><summary>{escape(year)} <span class="count">{count_label}</span><span class="plus" aria-hidden="true">+</span></summary><ol class="papers">{"".join(items)}</ol></details>')
template = (ROOT / 'index.template.html').read_text()
photos = json.loads((ROOT / 'photos.json').read_text())
slides = ''.join(f'<div class="photo-slide" role="group" aria-roledescription="slide" aria-label="{i+1} of {len(photos)}"{" hidden" if i else ""}><img class="profile-photo" src="{escape(p["src"], quote=True)}" alt="{escape(p["alt"], quote=True)}" style="object-position:{escape(p.get("position", "center"), quote=True)}" width="{p["width"]}" height="{p["height"]}"{ " loading=\"lazy\"" if i else ""}></div>' for i, p in enumerate(photos))
template = template.replace('{{PHOTO_SLIDES}}', slides)
template = template.replace('{{PUBLICATION_COUNT}}', str(len(papers)))
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
