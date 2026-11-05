"""Original mechanical circuit for the separate outer walls. Standard Python.
Twenty rotating cranks, moving connecting rods and a continuous overhead shaft.
"""
from pathlib import Path
import json,struct,math
root=Path(__file__).resolve().parents[2];assets=root/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets'
base=json.loads((assets/'enclosure.gltf').read_text());raw=(assets/'geometry.bin').read_bytes();machine=json.loads((assets/'machine.gltf').read_text());v,n=machine['bufferViews'][:2]
cube=[struct.unpack_from('<fff',raw,v['byteOffset']+i*12) for i in range(36)];normals=[struct.unpack_from('<fff',raw,n['byteOffset']+i*12) for i in range(36)]
data=bytearray();views=[];accessors=[];meshes=[];nodes=[]
def box(positions,ns,p,s,angle=0):
 c=math.cos(angle);ss=math.sin(angle)
 for point,normal in zip(cube,normals):
  x,y,z=[point[j]*s[j] for j in range(3)];positions.append([p[0]+x*c-y*ss,p[1]+x*ss+y*c,p[2]+z]);ns.append([normal[0]*c-normal[1]*ss,normal[0]*ss+normal[1]*c,normal[2]])
def mesh(name,boxes,material):
 positions=[];ns=[]
 for p,s,a in boxes:box(positions,ns,p,s,a)
 ids=[]
 for values,is_position in [(positions,True),(ns,False)]:
  offset=len(data)
  for row in values:data.extend(struct.pack('<fff',*row))
  views.append({'buffer':0,'byteOffset':offset,'byteLength':len(data)-offset,'target':34962});a={'bufferView':len(views)-1,'componentType':5126,'count':len(values),'type':'VEC3'}
  if is_position:a.update(min=[min(row[j] for row in positions) for j in range(3)],max=[max(row[j] for row in positions) for j in range(3)])
  ids.append(len(accessors));accessors.append(a)
 meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':ids[0],'NORMAL':ids[1]},'material':material}]})
# Open spokes and individually visible teeth make rotation legible from inside.
teeth=[]
for i in range(16):
 a=i*math.tau/16;teeth.append(([math.cos(a)*.91,math.sin(a)*.91,0],[.29,.18,.3],a))
for i in range(4):teeth.append(([0,0,0],[1.65,.14,.22],i*math.pi/4))
teeth.append(([0,0,.02],[.38,.38,.38],0));mesh('drive-crank-gear',teeth,1)
mesh('moving-connecting-rod',[([0,0,0],[1,1,1],0)],1)
mesh('continuous-transfer-shaft',[([0,0,0],[1,1,1],0)],0)
mesh('visible-crank-pin',[([0,0,0],[.055,.055,.055],0)],2)
for i in range(20):
 for kind,mesh_id in [('gear',0),('rod',1),('shaft',2),('pin',3)]:nodes.append({'name':f'wall-{kind}-{i}','mesh':mesh_id})
g={'asset':{'version':'2.0','generator':'Original continuous outer-wall crank and linkage circuit'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'materials':base['materials'],'buffers':[{'uri':'wall-drive.bin','byteLength':len(data)}],'bufferViews':views,'accessors':accessors}
(assets/'wall-drive.bin').write_bytes(data);(assets/'wall-drive.gltf').write_text(json.dumps(g,separators=(',',':')))
print(json.dumps({'moving_nodes':len(nodes),'additional_draws':80,'additional_triangles':sum(g['accessors'][m['primitives'][0]['attributes']['POSITION']]['count']//3 for m in meshes)*20,'binary_bytes':len(data)}))
