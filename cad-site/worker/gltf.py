"""Small glTF 2.0 GLB exporter: metre units, embedded photo and front-face UVs."""
import json
import struct

def export_glb(objects, photo=None):
    binary=bytearray()
    gltf={'asset':{'version':'2.0','generator':'TradeSight FreeCAD Site CAD'},'scene':0,'scenes':[{'nodes':[]}], 'nodes':[],'meshes':[],'buffers':[{}],'bufferViews':[],'accessors':[],'materials':[]}
    def buffer(data,target=None):
        while len(binary)%4: binary.append(0)
        view={'buffer':0,'byteOffset':len(binary),'byteLength':len(data)}
        if target: view['target']=target
        gltf['bufferViews'].append(view);binary.extend(data)
        return len(gltf['bufferViews'])-1
    def accessor(values,components,kind,ctype):
        packed=struct.pack('<'+('f' if ctype==5126 else 'I')*len(values),*values)
        a={'bufferView':buffer(packed,34963 if kind=='SCALAR' else 34962),'componentType':ctype,'count':len(values)//components,'type':kind}
        if kind=='VEC3':
            a['min']=[min(values[i::3]) for i in range(3)];a['max']=[max(values[i::3]) for i in range(3)]
        gltf['accessors'].append(a);return len(gltf['accessors'])-1
    texture_material=None
    if photo and any(o.get('texture') for o in objects):
        gltf['images']=[{'bufferView':buffer(photo),'mimeType':'image/jpeg','name':'Site photograph'}]
        gltf['samplers']=[{'magFilter':9729,'minFilter':9729,'wrapS':33071,'wrapT':33071}]
        gltf['textures']=[{'sampler':0,'source':0}]
        texture_material=0
        gltf['materials'].append({'name':'Actual site photograph — mapped front surface','doubleSided':True,'pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':1}})
    for o in objects:
        if not o['faces']: continue
        position=accessor([n/1000 for p in o['positions'] for n in p],3,'VEC3',5126)
        rgb=[int(o['color'][i:i+2],16)/255 for i in (1,3,5)]
        solid_material=len(gltf['materials'])
        gltf['materials'].append({'name':o['label']+' — base colour','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':rgb+[1],'metallicFactor':0,'roughnessFactor':.9}})
        texture=o.get('texture') if texture_material is not None else None
        mapped=set(texture['faces']) if texture else set()
        primitives=[]
        for textured in (False,True):
            faces=[f for i,f in enumerate(o['faces']) if (i in mapped)==textured]
            if not faces: continue
            attributes={'POSITION':position}
            if textured:
                attributes['TEXCOORD_0']=accessor([n for uv in texture['uv'] for n in uv],2,'VEC2',5126)
            primitives.append({'attributes':attributes,'indices':accessor([i for f in faces for i in f],1,'SCALAR',5125),'material':texture_material if textured else solid_material})
        meshidx=len(gltf['meshes']);gltf['meshes'].append({'name':o['label'],'primitives':primitives})
        nodeidx=len(gltf['nodes']);gltf['nodes'].append({'name':o['label'],'mesh':meshidx,'extras':{'description':o['description'],'dimensionSource':o['source'],'material':o['material'],'initiallyHidden':o['initiallyHidden']}})
        gltf['scenes'][0]['nodes'].append(nodeidx)
    gltf['buffers'][0]['byteLength']=len(binary)
    encoded=json.dumps(gltf,separators=(',',':')).encode()
    while len(encoded)%4: encoded+=b' '
    while len(binary)%4: binary.append(0)
    return struct.pack('<III',0x46546c67,2,12+8+len(encoded)+8+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary
