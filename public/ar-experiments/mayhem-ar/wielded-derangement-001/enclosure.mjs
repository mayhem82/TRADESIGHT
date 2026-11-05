import {mat4,quat,vec3} from './vendor/js/render/math/gl-matrix.js';
import {clamp,floorStep} from './grounding.mjs';
export const WALL_BUILD='continuous-drive-006';
export function newWallControls(){return {pose:[0,0,0],yaw:0,width:6,depth:6,height:2.4,enabled:true};}
export function wallMotion(wall,anchor,dx,dz,dyaw,vertical,dt){
 const [x,z]=floorStep(anchor,dx,dz);wall.pose[0]=clamp(wall.pose[0]+x,-20,20);wall.pose[2]=clamp(wall.pose[2]+z,-20,20);wall.yaw+=dyaw;
 wall.height=clamp(wall.height*Math.exp(-vertical*Math.min(.05,dt)*.6),.8,5);
}
export function wallActor(anchor,wall){const m=mat4.create();mat4.translate(m,m,wall.pose);mat4.rotateY(m,m,wall.yaw);return mat4.multiply(m,anchor,m);}
// Footprint is a user-set boundary, not a measurement of the physical room.
// Individual modules retain their mechanical proportions as the boundary expands.
export function wallFrame(wall,time,energy){
 const result=[];for(let side=0;side<4;side++)for(let bay=0;bay<5;bay++){
  const u=(bay-2)/5,front=side===0||side===2,span=front?wall.width:wall.depth;
  const x=front?u*wall.width:(side===1?wall.width/2:-wall.width/2),z=front?(side===0?-wall.depth/2:wall.depth/2):u*wall.depth;
  const m=mat4.create();mat4.translate(m,m,[x,0,z]);mat4.rotateY(m,m,front?0:Math.PI/2);
  // Subtle internal breathing grows from the ground; never changes the footprint.
  const pulse=1+.025*Math.sin(time*.8+bay+side)*energy;mat4.scale(m,m,[span/5,wall.height*pulse,1]);result.push(m);
 }return result;
}

// Clockwise physical circuit, including all four corner transfers. Original
// panel IDs and independently adjustable footprint remain unchanged.
export const DRIVE_CIRCUIT=Object.freeze([0,1,2,3,4,5,6,7,8,9,14,13,12,11,10,19,18,17,16,15]);
function segmentMatrix(a,b,thickness){
 const d=vec3.subtract(vec3.create(),b,a),length=vec3.length(d),q=quat.create();
 quat.rotationTo(q,[0,1,0],vec3.normalize(d,d));
 return mat4.fromRotationTranslationScale(mat4.create(),q,a.map((v,i)=>(v+b[i])/2),[thickness,length,thickness]);
}
export function wallMechanisms(wall,time,energy=0){
 const panels=wallFrame(wall,time,energy),joints=DRIVE_CIRCUIT.map((id,i)=>{
  const side=Math.floor(id/5),normal=[[0,0,1],[-1,0,0],[0,0,-1],[1,0,0]][side],yaw=[0,-Math.PI/2,Math.PI,Math.PI/2][side];
  const tangent=[Math.cos(yaw),0,-Math.sin(yaw)],span=side%2?wall.depth:wall.width;
  const minimumSpan=Math.min(wall.width,wall.depth),inset=Math.min(.13,minimumSpan*.045);
  // The two corner drives must retain clearance even at a 2 m footprint.
  const radius=Math.min(span/5*.19,wall.height*.14,.2,minimumSpan*.035),phase=time*1.65+i*Math.PI*.5;
  const centre=[panels[id][12]+normal[0]*inset,wall.height*.55,panels[id][14]+normal[2]*inset];
  const pin=centre.map((v,j)=>v+tangent[j]*radius*.64*Math.cos(phase)+normal[j]*radius*.28+(j===1?radius*.64*Math.sin(phase):0));
  const shaft=[centre[0],wall.height*.78,centre[2]];
  return {id,centre,pin,shaft,yaw,phase,radius};
 });
 const frame=new Map(),connections=[];
 for(let i=0;i<joints.length;i++){
  const a=joints[i],b=joints[(i+1)%joints.length],gear=mat4.create();
  mat4.translate(gear,gear,a.centre);mat4.rotateY(gear,gear,a.yaw);mat4.rotateZ(gear,gear,a.phase);mat4.scale(gear,gear,[a.radius,a.radius,a.radius]);
  frame.set('wall-gear-'+i,gear);
  frame.set('wall-pin-'+i,mat4.fromTranslation(mat4.create(),a.pin));
  frame.set('wall-rod-'+i,segmentMatrix(a.pin,b.pin,.035));
  frame.set('wall-shaft-'+i,segmentMatrix(a.shaft,b.shaft,.045));
  connections.push({from:a.id,to:b.id,a:[...a.pin],b:[...b.pin],shaftA:[...a.shaft],shaftB:[...b.shaft]});
 }
 return {frame,connections};
}
