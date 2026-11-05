import {mat4,quat,vec3} from './vendor/js/render/math/gl-matrix.js';
import {clamp,floorStep} from './grounding.mjs';
import {wallScoreAt} from './wall-score.mjs';
export const WALL_BUILD='music-wall-008';
export const WALL_SECTIONS=20;
export function newWallControls(){return {pose:[0,0,0],yaw:0,diameter:6,height:2.4,enabled:true};}
export function wallMotion(wall,anchor,dx,dz,dyaw,vertical,dt){
 const [x,z]=floorStep(anchor,dx,dz);wall.pose[0]=clamp(wall.pose[0]+x,-20,20);wall.pose[2]=clamp(wall.pose[2]+z,-20,20);wall.yaw+=dyaw;
 wall.height=clamp(wall.height*Math.exp(-vertical*Math.min(.05,dt)*.6),.8,5);
}
export function wallActor(anchor,wall){const m=mat4.create();mat4.translate(m,m,wall.pose);mat4.rotateY(m,m,wall.yaw);return mat4.multiply(m,anchor,m);}
// A single diameter keeps the footprint circular at every size. Curved panel
// vertices are expressed relative to a unit radius and face into the enclosure.
export function wallLayout(wall){const radius=wall.diameter/2;return Array.from({length:WALL_SECTIONS},(_,id)=>{const angle=id/WALL_SECTIONS*Math.PI*2;return {id,angle,yaw:angle+Math.PI,position:[Math.sin(angle)*radius,0,Math.cos(angle)*radius],normal:[-Math.sin(angle),0,-Math.cos(angle)],radius};});}
export function wallFrame(wall,time,energy,score=null,beats=null){
 return wallLayout(wall).map(p=>{const m=mat4.create();mat4.translate(m,m,p.position);mat4.rotateY(m,m,p.yaw);const pulse=score?1:1+.025*Math.sin(time*.8+p.id)*energy,shape=wallScoreAt(score,beats,time,p.id);mat4.scale(m,m,[p.radius,wall.height*pulse*shape.height,p.radius]);return m;});
}

// One closed circuit around the circle; last section joins the first.
export const DRIVE_CIRCUIT=Object.freeze(Array.from({length:WALL_SECTIONS},(_,i)=>i));
function segmentMatrix(a,b,thickness){
 const d=vec3.subtract(vec3.create(),b,a),length=vec3.length(d),q=quat.create();
 quat.rotationTo(q,[0,1,0],vec3.normalize(d,d));
 return mat4.fromRotationTranslationScale(mat4.create(),q,a.map((v,i)=>(v+b[i])/2),[thickness,length,thickness]);
}
export function wallMechanisms(wall,time,energy=0,score=null,beats=null){
 const layout=wallLayout(wall),joints=DRIVE_CIRCUIT.map((id,i)=>{
  const p=layout[id],{normal,yaw}=p,tangent=[Math.cos(yaw),0,-Math.sin(yaw)],span=wall.diameter*Math.sin(Math.PI/WALL_SECTIONS);
  const shape=wallScoreAt(score,beats,time,id),height=wall.height*shape.height;
  const inset=Math.min(.13,wall.diameter*.045),radius=Math.min(span*.19,height*.14,.2,wall.diameter*.035),phase=time*1.65+i*Math.PI*.5+shape.kick;
  const centre=[p.position[0]+normal[0]*inset,height*.55,p.position[2]+normal[2]*inset];
  const pin=centre.map((v,j)=>v+tangent[j]*radius*.64*Math.cos(phase)+normal[j]*radius*.28+(j===1?radius*.64*Math.sin(phase):0));
  const shaft=[centre[0],height*.78,centre[2]];
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
