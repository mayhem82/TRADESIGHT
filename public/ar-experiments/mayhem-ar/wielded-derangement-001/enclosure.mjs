import {mat4} from './vendor/js/render/math/gl-matrix.js';
import {clamp,floorStep} from './grounding.mjs';
export const WALL_BUILD='outside-004';
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
