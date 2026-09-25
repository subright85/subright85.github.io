"""Validate coverage/provenance and the generated accessible explanation markup."""
import json
from collections import Counter
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parent.parent
papers=json.loads((ROOT/'publications.json').read_text())
reviews=json.loads((ROOT/'publication-summaries.json').read_text())['papers']
assert len(papers)==len(reviews)==110
assert len({p['id'] for p in papers})==110
assert {p['id'] for p in papers}=={r['id'] for r in reviews}
for paper,review in zip(papers,reviews):
    assert paper['id']==review['id'] and paper['title']==review['title']
    assert paper['citation'].startswith(paper['citation_title'])
    assert review['summary'].strip() and len(review['summary'])<1000
    assert review['source_url'].startswith('https://')
    if review['review_basis'] in ('title_only','related_version_abstract'):
        assert review['review_status'] in ('source_needed','version_check_needed')
        assert review['review_notes']
class CheckHTML(HTMLParser):
    def __init__(self): super().__init__(); self.ids=[]; self.tips=set(); self.triggers=[]
    def handle_starttag(self,tag,attributes):
        a=dict(attributes)
        if a.get('id'):self.ids.append(a['id'])
        if a.get('role')=='tooltip':
            assert 'hidden' in a
            self.tips.add(a['id'])
        if 'summary-trigger' in a.get('class','').split():
            assert tag=='button' and a['aria-expanded']=='false' and a['aria-label'].startswith('Summary: ')
            self.triggers.append(a['aria-describedby'])
check=CheckHTML();check.feed((ROOT/'index.html').read_text())
assert len(check.ids)==len(set(check.ids)), 'Duplicate HTML IDs'
assert len(check.triggers)==110 and set(check.triggers)==check.tips
review_copy=(ROOT/'PUBLICATION_REVIEW.md').read_text()
assert all(r['id'] in review_copy for r in reviews)
print('110 explanations linked to unique publications; source/status metadata and accessible tooltip markup validated.')
print('Review basis:',dict(Counter(r['review_basis'] for r in reviews)))
