"""Ray-test production GLB apertures, not source object names."""
import bpy,json
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.import_scene.gltf(filepath=str(R/'public/stone-room/assets/stone-room.glb'))
deps=bpy.context.evaluated_depsgraph_get();count=0
for side,points in [('north',[-2.6,-2.1,-1.5,-1.0,1,1.5,2.1,2.6]),('south',[-1,-.6,.6,1]),('west',[-1.3,-.9,-.1,.3])]:
 for u in points:
  for h in [.85,1.3,2.3]:
   origin=Vector((u,0,h)) if side!='west' else Vector((0,u,h));direction=Vector((0,-1 if side=='north' else 1,0)) if side!='west' else Vector((-1,0,0))
   result=bpy.context.scene.ray_cast(deps,origin,direction,distance=5)
   assert not result[0],(side,u,h,result[4].name,tuple(result[1]));count+=1
assert bpy.context.scene.ray_cast(deps,Vector((0,0,1.6)),Vector((1,0,0)),distance=5)[0],'East structural wall missing'
report={'windowRaysClear':count,'eastWallSolid':True,'productionGLB':True};(R/'tests/stone-room/geometry-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
