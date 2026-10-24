"""Bake photo projection into a continuous head UV atlas for portable glTF materials."""
import bpy

def bake_face(head, texture_dir):
    head.data.uv_layers.active.name='HeadAtlas'
    projection=head.data.uv_layers.new(name='PhotoProjection')
    for poly in head.data.polygons:
        for li in poly.loop_indices:
            p=head.data.vertices[head.data.loops[li].vertex_index].co
            projection.data[li].uv=((p.x+.096)/.192,(p.z-1.53)/.19)
    head.data.uv_layers.active_index=0
    def smooth(a,b,x):
        t=max(0,min(1,(x-a)/(b-a))); return t*t*(3-2*t)
    mask=head.data.color_attributes.new(name='PhotoBlend',type='FLOAT_COLOR',domain='POINT')
    for v in head.data.vertices:
        w=(1-smooth(.055,.085,abs(v.co.x)))*smooth(.035,.075,-v.co.y)*smooth(1.54,1.565,v.co.z)*(1-smooth(1.71,1.745,v.co.z))
        mask.data[v.index].color=(w,w,w,1)
    mat=bpy.data.materials.new('Continuous photo-guided skin');mat.use_nodes=True
    nodes=mat.node_tree.nodes;links=mat.node_tree.links;nodes.clear()
    out=nodes.new('ShaderNodeOutputMaterial');emit=nodes.new('ShaderNodeEmission');mix=nodes.new('ShaderNodeMixRGB')
    attr=nodes.new('ShaderNodeVertexColor');attr.layer_name='PhotoBlend';links.new(attr.outputs['Color'],mix.inputs[0])
    for filename,uvname,index in [('skin-albedo.jpg','HeadAtlas',1),('face-neutral-generated.jpg','PhotoProjection',2)]:
        tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(texture_dir/filename),check_existing=True)
        uv=nodes.new('ShaderNodeUVMap');uv.uv_map=uvname;links.new(uv.outputs[0],tex.inputs['Vector']);links.new(tex.outputs['Color'],mix.inputs[index])
    links.new(mix.outputs[0],emit.inputs[0]);links.new(emit.outputs[0],out.inputs['Surface'])
    atlas=bpy.data.images.new('Head skin atlas',width=1024,height=1024)
    target=nodes.new('ShaderNodeTexImage');target.image=atlas;nodes.active=target
    head.data.materials.clear();head.data.materials.append(mat)
    for poly in head.data.polygons:poly.material_index=0
    bpy.ops.object.select_all(action='DESELECT');head.select_set(True);bpy.context.view_layer.objects.active=head
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=1;scene.render.bake.margin=12
    bpy.ops.object.bake(type='EMIT')
    atlas.filepath_raw=str(texture_dir/'head-baked.jpg');atlas.file_format='JPEG';atlas.save();atlas.pack()
    nodes.clear();out=nodes.new('ShaderNodeOutputMaterial');shader=nodes.new('ShaderNodeBsdfPrincipled');shader.inputs['Roughness'].default_value=.78
    tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(atlas.filepath_raw,check_existing=False);tex.image.pack();links.new(tex.outputs['Color'],shader.inputs['Base Color']);links.new(shader.outputs[0],out.inputs['Surface'])
    head.data.color_attributes.remove(mask);head.data.uv_layers.remove(projection);head.data.uv_layers[0].name='UVMap';head.data.uv_layers[0].active_render=True;head.select_set(False)
