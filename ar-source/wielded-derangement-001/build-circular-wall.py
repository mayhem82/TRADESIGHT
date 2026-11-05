"""Curved mechanical wall sections on a unit circle. Standard-library only.
Reuses the original wall vocabulary and material definitions; central untouched.
"""
from pathlib import Path
import json,struct,math
root=Path(__file__).resolve().parents[2];assets=root/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets';original=json.loads((assets/'enclosure.gltf').read_text());boxes=[[],[],[]]
def box(material,p,s):boxes[material].append((p,s))
for x in [-.43,.43]:box(0,(x,.5,0),(.09,1,.15));box(1,(x,.5,.09),(.018,.94,.025))
for y in [.025,.25,.5,.75,.975]:box(0,(0,y,0),(.9,.045,.16))
for x in [-.26,0,.26]:box(1,(x,.5,0),(.035,.86,.06));box(2,(x,.78,.08),(.075,.035,.025))
STEP=math.tau/20
def curved(p,n):
 angle=p[0]*STEP;r=1-p[2]*.1;c=math.cos(angle);s=math.sin(angle)
 return [r*s,p[1],1-r*c],[n[0]*c-n[2]*s,n[1],n[0]*s+n[2]*c]
def surface(p,size):
 result=[];normals=[]
 for axis in range(3):
  other=[j for j in range(3) if j!=axis];counts=[8 if j==0 and size[0]>.5 else 1 for j in other]
  for side in [-1,1]:
   normal=[0,0,0];normal[axis]=side
   for i in range(counts[0]):
    for j in range(counts[1]):
     points=[]
     for u,v in [(i,j),(i+1,j),(i+1,j+1),(i,j+1)]:
      a=list(p);a[axis]+=side*size[axis]/2;a[other[0]]+=(u/counts[0]-.5)*size[other[0]];a[other[1]]+=(v/counts[1]-.5)*size[other[1]];points.append(a)
     a,b,c=points[:3];cross=[(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])]
     indices=[0,1,2,0,2,3] if sum(x*y for x,y in zip(cross,normal))>0 else [0,2,1,0,3,2]
     for k in indices:position,n=curved(points[k],normal);result.append(position);normals.append(n)
 return result,normals
data=bytearray();views=[];accessors=[];primitives=[]
for material,group in enumerate(boxes):
 positions=[];normals=[]
 for p,size in group:a,b=surface(p,size);positions.extend(a);normals.extend(b)
 ids=[]
 for values,position in [(positions,True),(normals,False)]:
  start=len(data)
  for row in values:data.extend(struct.pack('<fff',*row))
  views.append({'buffer':0,'byteOffset':start,'byteLength':len(data)-start,'target':34962});a={'bufferView':len(views)-1,'componentType':5126,'count':len(values),'type':'VEC3'}
  if position:a.update(min=[min(v[j] for v in values) for j in range(3)],max=[max(v[j] for v in values) for j in range(3)])
  ids.append(len(accessors));accessors.append(a)
 primitives.append({'attributes':{'POSITION':ids[0],'NORMAL':ids[1]},'material':material})
nodes=[{'name':f'wall-module-{i}','mesh':0} for i in range(20)]
model={'asset':{'version':'2.0','generator':'Original curved mechanical ring sections'},'scene':0,'scenes':[{'nodes':list(range(20))}],'nodes':nodes,'meshes':[{'primitives':primitives}],'materials':original['materials'],'buffers':[{'uri':'enclosure-circle.bin','byteLength':len(data)}],'bufferViews':views,'accessors':accessors}
(assets/'enclosure-circle.bin').write_bytes(data);(assets/'enclosure-circle.gltf').write_text(json.dumps(model,separators=(',',':')));print(json.dumps({'sections':20,'panel_triangles':sum(a['count']//3 for a in accessors[::2])*20,'binary_bytes':len(data),'draws':60}))
