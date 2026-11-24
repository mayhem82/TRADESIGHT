import * as T from '../bottle-bloom-001/vendor/three.module.js';

// Match Stone Wall's centre doorway: two jambs and a lintel. Coordinates
// are in the XR reference space, independent of the writing's transform.
const lerp = (a,b,t) => ({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});
export function wallPanels({a,b,height,door}) {
 const length=Math.hypot(b.x-a.x,b.z-a.z);
 const panel=(p,q,bottomP=p.y,bottomQ=q.y)=>[
  {x:p.x,y:bottomP,z:p.z},{x:q.x,y:bottomQ,z:q.z},
  {x:q.x,y:q.y+height,z:q.z},{x:p.x,y:p.y+height,z:p.z}
 ];
 if(!door)return [panel(a,b)];
 const left=lerp(a,b,(length-door.width)/(2*length));
 const right=lerp(a,b,(length+door.width)/(2*length));
 const header=(a.y+b.y)/2+door.height;
 return [panel(a,left),panel(right,b),panel(left,right,header,header)];
}

export class InvisibleWalls {
 constructor(scene,{onChange=()=>{}}={}) {
  this.scene=scene;this.onChange=onChange;this.walls=[];this.nodes=[];
  this.building=false;this.first=null;this.guides=false;this.pending=null;
  this.depthMaterial=new T.MeshBasicMaterial({colorWrite:false,depthWrite:true,depthTest:true,side:T.DoubleSide});
  this.guideMaterial=new T.LineBasicMaterial({color:0x40ffa6,depthTest:false,depthWrite:false});
 }
 get count(){return this.walls.length;}
 get hasFirst(){return this.first!==null;}
 notify(message){this.onChange({message,building:this.building,hasFirst:this.hasFirst,count:this.count,guides:this.guides});}
 start(){this.building=true;this.first=null;this.clearPending();this.showGuides();this.notify('Tap the circle at the first wall corner.');}
 cancel(){this.building=false;this.first=null;this.clearPending();this.showGuides();this.notify('Wall editing stopped.');}
 select(point,{height=2.4,door=null}={}) {
  if(!this.building)return false;
  if(!point||![point.x,point.y,point.z].every(Number.isFinite)){this.notify('Aim at a ground surface first.');return false;}
  const p={x:point.x,y:point.y,z:point.z};
  if(!this.first){this.first=p;this.makePending(height);this.notify('First corner saved. Tap the circle at the other end of the wall.');return false;}
  const length=Math.hypot(p.x-this.first.x,p.z-this.first.z);
  if(!Number.isFinite(height)||height<=0){this.notify('Choose a valid wall height.');return false;}
  if(length<.25){this.notify('Choose wall endpoints at least 25 cm apart.');return false;}
  if(door){
   if(!Number.isFinite(door.width)||!Number.isFinite(door.height)||door.width<=0||door.height<=0||length<door.width+.24||door.height>=height-.05){this.notify('Allow space for both jambs and a lintel. Increase wall length or height.');return false;}
   const delta=Math.abs(p.y-this.first.y)*door.width/(2*length);
   if(door.height+delta>height-.05){this.notify('Increase wall height for this doorway on sloping ground.');return false;}
  }
  this.walls.push({a:this.first,b:p,height,door:door?{width:door.width,height:door.height}:null});
  this.first=null;this.building=false;this.clearPending();this.rebuild();
  this.notify(door?'Invisible wall with doorway added.':'Invisible wall added.');return true;
 }
 undo(){if(this.walls.length)this.walls.pop();this.rebuild();this.notify('Last wall removed.');}
 clear(){this.walls=[];this.building=false;this.first=null;this.clearPending();this.rebuild();this.notify('Walls cleared.');}
 setGuides(value){this.guides=!!value;this.showGuides();this.notify(this.guides?'Wall guides shown.':'Wall guides hidden.');}
 showGuides(){for(const node of this.nodes)if(node.userData.wallGuide)node.visible=this.guides||this.building;}
 clearPending(){if(!this.pending)return;this.scene.remove(this.pending);this.pending.geometry.dispose();this.pending=null;}
 makePending(height){this.clearPending();const p=this.first,h=Number.isFinite(height)?height:2.4;const geometry=new T.BufferGeometry().setFromPoints([new T.Vector3(p.x,p.y,p.z),new T.Vector3(p.x,p.y+h,p.z)]);this.pending=new T.LineSegments(geometry,this.guideMaterial);this.pending.renderOrder=20;this.scene.add(this.pending);}
 rebuild(){
  for(const node of this.nodes){this.scene.remove(node);node.geometry.dispose();}this.nodes=[];
  for(const wall of this.walls)for(const points of wallPanels(wall)){
   const flat=points.flatMap(p=>[p.x,p.y,p.z]);
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(flat,3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeBoundingSphere();
   const depth=new T.Mesh(geometry,this.depthMaterial);depth.renderOrder=-100;depth.frustumCulled=false;this.scene.add(depth);this.nodes.push(depth);
   const edge=new T.BufferGeometry();edge.setAttribute('position',new T.Float32BufferAttribute([ ...flat.slice(0,3),...flat.slice(3,6), ...flat.slice(3,6),...flat.slice(6,9), ...flat.slice(6,9),...flat.slice(9,12), ...flat.slice(9,12),...flat.slice(0,3)],3));
   const guide=new T.LineSegments(edge,this.guideMaterial);guide.userData.wallGuide=true;guide.renderOrder=20;this.scene.add(guide);this.nodes.push(guide);
  }this.showGuides();
 }
 end(){this.clear();}
 dispose(){this.clear();this.depthMaterial.dispose();this.guideMaterial.dispose();}
}
