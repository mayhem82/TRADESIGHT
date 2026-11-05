"""Independent section materials, preserving exact curved vertex buffers.
Same visible triangles and material draws; per-section light waves need
independent uniforms instead of a single shared material across all sections.
"""
from pathlib import Path
import json,copy
root=Path(__file__).resolve().parents[2];assets=root/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets';g=json.loads((assets/'enclosure-circle.gltf').read_text());original_mesh=g['meshes'][0];original_materials=g['materials'];g['meshes']=[];g['materials']=[]
for section,node in enumerate(g['nodes']):
 mesh=copy.deepcopy(original_mesh)
 for primitive in mesh['primitives']:
  material=copy.deepcopy(original_materials[primitive['material']]);material['name']=f"section-{section}-"+material['name'];material['extras']={'wallSection':section};primitive['material']=len(g['materials']);g['materials'].append(material)
 node['mesh']=len(g['meshes']);g['meshes'].append(mesh)
g['asset']['generator']='Original circular machine with independent music-driven section lights';(assets/'enclosure-wave.gltf').write_text(json.dumps(g,separators=(',',':')));print(json.dumps({'sections':len(g['nodes']),'materials':len(g['materials']),'draws':60,'new_vertex_buffers':0}))
