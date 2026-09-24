"""Compact career chart. Periods use month boundaries from the source CV."""
from datetime import date
from html import escape


def render_career():
    start, end = date(2008, 1, 1), date.today()
    def x(value):
        return 100 + (date.fromisoformat(value) - start).days / (end - start).days * 888
    def period(begin, finish, y, label, current=False):
        left, right = x(begin), x(finish) if finish else 988
        return f'<rect class="period-bar{" present" if current else ""}" x="{left:.2f}" y="{y}" width="{right-left:.2f}" height="5" rx="2"><title>{escape(label)}</title></rect>'
    svg = ['<svg class="career-chart" viewBox="0 0 1000 170" role="img" aria-labelledby="career-chart-title career-chart-description" xmlns="http://www.w3.org/2000/svg">',
           '<title id="career-chart-title">Experience and education, 2008 to present</title>',
           '<desc id="career-chart-description">Bar positions and lengths represent dates and durations on the same scale. POSTECH B.S., February 2008; Ph.D., August 2008–August 2015. Microsoft Research Asia internship, September 2010–May 2011; Redmond internship, June–August 2011. Adobe internship, August–December 2015. Bagelcode, February–May 2016. Adobe Research, July 2016–present. Full details follow the chart.</desc>']
    for year in (2008, 2012, 2016, 2020, 2024):
        px = x(f'{year}-01-01')
        svg.append(f'<line class="career-grid" x1="{px:.2f}" y1="26" x2="{px:.2f}" y2="165"/><text class="career-tick" x="{px:.2f}" y="14">{year}</text>')
    svg.append('<text class="career-tick" x="988" y="14" text-anchor="end">Present</text>')
    for title,y in [('EDUCATION',60),('INTERNSHIPS',106),('INDUSTRY',152)]:
        svg.append(f'<text class="career-lane" x="0" y="{y+4}">{title}</text>')
    bs=x('2008-02-01')
    svg.append(f'<circle class="career-milestone" cx="{bs:.2f}" cy="62.5" r="3"><title>POSTECH B.S. · February 2008</title></circle><text class="career-label" x="{bs:.2f}" y="80">B.S.</text>')
    svg.append(period('2008-08-01','2015-08-01',60,'POSTECH Ph.D. · August 2008–August 2015'))
    svg.append(f'<text class="career-label" x="{x("2008-08-01"):.2f}" y="50">POSTECH Ph.D. · 2008–2015</text>')
    svg.append(period('2010-09-01','2011-05-01',106,'Microsoft Research Asia · September 2010–May 2011'))
    svg.append(period('2011-06-01','2011-08-01',106,'Microsoft Research Redmond · June–August 2011'))
    svg.append(f'<text class="career-label" x="{x("2010-09-01"):.2f}" y="96">Microsoft Research · 2010–2011</text>')
    svg.append(period('2015-08-01','2015-12-01',106,'Adobe Research internship · August–December 2015'))
    svg.append(f'<text class="career-label" x="{x("2015-08-01"):.2f}" y="96">Adobe Research · 2015</text>')
    svg.append(period('2016-02-01','2016-05-01',152,'Bagelcode · February–May 2016'))
    svg.append(f'<text class="career-label" x="{x("2016-05-01"):.2f}" y="142" text-anchor="end">Bagelcode · 2016</text>')
    svg.append(period('2016-07-01',None,152,'Adobe Research · July 2016–present',True))
    svg.append(f'<text class="career-label current-label" x="{x("2016-07-01")+8:.2f}" y="142">Adobe Research · 2016–present</text>')
    svg.append('</svg>')
    return ''.join(svg)
