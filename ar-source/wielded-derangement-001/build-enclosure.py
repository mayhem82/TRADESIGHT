"""Original open mechanical walls. Reuses the suite's cube vertex buffer.
Run from this source directory; no external dependencies, assets or services.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
assets=root/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets'
source=json.loads((assets/'machine.gltf').read_text())
nodes=[];meshes=[];roots=[]
materials=[{'name':name,'pbrMetallicRoughness':{'baseColorFactor':[*rgb,1],'metallicFactor':.15,'roughnessFactor':.6},'emissiveFactor':emission} for name,rgb,emission in [('wall-steel',[.12,.22,.23],[0,0,0]),('wall-brass',[.6,.37,.13],[.08,.03,0]),('wall-lamp',[.9,.52,.16],[.45,.17,.025])]]
# Merge all boxes of each material into a single mesh via baked vertices. This
# keeps 20 articulated modules to 60 draws rather than hundreds of child boxes.
import struct
binary=(assets/'geometry.bin').read_bytes();v=source['bufferViews'][0];n=source['bufferViews'][1]
cube=[struct.unpack_from('<fff',binary,v['byteOffset']+i*12) for i in range(36)]
normals=[struct.unpack_from('<fff',binary,n['byteOffset']+i*12) for i in range(36)]
boxes=[[],[],[]]
def box(material,p,s):boxes[material].append((p,s))
for x in [-.43,.43]:
 box(0,(x,.5,0),(.09,1,.15));box(1,(x,.5,.09),(.018,.94,.025))
for y in [.025,.25,.5,.75,.975]:box(0,(0,y,0),(.9,.045,.16))
for x in [-.26,0,.26]:
 box(1,(x,.5,0),(.035,.86,.06));box(2,(x,.78,.08),(.075,.035,.025))
data=bytearray();views=[];accessors=[];primitives=[]
for material,group in enumerate(boxes):
 positions=[];ns=[]
 for p,s in group:
  positions.extend([[p[j]+a[j]*s[j] for j in range(3)] for a in cube]);ns.extend(normals)
 ids=[]
 for values,is_position in [(positions,True),(ns,False)]:
  start=len(data)
  for a in values:data.extend(struct.pack('<fff',*a))
  views.append({'buffer':0,'byteOffset':start,'byteLength':len(data)-start,'target':34962})
  a={'bufferView':len(views)-1,'componentType':5126,'count':len(values),'type':'VEC3'}
  if is_position:a.update(min=[min(v[j] for v in values) for j in range(3)],max=[max(v[j] for v in values) for j in range(3)])
  ids.append(len(accessors));accessors.append(a)
 primitives.append({'attributes':{'POSITION':ids[0],'NORMAL':ids[1]},'material':material})
meshes=[{'primitives':primitives}]
for i in range(20):roots.append(len(nodes));nodes.append({'name':f'wall-module-{i}','mesh':0})
gltf={'asset':{'version':'2.0','generator':'Original Wielded outer mechanical enclosure'},'scene':0,'scenes':[{'nodes':roots}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'uri':'enclosure.bin','byteLength':len(data)}],'bufferViews':views,'accessors':accessors}
(assets/'enclosure.bin').write_bytes(data);(assets/'enclosure.gltf').write_text(json.dumps(gltf,separators=(',',':')))
print(json.dumps({'modules':20,'draw_primitives':60,'triangles':sum(a['count'] for a in accessors[::2])//3*20,'binary_bytes':len(data)}))
