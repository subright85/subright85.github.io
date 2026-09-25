"""One-off cached OSM extracts for the surroundings of confirmed places.
No API calls are made by the website. Run sequentially with a descriptive UA.
"""
import json, math, subprocess, time, os
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'data/neighbor-cache'; CACHE.mkdir(exist_ok=True)
selections=json.loads((ROOT/'data/boundary-selections.json').read_text())
endpoint=os.environ.get('OVERPASS_ENDPOINT','https://overpass-api.de/api/interpreter')
previous_path=ROOT/'data/neighbor-regions.json'
previous={r['slug']:r for r in json.loads(previous_path.read_text())} if previous_path.exists() else {}
manifest=[]
for selection in selections:
    first=selection['sources'][0]
    slug=first['cache']
    raw=json.loads((ROOT/f'data/boundary-cache/{slug}.json').read_text())
    if 'features' in raw:
        geom=raw['features'][0]['geometry']; coords=geom['coordinates']
        def flatten(x):
            if isinstance(x[0], (float,int)): yield x
            else:
                for v in x: yield from flatten(v)
        points=list(flatten(coords)); west,east=min(p[0] for p in points),max(p[0] for p in points);south,north=min(p[1] for p in points),max(p[1] for p in points)
    else:
        south,north,west,east=map(float,raw[first['index']]['boundingbox'])
    # Give small cities ~20 km context; wide municipalities retain their extent.
    lat=(south+north)/2
    dy=max(.16,(north-south)*.23); dx=max(.2/max(.4,math.cos(math.radians(lat))),(east-west)*.23)
    bbox=[round(south-dy,4),round(west-dx,4),round(north+dy,4),round(east+dx,4)]
    # Fixed regional extracts: do not load world-wide municipal data.
    ids=[s['osm_id'] for s in selection['sources'] if s.get('osm_id')]
    own=f'relation(id:{",".join(map(str,ids))});' if ids else ''
    levels='6|8'
    if selection['place_keys'][0].startswith('USA|'):levels='8'
    if selection['place_keys'][0].startswith('United Kingdom|'):levels='6'
    if selection['place_keys'][0].startswith('China|'):levels='6'
    if selection['place_keys'][0].startswith('South Korea|'):levels='6'
    if selection['place_keys'][0].startswith('Taiwan|'):levels='4|8'
    if selection['kind']=='Country': levels='8'
    query=f'[out:json][timeout:35];({own}relation["boundary"="administrative"]["admin_level"~"^({levels})$"]({",".join(map(str,bbox))}););out geom;'
    item={'slug':slug,'place_keys':selection['place_keys'],'bbox':bbox,'query':query,'source':endpoint}
    manifest.append(item)
    if slug=='las-vegas':
        manifest[-1]=previous.get(slug,item)
        continue  # Official Census fallback is committed; see BOUNDARIES.md.
    target=CACHE/f'{slug}.json'
    if target.exists():
        try:
            if (cached := json.loads(target.read_text())).get('elements') and not cached.get('remark'):
                manifest[-1]=previous.get(slug,item)
                continue
        except Exception:pass
    request=CACHE/'request.ql';request.write_text(query)
    print('Fetching',slug,flush=True)
    result=subprocess.run(['curl','-sS','--compressed','--max-time','50','-A','SungchulAcademicMap/1.0 (https://subright85.github.io)','--get','--data-urlencode',f'data@{request}',endpoint,'-o',str(target)])
    try:
        data=json.loads(target.read_text());print(' ',len(data.get('elements',[])), 'features',target.stat().st_size,flush=True)
    except Exception:
        print(' Failed',slug,flush=True)
        time.sleep(30)
    time.sleep(6)
(ROOT/'data/neighbor-regions.json').write_text(json.dumps(manifest,indent=2)+'\n')
