import bpy,math
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(R/'design/stone-room/StoneRoom.blend'))
bpy.ops.import_scene.gltf(filepath=str(R/'public/stone-room/assets/photo-guided-npc.glb'))
# Exporter root character object is the armature.
for o in list(bpy.context.selected_objects):
 if o.parent is None:o.location.x+=.8;o.location.y+=.9
scene=bpy.context.scene
bpy.ops.object.camera_add(location=(-2.05,-2.05,1.65));cam=bpy.context.object;cam.rotation_euler=(Vector((.4,.6,1.3))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=22;scene.camera=cam
bpy.ops.object.light_add(type='SUN',location=(-3,8,6));sun=bpy.context.object;sun.rotation_euler=(.45,-.35,-.4);sun.data.energy=2.5;sun.data.angle=.08
scene.world.color=(.3,.3,.3)
bpy.ops.object.light_add(type='AREA',location=(0,0,2.8));light=bpy.context.object;light.data.energy=250;light.data.shape='DISK';light.data.size=5
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=False;scene.render.resolution_x=960;scene.render.resolution_y=600;scene.render.resolution_percentage=100;scene.render.filepath=str(R/'tests/stone-room/blender-review.png');bpy.ops.render.render(write_still=True)
