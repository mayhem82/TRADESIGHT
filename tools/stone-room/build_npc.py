import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from asset_common import *
# Character is made separately; Blender source has full mesh, material maps and armature.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
skin=material('Skin pores',(.65,.42,.31),'skin');shirt=material('Navy cotton',(.035,.07,.13),'denim');jacket=material('Dark cotton jacket',(.05,.05,.06),'jacket');denim=material('Indigo denim',(.15,.20,.27),'denim');leather=material('Worn brown boot leather',(.16,.10,.06),rough=.72);hair=material('Brown hair',(.105,.065,.038),rough=.94);frame=material('Black sunglasses frame',(.012,.014,.018),rough=.3);lens=material('Smoked lenses',(.012,.018,.025),rough=.13);metal=material('Zipper and buttons',(.35,.37,.39),rough=.38)
parts=[];assign={}
def bind(o,bone):parts.append(o);assign[o.name]=bone;return o
def ell(name,p,s,m,b='Spine'):return bind(ball(name,p,s,m),b)
def bx(name,p,s,m,b='Spine',bev=.004):return bind(cube(name,p,s,m,bev),b)
def tube(name,pts,r,mat,b='Head'):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.bevel_depth=r;cu.bevel_resolution=2;sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for v,p in zip(sp.bezier_points,pts):v.co=p;v.handle_left_type=v.handle_right_type='AUTO'
 ob=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat);bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob=bpy.context.object;ob.select_set(False);return bind(ob,b)
# Torso uses cross-section tailoring; front open jacket exposes collared navy shirt.
def loft(name,sections,mat,b='Spine'):
 vs=[];n=32
 for z,rx,ry,cy in sections:
  for i in range(n):
   a=i*math.tau/n;fold=1+.014*math.sin(i*2.7+z*70);vs.append((rx*math.cos(a)*fold,cy+ry*math.sin(a)*fold,z))
 fs=[tuple(range(n-1,-1,-1))]
 for j in range(len(sections)-1):
  for i in range(n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 fs.append(tuple(range((len(sections)-1)*n,len(sections)*n)))
 ob=mesh(name,vs,fs,mat);finish(ob)
 for p in ob.data.polygons:p.use_smooth=True
 return bind(ob,b)
loft('Navy shirt',[(.91,.15,.085,0),(1.02,.16,.096,0),(1.16,.18,.105,0),(1.35,.205,.10,0),(1.43,.19,.075,0)],shirt)
ell('Neck',(0,0,1.475),(.055,.054,.105),skin,'Neck')
# Jacket panels are separately sculpted around the shirt, with lapels and seam details.
for s in [-1,1]:
 # Continuous tailored jacket shell below replaces separate side forms.
 lap=bx('Turned lapel',(s*.092,-.105,1.345),(.065,.014,.19),jacket);lap.rotation_euler.y=s*-.25
 col=bx('Shirt collar',(s*.045,-.065,1.43),(.065,.016,.10),shirt);col.rotation_euler.y=s*-.45
 tube('Jacket stitched seam',[(s*.18,-.067,.98),(s*.192,-.07,1.17),(s*.19,-.056,1.38)],.0014,metal,'Spine')
 bx('Jacket pocket',(s*.16,-.095,1.12),(.07,.012,.105),jacket)
 bx('Boot sole',(s*.095,-.027,.025),(.105,.25,.05),frame,'Foot'+('L' if s<0 else 'R'))
 ell('Boot leather',(s*.095,-.03,.079),(.057,.123,.062),leather,'Foot'+('L' if s<0 else 'R'))
 ell('Boot ankle',(s*.095,.015,.145),(.052,.057,.11),leather,'Foot'+('L' if s<0 else 'R'))
 for z in [.085,.105,.125]:tube('Boot lace',[(s*.095-.027,-.08,z),(s*.095+.027,-.08,z)],.0015,hair,'Foot'+('L' if s<0 else 'R'))
 side='L' if s<0 else 'R';x=s*.095
 o=loft('Continuous trouser '+side,[(.15,.052,.057,.012),(.25,.06,.065,.008),(.43,.065,.072,0),(.52,.073,.078,0),(.67,.082,.087,0),(.87,.086,.085,0),(.96,.075,.08,0)],denim,'Thigh'+side);o.location.x=x
 for z in [.28,.46,.57,.83]:
  tube('Denim crease',[(x-.048,-.053,z),(x,-.077,z+.013),(x+.048,-.053,z-.006)],.0025,denim,'Shin'+side if z<.5 else 'Thigh'+side)
 o=loft('Continuous sleeve '+side,[(.86,.043,.046,-.016),(.94,.049,.052,-.012),(1.08,.055,.06,-.005),(1.16,.058,.063,0),(1.29,.066,.07,0),(1.4,.076,.077,0),(1.44,.045,.05,0)],jacket,'Arm'+side)
 for v in o.data.vertices:v.co.x+=s*(.28-max(0,v.co.z-1.1)*.18)
 bx('Sleeve cuff',(s*.28,-.016,.87),(.087,.08,.04),jacket,'Forearm'+side)
 ell('Hand palm',(s*.281,-.02,.807),(.043,.028,.065),skin,'Hand'+side)
 for i in range(4):ell('Finger',(s*.26+i*s*.013,-.025,.75-abs(i-1.5)*.007),(.008,.011,.04),skin,'Hand'+side)
 ell('Thumb',(s*.24,-.027,.806),(.012,.016,.038),skin,'Hand'+side)
 bx('Belt',(0,-.094,.935),(.29,.018,.032),leather,'Hips') if s<0 else None
# Open jacket shell with continuous shoulders, back and hem.
vs=[];fs=[];sections=[(.94,.17,.103),(1.04,.177,.108),(1.18,.191,.113),(1.34,.216,.109),(1.42,.205,.088)]
for z,rx,ry in sections:
 for i in range(33):
  a=-math.pi/2+.48+i/32*(math.tau-.96);vs.append((rx*math.cos(a),ry*math.sin(a),z))
for j in range(4):
 for i in range(32):k=j*33+i;fs.append((k,k+1,k+34,k+33))
o=mesh('Tailored open jacket',vs,fs,jacket);finish(o);bind(o,'Spine')
for p in o.data.polygons:p.use_smooth=True
for z in [1.03,1.13,1.23,1.33]:ell('Shirt button',(0,-.108,z),(.004,.003,.004),metal)
# Anatomical cranium with photo-projected front UV, shaped jaw, nose, cheek planes.
photo=material('Photo-derived face',(.7,.5,.4),rough=.8)
img=bpy.data.images.load(str(T/'face-albedo.jpg'));tex=photo.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img;photo.node_tree.links.new(tex.outputs['Color'],photo.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
head=ball('Sculpted head',(0,0,1.625),(.091,.082,.145),skin,48,32);head.data.materials.append(photo)
for v in head.data.vertices:
 x,y,z=v.co
 # Facial planes and a projecting nose from both supplied profiles.
 if y<0:
  nose=.041*math.exp(-((x/.023)**2+((z+.005)/.046)**2));chin=.012*math.exp(-((z+.108)/.027)**2);v.co.y-=nose+chin
 if z<-.045:v.co.x*=.92
uv=head.data.uv_layers.active
for poly in head.data.polygons:
 front=sum(head.data.vertices[i].co.y for i in poly.vertices)<0;poly.material_index=1 if front else 0
 if front:
  for li in poly.loop_indices:
   v=head.data.vertices[head.data.loops[li].vertex_index].co;uv.data[li].uv=((v.x+.105)/.21,(v.z+.145)/.29)
bind(head,'Head')
for s in [-1,1]:
 ell('Ear',(s*.094,.002,1.625),(.018,.018,.038),skin,'Head');ell('Ear concha',(s*.104,-.011,1.627),(.008,.006,.021),hair,'Head')
 ell('Nostril',(s*.013,-.109,1.60),(.006,.003,.003),hair,'Head')
 # Wraparound lenses have curved full geometry, plus frame bridge and temples.
 ell('Wrap lens',(s*.046,-.084,1.666),(.046,.016,.033),frame,'Head');ell('Smoked lens',(s*.046,-.096,1.666),(.041,.007,.027),lens,'Head')
 tube('Sunglass temple',[(s*.082,-.071,1.68),(s*.101,-.018,1.683),(s*.098,.037,1.666)],.004,frame)
 tube('Handlebar moustache',[(s*.005,-.108,1.579),(s*.035,-.104,1.573),(s*.069,-.084,1.562),(s*.085,-.073,1.575)],.010,hair)
 for i in range(24):
  x=s*(.006+i*.003);z=1.58-.012*math.sin(i/24*math.pi)
  tube('Moustache strand',[(x,-.116+abs(x)*.36,z+.005),(x+s*.005,-.115+abs(x)*.4,z-.009)],.00065,hair)
 for i in range(20):
  a=random.uniform(-.8,1.8);y=.025+random.random()*.05;z=1.66-random.random()*.20
  tube('Hair curl',[(s*.075,y,z+.025),(s*(.086+random.random()*.012),y+.009,z),(s*.082,y+.02,z-.025)],random.uniform(.0015,.0035),hair)
tube('Bridge',[(-.015,-.106,1.681),(0,-.112,1.687),(.015,-.106,1.681)],.005,frame)
# Six-panel baseball cap crown and curved bill, including raised dark embroidery.
vs=[];fs=[];n=48
for j in range(13):
 a=j/12*math.pi/2
 for i in range(n):
  t=i/n*math.tau;vs.append((math.cos(t)*math.cos(a)*.101,math.sin(t)*math.cos(a)*.09,1.721+math.sin(a)*.115))
for j in range(12):
 for i in range(n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
o=mesh('Six panel cap crown',vs,fs,jacket);finish(o);bind(o,'Head')
for p in o.data.polygons:p.use_smooth=True
vs=[];fs=[]
for j in range(5):
 for i in range(25):
  t=-1+i/12;r=j/4;vs.append((t*(.094+r*.015),-.04-r*.125*(1-t*t*.28),1.728-r*.02-t*t*.016))
for j in range(4):
 for i in range(24):k=j*25+i;fs.append((k,k+1,k+26,k+25))
o=mesh('Curved baseball cap bill',vs,fs,jacket);finish(o);bind(o,'Head');sol=o.modifiers.new('Bill thickness','SOLIDIFY');sol.thickness=.004;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=sol.name)
for s in [-1,1]:
 tube('Embroidered monogram',[(s*.025,-.079,1.77),(s*.025,-.075,1.799),(s*.008,-.077,1.799),(s*.008,-.082,1.775),(s*.029,-.081,1.775)],.0022,frame)
for i in range(6):
 t=i/6*math.tau;tube('Cap panel seam',[(math.cos(t)*.100,math.sin(t)*.09,1.724),(math.cos(t)*.075,math.sin(t)*.068,1.80),(0,0,1.837)],.0007,frame)
# Skeleton, weighted mesh, named animation clips. Front is Blender -Y / glTF +Z.
arm=bpy.data.armatures.new('HumanSkeleton');rig=bpy.data.objects.new('PhotoGuidedNPC',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
bones=[('Hips',(0,0,.91),(0,0,1.02),None),('Spine',(0,0,1.02),(0,0,1.40),'Hips'),('Neck',(0,0,1.40),(0,0,1.52),'Spine'),('Head',(0,0,1.52),(0,0,1.80),'Neck')]
for s,side in [(-1,'L'),(1,'R')]:bones += [('Thigh'+side,(s*.095,0,.91),(s*.095,0,.52),'Hips'),('Shin'+side,(s*.095,0,.52),(s*.095,0,.15),'Thigh'+side),('Foot'+side,(s*.095,0,.15),(s*.095,-.13,.06),'Shin'+side),('Arm'+side,(s*.21,0,1.40),(s*.27,0,1.10),'Spine'),('Forearm'+side,(s*.27,0,1.10),(s*.28,-.015,.86),'Arm'+side),('Hand'+side,(s*.28,-.015,.86),(s*.28,-.02,.74),'Forearm'+side)]
for name,h,t,parent in bones:
 b=arm.edit_bones.new(name);b.head=h;b.tail=t
 if parent:b.parent=arm.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
for o in parts:
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=False,rotation=True,scale=True);vg=o.vertex_groups.new(name=assign[o.name]);vg.add(list(range(len(o.data.vertices))),1,'REPLACE');
 if o.name.startswith('Continuous'):
  side=o.name[-1];secondary=('Shin' if 'trouser' in o.name else 'Forearm')+side;other=o.vertex_groups.new(name=secondary)
  for v in o.data.vertices:
   weight=max(0,min(1,((.58 if 'trouser' in o.name else 1.18)-v.co.z)/(.12 if 'trouser' in o.name else .16)));other.add([v.index],weight,'REPLACE');vg.add([v.index],1-weight,'REPLACE')
 mod=o.modifiers.new('Skeleton','ARMATURE');mod.object=rig;o.parent=rig;o.select_set(False)
body=merge(parts,'FullBody');body.parent=rig
rig.animation_data_create();bpy.context.scene.render.fps=30
for clip,duration in [('Idle',120),('Walk',30),('Wave',70),('LookAround',120)]:
 act=bpy.data.actions.new(clip);rig.animation_data.action=act
 for f in range(0,duration+1,5):
  t=f/duration*math.tau
  for pb in rig.pose.bones:pb.rotation_mode='XYZ';pb.rotation_euler=(0,0,0)
  if clip=='Walk':
   for side,sign in [('L',1),('R',-1)]:
    rig.pose.bones['Thigh'+side].rotation_euler.x=math.sin(t)*.36*sign;rig.pose.bones['Shin'+side].rotation_euler.x=-max(0,math.sin(t)*sign)*.45;rig.pose.bones['Arm'+side].rotation_euler.x=-math.sin(t)*.22*sign
  if clip=='Wave':
   rig.pose.bones['ArmR'].rotation_euler.z=-1.8;rig.pose.bones['ForearmR'].rotation_euler.x=-.55;rig.pose.bones['HandR'].rotation_euler.z=math.sin(t*3)*.3
  if clip=='LookAround':rig.pose.bones['Head'].rotation_euler.z=math.sin(t)*.48
  if clip=='Idle':rig.pose.bones['Spine'].rotation_euler.x=math.sin(t)*.012
  for pb in rig.pose.bones:pb.keyframe_insert(data_path='rotation_euler',frame=f,group=pb.name)
 track=rig.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1,act);rig.animation_data.action=None
for pb in rig.pose.bones:pb.rotation_euler=(0,0,0)
for im in bpy.data.images:
 if im.filepath:im.pack()
bpy.context.scene.frame_set(0);bpy.ops.wm.save_as_mainfile(filepath=str(D/'PhotoGuidedNPC.blend'),compress=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=str(A/'photo-guided-npc.glb'),export_format='GLB',export_yup=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_materials='EXPORT')
print('Production room and rigged photo-guided NPC exported')
