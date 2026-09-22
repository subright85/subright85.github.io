"""Rebuild static HTML after editing publications.json or index.template.html."""
import json
import re
from pathlib import Path
from html import escape
from itertools import groupby
ROOT = Path(__file__).resolve().parent.parent
papers = json.loads((ROOT / 'publications.json').read_text())
blocks = []
for year, entries in groupby(papers, key=lambda p: p['year']):
    entries = list(entries)
    items = []
    for paper in entries:
        citation = paper['citation']
        # Preserve title commas in these source entries.
        markers = ['Click, Type, Repeat: A Comprehensive Survey on GUI Agents', 'From Selection to Generation: A Survey of LLM-based Active Learning', 'On Proximity and Structural Role-based Embeddings in Networks: Misconceptions, Techniques, and Applications', 'EXACTA: Explainable Column Annotation']
        title = next((title for title in markers if citation.startswith(title)), citation.split(', ', 1)[0])
        rest = citation[len(title):].lstrip(' ,.')
        rest = re.sub(r'Sungchul\s+Kim', '<strong>Sungchul Kim</strong>', escape(rest))
        links = ''.join(f'<a class="paper-link" href="{escape(link["url"], quote=True)}">Read paper ↗</a>' for link in paper['links'])
        items.append(f'<li class="paper"><h3>{escape(title)}</h3><p>{rest}</p>{links}</li>')
    opened = ' open' if year == '2026' else ''
    blocks.append(f'<details class="year-group" data-year="{escape(year)}"{opened}><summary>{escape(year)} <span class="count">{len(entries)} papers</span><span class="plus" aria-hidden="true">+</span></summary><ol class="papers">{"".join(items)}</ol></details>')
template = (ROOT / 'index.template.html').read_text()
(ROOT / 'index.html').write_text(template.replace('{{PUBLICATIONS}}', '\n'.join(blocks)))
print(f'Built index.html with {len(papers)} publications.')
