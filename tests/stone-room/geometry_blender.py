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
# Face winding must point towards the room on the inner north/south wall skins.
normal_checks=0
for u in [-3.7,-3.4,-.45,.15,.5,3.4,3.7]:
 for h in [.18,.45,1.35,1.8,2.8]:
  for direction in [Vector((0,-1,0)),Vector((0,1,0))]:
   # South central window intentionally excluded.
   if abs(u)<1.2 and .7<h<2.5 and direction.y>0:continue
   hit=bpy.context.scene.ray_cast(deps,Vector((u,0,h)),direction,distance=4)
   assert hit[0],('solid wall missing',u,h,tuple(direction))
   assert hit[2].dot(direction)<0,('inward stone face',u,h,tuple(hit[2]),tuple(direction))
   normal_checks+=1
report={'windowRaysClear':count,'eastWallSolid':True,'outwardNormalChecks':normal_checks,'productionGLB':True};(R/'tests/stone-room/geometry-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
