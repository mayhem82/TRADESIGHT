"""Read CC0 MakeHuman data only; no MakeHuman application code is incorporated."""
from pathlib import Path
from mathutils import Vector

def anatomical_data(root):
    vertices=[]; groups={}; group=''; uv=[]
    for line in (root/'base.obj').read_text().splitlines():
        p=line.split()
        if not p: continue
        if p[0]=='v': vertices.append(Vector(map(float,p[1:])))
        elif p[0]=='vt': uv.append(tuple(map(float,p[1:3])))
        elif p[0]=='g': group=p[1]; groups[group]=[]
        elif p[0]=='f': groups[group].append(tuple(int(x.split('/')[0])-1 for x in p[1:]))
    for line in (root/'adult-male.target').read_text().splitlines():
        if not line or line.startswith('#'): continue
        p=line.split(); vertices[int(p[0])]+=Vector(map(float,p[1:]))
    body=groups['body']; used={i for f in body for i in f}
    low=min(vertices[i].y for i in used); scale=1.79/(max(vertices[i].y for i in used)-low)
    # Convert MakeHuman Y-up / +Z front into Blender Z-up / -Y front.
    vertices=[Vector((v.x*scale,-v.z*scale,(v.y-low)*scale)) for v in vertices]
    joints={k:sum((vertices[i] for i in {i for f in fs for i in f}),Vector())/len({i for f in fs for i in f}) for k,fs in groups.items() if k.startswith('joint-')}
    return vertices,body,joints

def subset(vertices,faces,predicate,transform=lambda p:p):
    selected=[f for f in faces if all(predicate(vertices[i]) for i in f)]
    used=sorted({i for f in selected for i in f}); remap={old:new for new,old in enumerate(used)}
    return [transform(vertices[i].copy()) for i in used],[tuple(remap[i] for i in f) for f in selected]
