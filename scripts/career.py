"""Compact career chart. Periods use month boundaries from the source CV."""
from datetime import date
from html import escape


def render_career(compact=False):
    width = 340 if compact else 1000
    origin, endpoint = (56, 334) if compact else (100, 988)
    suffix = "mobile" if compact else "desktop"
    def label(full, short):
        return short if compact else full
    start, end = date(2008, 1, 1), date.today()
    compression_start = date(2017, 1, 1)
    def elapsed(value):
        return (min(value, compression_start) - start).days + max(0, (value - compression_start).days) * .35
    def x(value):
        return origin + elapsed(date.fromisoformat(value)) / elapsed(end) * (endpoint - origin)
    def period(begin, finish, y, label, current=False):
        left, right = x(begin), x(finish) if finish else endpoint
        return f'<rect class="period-bar{" present" if current else ""}" x="{left:.2f}" y="{y}" width="{right-left:.2f}" height="5" rx="2"><title>{escape(label)}</title></rect>'
    svg = [f'<svg class="career-chart career-chart-{suffix}" viewBox="0 0 {width} 170" role="img" aria-labelledby="career-chart-title-{suffix} career-chart-description-{suffix}" xmlns="http://www.w3.org/2000/svg">',
           f'<title id="career-chart-title-{suffix}">Experience and education, 2008 to present</title>',
           f'<desc id="career-chart-description-{suffix}">The shared time scale is compressed after 2017, marked by a double slash. POSTECH B.S., February 2008; Ph.D., August 2008–August 2015. Microsoft Research Asia internship, September 2010–May 2011; Redmond internship, June–August 2011. Adobe internship, August–December 2015. Bagelcode, February–May 2016. Adobe Research, July 2016–present. Full details follow the chart.</desc>']
    for year in ((2008, 2016) if compact else (2008, 2012, 2016)):
        px = x(f'{year}-01-01')
        svg.append(f'<line class="career-grid" x1="{px:.2f}" y1="26" x2="{px:.2f}" y2="165"/><text class="career-tick" x="{px:.2f}" y="14">{year}</text>')
    svg.append(f'<text class="career-tick" x="{endpoint}" y="14" text-anchor="end">Present</text>')
    for title,y in [(label('EDUCATION','Education'),60),(label('INTERNSHIPS','Interns'),106),(label('INDUSTRY','Industry'),152)]:
        svg.append(f'<text class="career-lane" x="0" y="{y+4}">{title}</text>')
    bs=x('2008-02-01')
    svg.append(f'<circle class="career-milestone" cx="{bs:.2f}" cy="62.5" r="3"><title>POSTECH B.S. · February 2008</title></circle><text class="career-label" x="{bs:.2f}" y="80">B.S.</text>')
    svg.append(period('2008-08-01','2015-08-01',60,'POSTECH Ph.D. · August 2008–August 2015'))
    svg.append(f'<text class="career-label" x="{x("2008-08-01"):.2f}" y="50">{label("POSTECH Ph.D. · 2008–2015", "POSTECH Ph.D.")}</text>')
    svg.append(period('2010-09-01','2011-05-01',106,'Microsoft Research Asia · September 2010–May 2011'))
    svg.append(period('2011-06-01','2011-08-01',106,'Microsoft Research Redmond · June–August 2011'))
    svg.append(f'<text class="career-label" x="{x("2010-09-01"):.2f}" y="96">{label("Microsoft Research · 2010–2011", "MS Research")}</text>')
    svg.append(period('2015-08-01','2015-12-01',106,'Adobe Research internship · August–December 2015'))
    svg.append(f'<text class="career-label" x="{x("2015-08-01"):.2f}" y="96">{label("Adobe Research · 2015", "Adobe")}</text>')
    svg.append(period('2016-02-01','2016-05-01',152,'Bagelcode · February–May 2016'))
    svg.append(f'<text class="career-label" x="{x("2016-05-01"):.2f}" y="142" text-anchor="end">{label("Bagelcode · 2016", "Bagelcode")}</text>')
    svg.append(period('2016-07-01',None,152,'Adobe Research · July 2016–present',True))
    svg.append(f'<text class="career-label current-label" x="{x("2016-07-01")+8:.2f}" y="142">{label("Adobe Research · 2016–present", "Adobe · 2016–now")}</text>')
    cut = x('2017-01-01')
    svg.append(f'<text class="career-tick" x="{cut:.2f}" y="14">//<title>Time scale compressed after 2017</title></text>')
    svg.append(f'<rect class="career-break" x="{cut-3:.2f}" y="150" width="12" height="9"/><text class="career-break-mark" x="{cut-2:.2f}" y="158">//<title>Time scale compressed after 2017</title></text>')
    svg.append('</svg>')
    return ''.join(svg)
