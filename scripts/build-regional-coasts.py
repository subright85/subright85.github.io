"""Clip directed OSM coastlines into regional land masks (offline, Shapely 2)."""
import json, math
from pathlib import Path
from shapely.geometry import LineString, Point, box, mapping
from shapely.ops import unary_union, polygonize
from shapely.strtree import STRtree
ROOT=Path(__file__).resolve().parent.parent
regions=json.loads((ROOT/'data/neighbor-regions.json').read_text())
raw=json.loads((ROOT/'data/neighbor-cache/coastlines.json').read_text())
assert not raw.get('remark'),raw.get('remark')
lines=[LineString([(p['lon'],p['lat']) for p in way['geometry']]) for way in raw['elements'] if way.get('geometry')]
tree=STRtree(lines)
out=ROOT/'data/regional-coasts';out.mkdir(exist_ok=True)
for region in regions:
    south,west,north,east=region['bbox'];extent=box(west,south,east,north)
    clipped=[]
    for index in tree.query(extent,predicate='intersects'):
        result=lines[index].intersection(extent)
        if result.geom_type=='LineString':clipped.append(result)
        elif result.geom_type=='MultiLineString':clipped.extend(result.geoms)
    if not clipped:
        print(region['slug'],'no marine coastline',flush=True);continue
    faces=list(polygonize(unary_union([extent.boundary,*clipped])))
    face_tree=STRtree(faces);land=set();water=set()
    # OSM natural=coastline ways put land on their left. Sample both sides
    # of long segments, away from vertices, to classify polygonized faces.
    for line in clipped:
        coords=list(line.coords)
        segments=sorted(zip(coords,coords[1:]),key=lambda pair:(pair[1][0]-pair[0][0])**2+(pair[1][1]-pair[0][1])**2,reverse=True)
        for a,b in segments[:3]:
            dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy)
            if length<1e-9:continue
            mid=((a[0]+b[0])/2,(a[1]+b[1])/2);epsilon=min(1e-6,length/20)
            for sign,destination in [(1,land),(-1,water)]:
                point=Point(mid[0]-sign*dy/length*epsilon,mid[1]+sign*dx/length*epsilon)
                destination.update(int(i) for i in face_tree.query(point,predicate='within'))
    conflicted=land&water
    if conflicted:
        # Incomplete or inconsistently directed coast data must not become a fake land mask.
        print(region['slug'],'ambiguous faces',len(conflicted),flush=True)
        (out/f'{region["slug"]}.json').unlink(missing_ok=True)
        continue
    valid=[faces[i] for i in land]
    if not valid:
        print(region['slug'],'no classified land',flush=True);continue
    geometry=unary_union(valid).simplify(.0001,preserve_topology=True)
    payload={'type':'FeatureCollection','features':[{'type':'Feature','properties':{},'geometry':mapping(geometry)}], 'bbox':region['bbox'],'source_snapshot':raw.get('osm3s',{}).get('timestamp_osm_base')}
    (out/f'{region["slug"]}.json').write_text(json.dumps(payload,separators=(',',':'))+'\n')
    print(region['slug'],len(clipped),'coast ways',len(valid),'land faces',flush=True)
