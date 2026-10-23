import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from asset_common import *
stone=material('Weathered limestone',(.6,.55,.45),'limestone');mortar=material('Recessed lime mortar',(.25,.235,.205),rough=1)
woods=[material('Quarter sawn oak '+str(i),(.45,.29,.13),'oak') for i in range(3)]
# Six original mineral colour variants, sharing normal and roughness maps.
stones=[stone]
for k,tint in enumerate([(1.13,1.05,.89),(.79,.82,.84),(1.04,.93,.77),(.89,.87,.81),(1.18,1.13,1.01)]):
 m=stone.copy();m.name='Mineral limestone '+str(k)
 tex=next(n for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image.name.startswith('limestone-albedo'))
 im=tex.image.copy();im.name='Mineral albedo '+str(k);pixels=list(im.pixels)
 for j in range(0,len(pixels),4):
  for c in range(3):pixels[j+c]=min(1,pixels[j+c]*tint[c])
 im.pixels=pixels;im.filepath_raw=str(T/('limestone-variant-'+str(k)+'.jpg'));im.file_format='JPEG';im.save();im.pack();tex.image=im;stones.append(m)
room=[];ceil=[]
room.append(cube('Floor structural base',(0,0,-.08),(8,6,.12),mortar))
for row in range(40):
 x=-3.9+row*.2;p=-3-(row%4)*.43
 while p<3:
  end=min(3,p+random.uniform(1.05,1.9));start=max(-3,p)
  if end-start>.03:
   o=cube('Oak floorboard %02d %.2f'%(row,p),(x,(start+end)/2,-.008),(.196,end-start-.004,.035),random.choice(woods),.0015)
   # Planar metres; random phase preserves timber grain along each board.
   uv=o.data.uv_layers.active
   for poly in o.data.polygons:
    for li in poly.loop_indices:
     v=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(v.x*3+row*.17,v.y*.55+p*.13)
   room.append(o)
  p=end
holes=[('N',-3,8,[(-2.9,-.7),(.7,2.9)]),('S',3,8,[(-1.2,1.2)]),('W',-4,6,[(-1.5,.5)]),('E',4,6,[])]
for side,fixed,length,opens in holes:
 alongx=side in 'NS';edges=sorted(set([-length/2,length/2]+[v for h in opens for v in h]))
 for a,b in zip(edges[:-1],edges[1:]):
  isopen=any(l<(a+b)/2<r for l,r in opens)
  for low,high in ([(0,.7),(2.5,3)] if isopen else [(0,3)]):
   loc=((a+b)/2,fixed,(low+high)/2) if alongx else (fixed,(a+b)/2,(low+high)/2)
   dims=(b-a,.19,high-low) if alongx else (.19,b-a,high-low)
   room.append(cube(side+' mortar backing',loc,dims,mortar,0))
   y=low;course=0
   while y<high-.02:
    h=min(random.uniform(.21,.34),high-y);x=a
    while x<b-.025:
     w=min(random.uniform(.30,.66),b-x);dep=random.uniform(.16,.25);cx=x+w/2;cz=y+h/2
     # Angular fieldstone polygons, varying shoulders and chipped edges; no brick primitive.
     ring=[(-.48,-.28),(-.34,-.48),(.19,-.48),(.48,-.26),(.48,.24),(.25,.48),(-.24,.48),(-.48,.25)]
     vs=[]
     for layer in [-1,1]:
      for u,v in ring:
       u=u*w+random.uniform(-.025,.025)*w;v=v*h+random.uniform(-.06,.06)*h
       offset=dep*.5*layer
       vs.append((cx+u,fixed+offset,cz+v) if alongx else (fixed+offset,cx+u,cz+v))
     fs=[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)]
     # Uneven mineral faces with central relief; avoid uniformly flat front polygons.
     for layer in range(2):
      centre=len(vs);off=dep*.5*(-1 if layer==0 else 1)+random.uniform(-.015,.015)
      vs.append((cx,fixed+off,cz) if alongx else (fixed+off,cx,cz))
      for i in range(8):
       f=(centre,layer*8+i,layer*8+(i+1)%8);fs.append(f[::-1] if layer==0 else f)
     o=mesh(side+' fieldstone %03d %.2f'%(course,x),vs,fs,random.choice(stones));finish(o,.009)
     # Position-derived UVs on all faces; fixes previous missing-UV stone textures.
     for poly in o.data.polygons:
      for li in poly.loop_indices:
       co=o.data.vertices[o.data.loops[li].vertex_index].co;o.data.uv_layers.active.data[li].uv=((co.x if alongx else co.y)*1.7,co.z*1.7)
     room.append(o);x+=w
    y+=h;course+=1
 for a,b in opens:
  for tag,u,z,w,h,d in [('Left jamb',a-.035,1.6,.07,1.8,.32),('Right jamb',b+.035,1.6,.07,1.8,.32),('Lintel',(a+b)/2,2.565,b-a+.18,.13,.36),('Sill',(a+b)/2,.665,b-a+.20,.07,.48),('Mullion',(a+b)/2,1.6,.045,1.8,.12)]:
   loc=(u,fixed,z) if alongx else (fixed,u,z);dims=(w,d,h) if alongx else (d,w,h);room.append(cube(side+' '+tag,loc,dims,woods[0]))
for i in range(32):ceil.append(cube('Ceiling board '+str(i),(-3.875+i*.25,0,3.065),(.246,6,.06),woods[1],.002))
for y in [-2.85,0,2.85]:ceil.append(cube('Exposed oak beam',(0,y,2.94),(8,.22,.25),woods[0],.012))
# Keep individual stones and architectural names in the editable source.
for im in bpy.data.images:
 if im.filepath:im.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(D/'StoneRoom.blend'),compress=True)
# Merge by material into ~7 production draw calls; ceiling remains independently hideable.
def merge(objects,name):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name=name;return o
base=merge(room,'Architecture');roof=merge(ceil,'Ceiling');base.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(A/'stone-room.glb'),export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT')
