"""One-off cached boundary lookup. One request at a time, <=1/second.
Public service policy: https://operations.osmfoundation.org/policies/nominatim/
Browser never calls Nominatim. Do not schedule or run this as a search service.
"""
import json,subprocess,time,urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'data/boundary-cache';CACHE.mkdir(parents=True,exist_ok=True)
queries={
'glasgow-city':'Glasgow City, Scotland, United Kingdom','hawaii-island':'Hawaii island',
'incheon':'Incheon, South Korea','pohang':'Pohang, South Korea','beijing':'Beijing, China','seattle':'Seattle, Washington, USA','redmond':'Redmond, Washington, USA','san-jose':'San Jose, California, USA',
'seoul':'Seoul, South Korea','maui':'Maui, Hawaii, USA','glasgow':'Glasgow, United Kingdom','hong-kong':'Hong Kong','barcelona':'Barcelona, Spain','long-beach':'Long Beach, California, USA','washington':'Washington, District of Columbia, USA','anchorage':'Anchorage, Alaska, USA','boston':'Boston, Massachusetts, USA','kota-kinabalu':'Kota Kinabalu, Malaysia','reno':'Reno, Nevada, USA','new-york':'New York City, USA','mendocino':'Mendocino, California, USA','tahoe':'Lake Tahoe, USA','honolulu':'Honolulu, Hawaii, USA','kauai':'Kauai, Hawaii, USA','las-vegas':'Las Vegas, Nevada, USA','girona':'Girona, Spain','los-cabos':'Los Cabos, Baja California Sur, Mexico','big-island':'Island of Hawaii, Hawaii, USA','anaheim':'Anaheim, California, USA','sacramento':'Sacramento, California, USA','napa':'Napa, California, USA','aspen':'Aspen, Colorado, USA','yosemite':'Yosemite National Park, California, USA','maldives':'Maldives','singapore':'Singapore','shanghai':'Shanghai, China','taipei':'Taipei, Taiwan','san-diego':'San Diego, California, USA','qingdao':'Qingdao, China','toronto':'Toronto, Ontario, Canada','niagara':'Niagara Falls, Ontario, Canada'}
for slug,query in queries.items():
 target=CACHE/f'{slug}.json'
 if not target.exists():
  params=urllib.parse.urlencode(dict(q=query,format='jsonv2',polygon_geojson=1,polygon_threshold=.003,limit=5,addressdetails=1))
  result=subprocess.run(['curl','--fail','--max-time','30','-sS','-A','SungchulKimPersonalSiteBoundaryBuild/1.0 (+https://subright85.github.io/)','https://nominatim.openstreetmap.org/search?'+params],capture_output=True,text=True)
  if result.returncode: print(slug,'ERROR',result.stderr,flush=True);break
  parsed=json.loads(result.stdout);target.write_text(json.dumps(parsed,ensure_ascii=False))
  time.sleep(1.1)
 data=json.loads(target.read_text())
 print(slug,json.dumps([dict(i=i,id=f"{r.get('osm_type')}/{r.get('osm_id')}",name=r.get('display_name'),kind=r.get('addresstype'),type=r.get('type'),geometry=r.get('geojson',{}).get('type')) for i,r in enumerate(data)],ensure_ascii=False),flush=True)
