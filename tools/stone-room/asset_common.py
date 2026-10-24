"""Blender 4.3: blender -b --python tools/stone-room/build_room.py (or build_npc.py)
Original model; illustrative dimensions. Photo-guided likeness, not photogrammetry.
"""
import bpy, math, random, json
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[2]; A=R/'public/stone-room/assets';D=R/'design/stone-room';T=A/'textures'
random.seed(9403)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color,kind=None,rough=.7):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough
 if kind:
  for suffix,socket in [('albedo.jpg','Base Color'),('roughness.png','Roughness'),('normal.png','Normal')]:
   texture_file='oak-generated.jpg' if kind=='oak' and suffix=='albedo.jpg' else kind+'-'+suffix
   im=bpy.data.images.load(str(T/texture_file),check_existing=True);tex=n.new('ShaderNodeTexImage');tex.image=im
   if socket=='Base Color':m.node_tree.links.new(tex.outputs['Color'],p.inputs[socket])
   elif socket=='Normal':
    im.colorspace_settings.name='Non-Color';norm=n.new('ShaderNodeNormalMap');norm.inputs['Strength'].default_value=.18 if kind=='oak' else .35 if kind in ['skin','denim','jacket'] else .65;m.node_tree.links.new(tex.outputs['Color'],norm.inputs['Color']);m.node_tree.links.new(norm.outputs['Normal'],p.inputs['Normal'])
   else:
    im.colorspace_settings.name='Non-Color';sep=n.new('ShaderNodeSeparateColor');m.node_tree.links.new(tex.outputs['Color'],sep.inputs[0]);m.node_tree.links.new(sep.outputs[1],p.inputs[socket])
 return m
def mesh(name,vs,fs,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.data.materials.append(mat);return o
def finish(o,bevel=0):
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 if bevel:
  m=o.modifiers.new('Worn edges','BEVEL');m.width=bevel;m.segments=2;bpy.ops.object.modifier_apply(modifier=m.name)
 if not o.data.uv_layers:
  bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
 o.select_set(False);return o
def cube(name,loc,scale,mat,bevel=.008):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat);finish(o,bevel);return o
def ball(name,loc,scale,mat,seg=24,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 o.select_set(False);return o

def merge(objects,name):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name=name;return o
