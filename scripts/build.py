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
        rest = re.sub(r'Sungchul\s+Kim', '<strong>Sungchul Kim</strong>', escape(rest))
        links = ''.join(f'<a class="paper-link" href="{escape(link["url"], quote=True)}">Read paper ↗</a>' for link in paper['links'])
        source_year = escape(paper['year'])
        year_label = f'{source_year} · ' if year == 'Older' and paper['year'].isdigit() else ''
        items.append(f'<li class="paper" data-year="{source_year}"><h3>{escape(title)}</h3><p>{year_label}{rest}</p>{links}</li>')
    opened = ' open' if year == recent_years[0] else ''
    blocks.append(f'<details class="year-group" data-year="{escape(year)}"{opened}><summary>{escape(year)} <span class="count">{len(entries)} papers</span><span class="plus" aria-hidden="true">+</span></summary><ol class="papers">{"".join(items)}</ol></details>')
template = (ROOT / 'index.template.html').read_text()
(ROOT / 'index.html').write_text(template.replace('{{PUBLICATIONS}}', '\n'.join(blocks)).replace('{{CAREER_TIMELINE}}', render_career()))
print(f'Built index.html with {len(papers)} publications.')
