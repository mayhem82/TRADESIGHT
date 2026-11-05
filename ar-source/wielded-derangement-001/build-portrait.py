"""User-authorized photo-derived curved relief; not a measured reconstruction.
Only replaces children of face-0..11. All mechanical nodes stay unchanged.
Requires original frontal-head.png supplied through Julian's self-email.
"""
import json,math,struct,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[2];assets=root/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets'
texture=assets/'frontal-head.png';assert hashlib.sha256(texture.read_bytes()).hexdigest()=='0b7b3712ce697e8aa034d2a5e0cfd297651edba88ff29df680c39961bebb5564'
path=assets/'machine.gltf';g=json.loads(path.read_text());assert not any(b['uri']=='portrait-relief.bin' for b in g['buffers']),'Already built'
NX,NY=24,32
def depth(x,y):
 # Shallow convex face relief with a gentle central nose rise. The photograph,
 # not inferred depth, supplies likeness. No texture wraps round the back.
 return .025+.085*max(0,1-(x/.29)**2)*max(0,1-(y/.43)**2)+.035*math.exp(-(x/.06)**2-((y+.055)/.13)**2)
positions=[];normals=[];uv=[];indices=[]
for j in range(NY+1):
 for i in range(NX+1):
  u=i/NX;v=j/NY;x=(u-.5)*.54;y=(v-.5)*.72;z=depth(x,y);eps=.0001
  dx=(depth(x+eps,y)-depth(x-eps,y))/(2*eps);dy=(depth(x,y+eps)-depth(x,y-eps))/(2*eps);n=[-dx,-dy,1];length=math.sqrt(sum(a*a for a in n))
  positions.append([x,y,z]);normals.append([a/length for a in n]);uv.append([u,1-v])
for j in range(NY):
 for i in range(NX):
  a=j*(NX+1)+i;b=a+1;c=a+NX+1;d=c+1;indices.extend([a,b,d,a,d,c])
binary=bytearray();buffer=len(g['buffers']);attributes={}
for name,values,kind,typ,component,target in [('POSITION',positions,'f','VEC3',5126,34962),('NORMAL',normals,'f','VEC3',5126,34962),('TEXCOORD_0',uv,'f','VEC2',5126,34962),('INDICES',[[i] for i in indices],'H','SCALAR',5123,34963)]:
 while len(binary)%4:binary.append(0)
 offset=len(binary)
 for row in values:binary.extend(struct.pack('<'+kind*len(row),*row))
 view=len(g['bufferViews']);g['bufferViews'].append({'buffer':buffer,'byteOffset':offset,'byteLength':len(binary)-offset,'target':target});a={'bufferView':view,'componentType':component,'count':len(values),'type':typ}
 if name=='POSITION':a.update(min=[min(v[k] for v in positions) for k in range(3)],max=[max(v[k] for v in positions) for k in range(3)])
 attributes[name]=len(g['accessors']);g['accessors'].append(a)
g['buffers'].append({'uri':'portrait-relief.bin','byteLength':len(binary)})
g['images']=[{'uri':'frontal-head.png','name':'Julian photo-derived frontal head'}];g['samplers']=[{'magFilter':9729,'minFilter':9729,'wrapS':33071,'wrapT':33071}];g['textures']=[{'source':0,'sampler':0}]
roots={n.get('name'):n for n in g['nodes']}
for i in range(12):
 material=len(g['materials']);g['materials'].append({'name':f'julian-face-{i}-independent-fade','alphaMode':'BLEND','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':1},'extras':{'provenance':'Photo-derived shallow frontal relief; not measured 3D','sourceLibraryId':'libfile_82238e4d310481919f923e8a4ccce95c','gmailMessageId':'1a1aaba57bb86ac5'}})
 mesh=len(g['meshes']);g['meshes'].append({'name':f'julian-relief-{i}','primitives':[{'attributes':{k:v for k,v in attributes.items() if k!='INDICES'},'indices':attributes['INDICES'],'material':material}]})
 node=len(g['nodes']);g['nodes'].append({'name':f'julian-relief-surface-{i}','mesh':mesh});roots[f'face-{i}']['children']=[node]
g.setdefault('extras',{})['portrait']={'technique':'photo-derived curved relief','texture_sha256':hashlib.sha256(texture.read_bytes()).hexdigest(),'not_measured_3d':True,'grid':[NX,NY],'triangles_per_face':len(indices)//3}
(assets/'portrait-relief.bin').write_bytes(binary);path.write_text(json.dumps(g,separators=(',',':')),encoding='utf-8');print(json.dumps({'vertices':len(positions),'triangles_per_face':len(indices)//3,'faces':12,'binary_bytes':len(binary)}))
