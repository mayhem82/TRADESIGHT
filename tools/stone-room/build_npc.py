import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from asset_common import *
from anatomy import anatomical_data,subset
from bake_face import bake_face
from mathutils import Vector
anatomy_vertices,anatomy_faces,anatomy_joints=anatomical_data(D/"anatomy")
# Character is made separately; Blender source has full mesh, material maps and armature.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
skin=material('Skin pores',(.65,.42,.31),'skin');shirt=material('Navy cotton',(.035,.07,.13),'denim');jacket=material('Dark cotton jacket',(.05,.05,.06),'jacket');denim=material('Indigo denim',(.15,.20,.27),'denim');leather=material('Worn brown boot leather',(.16,.10,.06),rough=.72);hair=material('Brown hair',(.025,.016,.010),rough=.94);frame=material('Black sunglasses frame',(.012,.014,.018),rough=.3);lens=material('Smoked lenses',(.012,.018,.025),rough=.27);metal=material('Zipper and buttons',(.35,.37,.39),rough=.38)
thread=material('Muted garment stitching',(.12,.13,.14),rough=.95)
parts=[];assign={}
def bind(o,bone):parts.append(o);assign[o.name]=bone;return o
def ell(name,p,s,m,b='Spine'):return bind(ball(name,p,s,m),b)
def bx(name,p,s,m,b='Spine',bev=.004):return bind(cube(name,p,s,m,bev),b)
def tube(name,pts,r,mat,b='Head'):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.bevel_depth=r;cu.bevel_resolution=1;cu.resolution_u=5 if 'strand' in name else 8;sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for v,p in zip(sp.bezier_points,pts):v.co=p;v.handle_left_type=v.handle_right_type='VECTOR' if 'Embroidered' in name else 'AUTO'
 ob=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat);bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob=bpy.context.object;ob.select_set(False);return bind(ob,b)
# Torso uses cross-section tailoring; front open jacket exposes collared navy shirt.
def loft(name,sections,mat,b='Spine'):
 vs=[];n=40;dense=[]
 for start,end in zip(sections[:-1],sections[1:]):
  steps=max(2,int((end[0]-start[0])/.012))
  for j in range(steps):
   t=j/steps;dense.append(tuple(a+(b-a)*t for a,b in zip(start,end)))
 dense.append(sections[-1])
 for z,rx,ry,cy in dense:
  for i in range(n):
   a=(-math.pi/2+max(0,z-1.34)*3.4+i/(n-1)*(math.tau-2*max(0,z-1.34)*3.4)) if name=='Navy shirt' else i*math.tau/n
   # Cloth folds are geometry, strongest where fabric gathers at joints/cuffs.
   zone=.35+.65*math.exp(-((z-(.46 if 'trouser' in name else 1.10))/.11)**2)
   fold=.0025*zone*math.sin(z*75+3*math.sin(a*2))+.0015*math.sin(a*7+z*17)
   vs.append(((rx+fold)*math.cos(a),cy+(ry+fold)*math.sin(a),z))
 fs=[tuple(range(n-1,-1,-1))]
 for j in range(len(dense)-1):
  for i in range(n-1 if name=='Navy shirt' else n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 if name!='Navy shirt':fs.append(tuple(range((len(dense)-1)*n,len(dense)*n)))
 ob=mesh(name,vs,fs,mat);finish(ob)
 for poly in ob.data.polygons:poly.use_smooth=True
 return bind(ob,b)
def panel(name,vertices,mat,b='Spine'):
 ob=mesh(name,vertices,[tuple(range(len(vertices)))],mat);finish(ob)
 solid=ob.modifiers.new('Sewn fabric thickness','SOLIDIFY');solid.thickness=.003
 bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=solid.name)
 bevel=ob.modifiers.new('Soft cloth edges','BEVEL');bevel.width=.003;bevel.segments=3;bpy.ops.object.modifier_apply(modifier=bevel.name)
 return bind(ob,b)
loft('Navy shirt',[(.91,.155,.09,0),(1.02,.16,.098,0),(1.15,.175,.108,0),(1.29,.203,.105,0),(1.39,.20,.088,0),(1.45,.198,.085,0),(1.49,.065,.055,0)],shirt)
loft('Anatomical neck',[(1.36,.065,.063,.006),(1.44,.056,.06,.006),(1.50,.060,.068,.006),(1.55,.054,.063,.006),(1.59,.05,.055,.006)],skin,'Neck')
ell('Upper chest',(0,.005,1.365),(.12,.087,.115),skin,'Spine')
# Jacket panels are separately sculpted around the shirt, with lapels and seam details.
for s in [-1,1]:
 # Continuous tailored jacket shell below replaces separate side forms.
 panel('Folded jacket collar',[(s*.055,-.090,1.49),(s*.135,-.110,1.44),(s*.10,-.135,1.30),(s*.065,-.140,1.39)],jacket)
 panel('Shaped navy collar',[(s*.025,-.070,1.505),(s*.07,-.070,1.48),(s*.10,-.120,1.40),(s*.040,-.131,1.43)],shirt)
 tube('Jacket stitched seam',[(s*.18,-.067,.98),(s*.192,-.07,1.17),(s*.19,-.056,1.38)],.0007,thread,'Spine')
 panel('Jacket welt pocket',[(s*.10,-.111,1.17),(s*.17,-.089,1.20),(s*.17,-.09,1.19),(s*.10,-.112,1.16)],jacket)
 ell('Rounded boot outsole',(s*.095,-.028,.018),(.054,.122,.018),frame,'Foot'+('L' if s<0 else 'R'))
 ell('Boot leather',(s*.095,-.03,.057),(.052,.112,.043),leather,'Foot'+('L' if s<0 else 'R'))
 ell('Boot ankle',(s*.095,.015,.145),(.048,.05,.078),leather,'Foot'+('L' if s<0 else 'R'))
 for z in [.085,.105,.125]:tube('Boot lace',[(s*.095-.027,-.08,z),(s*.095+.027,-.08,z)],.0015,hair,'Foot'+('L' if s<0 else 'R'))
 side='L' if s<0 else 'R';x=s*.095
 o=loft('Continuous trouser '+side,[(.15,.052,.057,.012),(.25,.06,.065,.008),(.43,.065,.072,0),(.52,.073,.078,0),(.67,.082,.087,0),(.87,.086,.085,0),(.96,.075,.08,0)],denim,'Thigh'+side);o.location.x=x
 o=loft('Continuous sleeve '+side,[(.86,.043,.046,-.016),(.94,.049,.052,-.012),(1.08,.055,.06,-.005),(1.16,.058,.063,0),(1.29,.066,.07,0),(1.4,.076,.077,0),(1.44,.045,.05,0)],jacket,'Arm'+side)
 for v in o.data.vertices:v.co.x+=s*(.28-max(0,v.co.z-1.1)*.18)
 bx('Sleeve cuff',(s*.28,-.016,.87),(.087,.08,.04),jacket,'Forearm'+side)
 # Anatomical hands retain knuckles, nails, separated fingers and natural taper.
 source_side='l' if s>0 else 'r';wrist=anatomy_joints['joint-'+source_side+'-hand']
 tip=anatomy_joints['joint-'+source_side+'-finger-3-4'];axis=(tip-wrist).normalized()
 rotation=axis.rotation_difference(Vector((0,0,-1)));anchor=Vector((s*.28,-.015,.86))
 hv,hf=subset(anatomy_vertices,anatomy_faces,lambda v: s*v.x>.42 and (v-wrist).dot(axis)>-.018,lambda v:anchor+rotation@(v-wrist))
 ob=mesh('Anatomical hand '+side,hv,hf,skin);finish(ob)
 for poly in ob.data.polygons:poly.use_smooth=True
 bind(ob,'Hand'+side)
 bx('Belt',(0,-.094,.935),(.29,.018,.032),leather,'Hips') if s<0 else None
# Shaped pelvis joins trouser legs instead of leaving a split between two tubes.
loft('Jeans seat and fly',[(.83,.166,.085,.012),(.90,.18,.105,.006),(.96,.171,.10,0)],denim,'Hips')
for s in [-1,1]:
 tube('Jean side seam',[(s*.171,.015,.94),(s*.174,.012,.80),(s*.166,.01,.65)],.0009,thread,'Thigh'+('L' if s<0 else 'R'))
# Open jacket shell, softly gathered waist and hem with broad shoulder tailoring.
vs=[];fs=[];n=64;rows=45
for j in range(rows):
 z=.935+j/(rows-1)*.55;t=j/(rows-1)
 rx=.174+.04*math.sin(t*math.pi*.65)-.14*max(0,(t-.93)/.07)
 ry=.108+.008*math.sin(t*math.pi)-.05*max(0,(t-.93)/.07)
 gap=.26+.40*max(0,(t-.55)/.45)
 for i in range(n+1):
  a=-math.pi/2+gap+i/n*(math.tau-2*gap)
  fold=.0025*math.sin(z*65+math.cos(a*3)*2)+.0015*math.sin(a*9+z*12)
  vs.append(((rx+fold)*math.cos(a),(ry+fold)*math.sin(a),z))
for j in range(rows-1):
 for i in range(n):k=j*(n+1)+i;fs.append((k,k+1,k+n+2,k+n+1))
o=mesh('Tailored open jacket',vs,fs,jacket);finish(o)
solid=o.modifiers.new('Lined jacket thickness','SOLIDIFY');solid.thickness=.004;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=solid.name);bind(o,'Spine')
for poly in o.data.polygons:poly.use_smooth=True
for z in [1.03,1.13,1.23,1.33]:ell('Shirt button',(0,-.108,z),(.004,.003,.004),metal)
# Anatomical cranium with photo-projected front UV, shaped jaw, nose, cheek planes.
photo=material('Photo-derived face',(.7,.5,.4),rough=.8)
img=bpy.data.images.load(str(T/'face-neutral-generated.jpg'));tex=photo.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img;photo.node_tree.links.new(tex.outputs['Color'],photo.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
# Anatomical topology supplies jaw, lips, nasal cartilage, eyelids and ears.
# Shape fitting is an interpretation of the supplied front/profile photographs.
hv,hf=subset(anatomy_vertices,anatomy_faces,lambda v:v.z>1.515,lambda v:Vector((v.x*1.08*min(1,.48+max(0,v.z-1.515)/.045*.52),(v.y+.06)*(min(1,.5+max(0,v.z-1.515)/.045*.5) if v.y+.06>0 else 1),v.z-.014)))
head=mesh('Anatomical photo-guided head',hv,hf,skin);finish(head);head.data.materials.append(photo)
for poly in head.data.polygons:poly.use_smooth=True
bake_face(head,T)
bind(head,'Head')
for s in [-1,1]:
 # Wraparound lenses have curved full geometry, plus frame bridge and temples.
 # Curved rounded-rectangle lens surfaces, not protruding spherical eyeballs.
 for tag,width,height,depth,mat in [('Frame',.042,.027,-.115,frame),('Lens',.037,.022,-.118,lens)]:
  lv=[];lf=[];steps=32
  for i in range(steps):
   a=i/steps*math.tau;u=math.copysign(abs(math.cos(a))**.5,math.cos(a));v=math.copysign(abs(math.sin(a))**.65,math.sin(a))
   x=s*.044+u*width;lv.append((x,depth+abs(x)**2*3.2,1.666+v*height))
  lv.append((s*.044,depth+(s*.044)**2*3.2-.002,1.666))
  for i in range(steps):lf.append((steps,i,(i+1)%steps))
  ob=mesh('Wraparound '+tag,lv,lf,mat);finish(ob)
  for poly in ob.data.polygons:poly.use_smooth=True
  solid=ob.modifiers.new('Lens thickness','SOLIDIFY');solid.thickness=.002;bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=solid.name);bind(ob,'Head')
 tube('Sunglass temple',[(s*.082,-.071,1.68),(s*.101,-.018,1.683),(s*.098,.037,1.666)],.004,frame)
 for i in range(24):
  x=s*(.006+i*.003);z=1.61-.012*math.sin(i/24*math.pi)
  tube('Moustache strand',[(x,-.116+abs(x)*.36,z+.003),(x+s*.005,-.115+abs(x)*.4,z-.009)],.00035,hair)
 for i in range(14):
  delta=(i-7)*.00045
  tube('Handlebar tip strand',[(s*.044,-.105,1.604+delta),(s*.064,-.088,1.598+delta),(s*.078,-.070,1.611+delta)],.0004,hair)
 # Layered hair follows the back of the skull; fine strands break up its edge.
 ell('Back hair mass',(s*.047,.065,1.615),(.043,.036,.10),hair,'Head')
 for i in range(65):
  x=s*(.035+random.random()*.052);y=.045+random.random()*.045;z=1.72-random.random()*.035
  tube('Swept hair strand',[(x*.8,y-.025,z),(x,y,1.65),(x+s*.005,y+.018,1.57),(x+s*.011,y+.012,1.535+random.random()*.035)],random.uniform(.0005,.001),hair)
tube('Bridge',[(-.015,-.106,1.681),(0,-.112,1.687),(.015,-.106,1.681)],.005,frame)
# Six-panel baseball cap crown and curved bill, including raised dark embroidery.
vs=[];fs=[];n=48
for j in range(13):
 a=j/12*math.pi/2
 for i in range(n):
  t=i/n*math.tau;vs.append((math.cos(t)*math.cos(a)*.101,math.sin(t)*math.cos(a)*.10-.025,1.735+math.sin(a)*.103))
for j in range(12):
 for i in range(n):fs.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
o=mesh('Six panel cap crown',vs,fs,jacket);finish(o);bind(o,'Head')
for p in o.data.polygons:p.use_smooth=True
vs=[];fs=[]
for j in range(5):
 for i in range(25):
  t=-1+i/12;r=j/4;vs.append((t*(.094+r*.015),-.06-r*.125*(1-t*t*.28),1.738-r*.018-t*t*.012))
for j in range(4):
 for i in range(24):k=j*25+i;fs.append((k,k+1,k+26,k+25))
o=mesh('Curved baseball cap bill',vs,fs,jacket);finish(o);bind(o,'Head');sol=o.modifiers.new('Bill thickness','SOLIDIFY');sol.thickness=.004;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=sol.name)
def logo(points):
 return [(x,-.025-.10*math.sqrt(max(.01,1-((z-1.735)/.103)**2))-.002,z) for x,z in points]
for points in [[(-.023,1.77),(-.023,1.805)],[(-.003,1.77),(-.003,1.805)],[(-.023,1.787),(-.003,1.787)],[(-.009,1.803),(.025,1.803)],[(.012,1.803),(.012,1.771),(-.006,1.771)]]:
 tube('Embroidered monogram',logo(points),.0014,frame)
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
   rig.pose.bones['ArmR'].rotation_euler.z=-1.8;rig.pose.bones['ForearmR'].rotation_euler.x=-.55;rig.pose.bones['HandR'].rotation_euler.z=math.sin(t*3)*.22
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
