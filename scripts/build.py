"""Rebuild static HTML after editing publications.json or index.template.html."""
import json
import re
from career import render_career
from pathlib import Path
from html import escape
ROOT = Path(__file__).resolve().parent.parent
papers = json.loads((ROOT / 'publications.json').read_text())
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
        # Preserve title commas in these source entries.
        markers = ['Click, Type, Repeat: A Comprehensive Survey on GUI Agents', 'From Selection to Generation: A Survey of LLM-based Active Learning', 'On Proximity and Structural Role-based Embeddings in Networks: Misconceptions, Techniques, and Applications', 'EXACTA: Explainable Column Annotation']
        title = next((title for title in markers if citation.startswith(title)), citation.split(', ', 1)[0])
        rest = citation[len(title):].lstrip(' ,.')
        author_prefix = re.split(r'Sungch[u]?l\s+Kim', rest, maxsplit=1)[0]
        author_rank = author_prefix.count(',') + 1
        selected = not re.search(r'\bsurvey\b', title, re.I) and author_rank <= 5
        rest = re.sub(r'Sungchul\s+Kim', '<strong>Sungchul Kim</strong>', escape(rest))
        links = ''.join(f'<a class="paper-link" href="{escape(link["url"], quote=True)}">Read paper ↗</a>' for link in paper['links'])
        source_year = escape(paper['year'])
        year_label = f'{source_year} · ' if year == 'Older' and paper['year'].isdigit() else ''
        thumbnail = ''
        if paper.get('image'):
            thumbnail = f'<a class="paper-thumbnail" href="{escape(paper["links"][0]["url"], quote=True)}" aria-label="Read {escape(title, quote=True)}"><img src="{escape(paper["image"], quote=True)}" alt="{escape(paper["image_alt"], quote=True)}" width="1536" height="1024" loading="lazy"></a>'
        items.append(f'<li class="paper{" paper-illustrated" if thumbnail else ""}" data-year="{source_year}" data-selected="{str(selected).lower()}">{thumbnail}<div class="paper-copy"><h3>{escape(title)}</h3><p>{year_label}{rest}</p>{links}</div></li>')
    opened = ' open' if year == recent_years[0] else ''
    blocks.append(f'<details class="year-group" data-year="{escape(year)}"{opened}><summary>{escape(year)} <span class="count">{len(entries)} papers</span><span class="plus" aria-hidden="true">+</span></summary><ol class="papers">{"".join(items)}</ol></details>')
template = (ROOT / 'index.template.html').read_text()
photos = json.loads((ROOT / 'photos.json').read_text())
slides = ''.join(f'<div class="photo-slide" role="group" aria-roledescription="slide" aria-label="{i+1} of {len(photos)}"{" hidden" if i else ""}><img class="profile-photo" src="{escape(p["src"], quote=True)}" alt="{escape(p["alt"], quote=True)}" style="object-position:{escape(p.get("position", "center"), quote=True)}" width="{p["width"]}" height="{p["height"]}"{ " loading=\"lazy\"" if i else ""}></div>' for i, p in enumerate(photos))
template = template.replace('{{PHOTO_SLIDES}}', slides)
(ROOT / 'index.html').write_text(template.replace('{{PUBLICATIONS}}', '\n'.join(blocks)).replace('{{CAREER_TIMELINE}}', render_career() + render_career(compact=True)))
print(f'Built index.html with {len(papers)} publications.')
