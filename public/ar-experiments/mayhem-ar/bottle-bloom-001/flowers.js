import * as T from 'three';
import {clamp,smooth,sampleGrowth} from './growth.js';
const UP=new T.Vector3(0,1,0), TAU=Math.PI*2;
const stemMaterial=new T.MeshStandardMaterial({color:0x40832d,roughness:.68});
const leafMaterial=new T.MeshStandardMaterial({color:0x3d7e31,roughness:.78,side:T.DoubleSide,vertexColors:true});
const veinMaterial=new T.MeshStandardMaterial({color:0x97be4d,roughness:.8});
const budMaterial=new T.MeshStandardMaterial({color:0x679b38,roughness:.68});
const palette=[0xfff2ba,0xf6a7c3,0xbca5f5,0xfbc75a,0xf7d8ee];
let botanicalMaps=null;
export async function loadBotanicalTextures(){
 const atlas=await new T.TextureLoader().loadAsync('assets/botanical-surfaces.png');
 const part=(half,colorSpace)=>{const texture=atlas.clone();texture.repeat.set(.5,1);texture.offset.set(half*.5,0);texture.colorSpace=colorSpace;texture.anisotropy=4;texture.needsUpdate=true;return texture;};
 botanicalMaps={petal:part(0,T.SRGBColorSpace),leaf:part(1,T.SRGBColorSpace),petalBump:part(0,T.NoColorSpace),leafBump:part(1,T.NoColorSpace)};
 leafMaterial.color.set(0xffffff);leafMaterial.map=botanicalMaps.leaf;leafMaterial.bumpMap=botanicalMaps.leafBump;leafMaterial.bumpScale=.00022;leafMaterial.roughness=.72;leafMaterial.needsUpdate=true;
 budMaterial.color.set(0xffffff);budMaterial.map=botanicalMaps.leaf;budMaterial.bumpMap=botanicalMaps.leafBump;budMaterial.bumpScale=.00012;budMaterial.needsUpdate=true;
 return botanicalMaps;
}

function blade(length,width,curve=.15,petal=false,phase=0){
 const verts=[],indices=[],uv=[],colors=[];const H=24,W=10;
 for(let i=0;i<=H;i++)for(let j=0;j<=W;j++){
  const t=i/H,s=j/W*2-1,w=Math.pow(Math.sin(Math.PI*t),petal?.48:.72)*width*(1+.022*Math.sin(t*19+phase));
  verts.push(s*w,t*length,(s*s*.10+curve*t*t+(petal?.13:.05)*Math.sin(Math.PI*t))*length+Math.sin(t*Math.PI)*.001);
  uv.push(j/W,t);
  const shade=.72+.28*(1-Math.abs(s))+.035*Math.sin(t*14);colors.push(shade,shade,shade);
 }
 for(let i=0;i<H;i++)for(let j=0;j<W;j++){const a=i*(W+1)+j;indices.push(a,a+1,a+W+1,a+1,a+W+2,a+W+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function addVein(group,length){
 const path=new T.QuadraticBezierCurve3(new T.Vector3(),new T.Vector3(0,length*.55,.002),new T.Vector3(0,length,.012));
 group.add(new T.Mesh(new T.TubeGeometry(path,10,.00030,3,false),veinMaterial));
}
export class GrowingPlant{
 constructor({height=.28,index=0,above=.35,startHeight=.012}={}){
  this.height=height;this.startHeight=clamp(startHeight,0,height-.03);this.index=index;this.root=new T.Group();this.root.name='Growing plant '+(index+1);
  this.visual=new T.Group();this.root.add(this.visual);this.leaves=[];this.petals=[];
  const seedY=-height+this.startHeight+.004;
  this.seed=new T.Mesh(new T.SphereGeometry(.0044,12,8),new T.MeshStandardMaterial({color:0x7a6339,roughness:1}));this.seed.position.set(seedY<-.055?.003:0,seedY-.002,0);this.seed.scale.set(1,.65,.55);this.visual.add(this.seed);
  const side=index%2?1:-1;
  // The entire shoot begins inside the bottle. The narrow neck stays clear of branches.
  const inside=seedY<-.055?[
   new T.Vector3(.003,seedY,0),new T.Vector3(-.008,seedY+(-.055-seedY)*.42,.003),
   new T.Vector3(.006,seedY+(-.055-seedY)*.73,-.003),new T.Vector3(0,-.055,0),new T.Vector3(0,-.022,0)
  ]:[new T.Vector3(0,seedY,0),new T.Vector3(0,seedY*.45,0)];
  this.path=new T.CatmullRomCurve3([
   ...inside,new T.Vector3(0,0,0),new T.Vector3(0,.028,0),
   new T.Vector3(side*.012,.12,.004),new T.Vector3(-side*.022,above*.67,-.006),
   new T.Vector3(side*.024,above,.012),
  ],false,'centripetal');
  this.segments=160;this.radial=7;
  this.stem=new T.Mesh(new T.TubeGeometry(this.path,this.segments,.00175,this.radial,false),stemMaterial);this.visual.add(this.stem);
  this.tip=new T.Mesh(new T.SphereGeometry(.0034,10,8),budMaterial);this.tip.scale.set(.7,1.7,.7);this.visual.add(this.tip);
  // Paired seed leaves unfold first; alternating true leaves follow above them.
  const levels=[];
  if(seedY<-.12){const span=-.085-seedY;levels.push({y:seedY+span*.32,size:.015,pair:true},{y:seedY+span*.73,size:.019,pair:true});}
  levels.push({y:.055,size:.044},{y:.115,size:.060},{y:.182,size:.068},{y:.25,size:.053});
  for(let n=0;n<levels.length;n++){
   const v=levels[n];let best=0,d=Infinity;
   for(let k=0;k<=500;k++){const t=k/500,dy=Math.abs(this.path.getPointAt(t).y-v.y);if(dy<d){d=dy;best=t;}}
   const count=v.pair?2:1;
   for(let j=0;j<count;j++){
    const holder=new T.Group(),hinge=new T.Group();holder.position.copy(this.path.getPointAt(best));holder.rotation.y=(n*2.399+index*.73)+(j?Math.PI:0);holder.add(hinge);
    const leaf=new T.Mesh(blade(v.size,v.size*.32,.12),leafMaterial);hinge.add(leaf);addVein(hinge,v.size);
    this.visual.add(holder);this.leaves.push({holder,hinge,t:best,n,inside:v.y<0,size:v.size});
   }
  }
  this.head=new T.Group();this.visual.add(this.head);
  this.bud=new T.Mesh(new T.SphereGeometry(1,20,16),budMaterial);this.bud.scale.set(.012,.025,.012);this.bud.position.y=.012;this.head.add(this.bud);
  this.flower=new T.Group();this.head.add(this.flower);
  const petalMat=new T.MeshPhysicalMaterial({color:botanicalMaps?0xffffff:palette[index%5],map:botanicalMaps?.petal||null,bumpMap:botanicalMaps?.petalBump||null,bumpScale:.00012,roughness:.58,transmission:.065,thickness:.00035,ior:1.35,side:T.DoubleSide,vertexColors:true});
  for(let ring=0;ring<2;ring++)for(let i=0;i<13;i++){
   const spin=new T.Group(),hinge=new T.Group();spin.rotation.y=(i/13+ring*.036)*TAU;
   const len=(ring? .043:.053)*(1+.05*Math.sin(i*2.7));
   hinge.position.set(0,.004,.006);hinge.rotation.z=.045*Math.sin(i*2.1);hinge.add(new T.Mesh(blade(len,len*.24,.09,true,i*1.7),petalMat));spin.add(hinge);this.flower.add(spin);this.petals.push({hinge,ring,i});
  }
  const centreMat=new T.MeshStandardMaterial({color:index===3?0x694320:0xe2a22d,roughness:.9});
  this.centre=new T.Mesh(new T.SphereGeometry(.013,24,12),centreMat);this.centre.scale.y=.34;this.centre.position.y=.006;this.flower.add(this.centre);
  const pollen=new T.InstancedMesh(new T.SphereGeometry(.00075,4,3),new T.MeshStandardMaterial({color:0xffd578,roughness:.8}),90),tmp=new T.Object3D();
  for(let i=0;i<90;i++){const r=.011*Math.sqrt(i/90),a=i*2.399;tmp.position.set(r*Math.cos(a),.010-.002*r/.011,r*Math.sin(a));tmp.updateMatrix();pollen.setMatrixAt(i,tmp.matrix);}this.flower.add(pollen);
  this.guide=new T.Mesh(new T.TorusGeometry(.016,.0009,6,48),new T.MeshBasicMaterial({color:0xf4d9a5,transparent:true,opacity:.9,depthTest:false}));this.guide.rotation.x=Math.PI/2;this.guide.renderOrder=99;this.root.add(this.guide);this.guide.visible=false;
  this.state=sampleGrowth(0);this.update(0,0);
 }
 update(progress,time){
  const s=sampleGrowth(progress);this.state=s;
  this.seed.visible=progress<.4;
  this.stem.geometry.setDrawRange(0,Math.floor(s.stem*this.segments)*this.radial*6);
  const top=this.path.getPointAt(s.stem);this.tip.position.copy(top);this.tip.visible=s.stem>.002&&s.bud<.9;
  for(const l of this.leaves){
   const unfold=smooth(l.t,l.t+.13,s.stem)*(.35+.65*s.leaf);
   l.holder.visible=unfold>.005;l.hinge.scale.set(Math.max(.015,unfold),Math.max(.015,unfold),Math.max(.015,unfold));
   // Tight folded leaf -> raised leaf -> open lamina, as observed in the seedling frames.
   l.hinge.rotation.x=-.08-unfold*(l.inside?.92:1.12);l.hinge.rotation.z=.25*(1-unfold);
  }
  this.head.position.copy(top);this.head.visible=s.bud>.002;
  this.head.scale.setScalar(Math.max(.001,s.bud));
  this.head.rotation.z=.14*Math.sin(this.index+1)*(1-s.bloom*.6);
  this.head.rotation.x=1.12*s.bloom;
  this.bud.visible=s.bloom<.72;this.bud.scale.set(.012*(1-s.bloom*.5),.025*(1-s.bloom*.4),.012*(1-s.bloom*.5));
  this.flower.visible=s.bud>.05;this.flower.scale.setScalar(.65+.35*s.bloom);
  for(const p of this.petals){const release=smooth(.02+p.i%4*.025,.92,s.bloom);p.hinge.rotation.x=-.05-release*(1.22+p.ring*.22);p.hinge.scale.x=.28+.72*release;}
  this.centre.visible=s.bloom>.12;
  // Only the shoot above the mouth sways; the rooted plant and mouth alignment remain fixed.
  this.visual.rotation.y=0;
 }
 dispose(){this.root.traverse(o=>{if(o.isMesh)o.geometry?.dispose();});}
}
