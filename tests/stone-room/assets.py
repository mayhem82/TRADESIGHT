"""Independent GLB contract validation using only the standard library."""
from pathlib import Path
import json,struct
ROOT=Path(__file__).resolve().parents[2]
def inspect(path):
 b=path.read_bytes();magic,version,length=struct.unpack_from('<III',b)
 assert magic==0x46546c67 and version==2 and length==len(b)
 n,kind=struct.unpack_from('<II',b,12);assert kind==0x4e4f534a
 d=json.loads(b[20:20+n]);prims=[p for m in d['meshes'] for p in m['primitives']]
 assert all('TEXCOORD_0' in p['attributes'] for p in prims),'UV missing'
 assert all('NORMAL' in p['attributes'] for p in prims),'Normals missing'
 assert all('uri' not in im for im in d.get('images',[])),'Textures must be embedded'
 tris=sum(d['accessors'][p['indices']]['count']//3 for p in prims)
 return d,{'bytes':len(b),'triangles':tris,'drawCalls':len(prims),'textures':len(d.get('images',[]))}
a,room=inspect(ROOT/'public/stone-room/assets/stone-room.glb');n,npc=inspect(ROOT/'public/stone-room/assets/photo-guided-npc.glb')
assert {'Architecture','Ceiling'} <= {x.get('name') for x in a['nodes']}
assert room['drawCalls']<=16 and room['triangles']<220000
assert {'Idle','Walk','Wave','LookAround'} <= {x['name'] for x in n['animations']}
assert n.get('skins') and len(n['skins'][0]['joints'])>=16
assert all('JOINTS_0' in p['attributes'] and 'WEIGHTS_0' in p['attributes'] for m in n['meshes'] for p in m['primitives'])
assert npc['triangles']<100000 and npc['drawCalls']<=12
for f in ['StoneRoom.FCStd','StoneRoom.step','StoneRoom.blend','PhotoGuidedNPC.blend']:assert (ROOT/'design/stone-room'/f).stat().st_size>1000
report={'room':room,'npc':npc,'verified':'GLB structure, embedded images, UVs, normals, named clips, skeleton and weights; not visual quality or physical-device performance'}
(ROOT/'tests/stone-room/assets-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
