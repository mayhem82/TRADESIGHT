import {mat4} from './vendor/js/render/math/gl-matrix.js';
import {wallLayout,wallActor,WALL_SECTIONS} from './enclosure.mjs';
import {wallScoreAt,bandAt,motionBeatAt} from './wall-score.mjs';
import {smooth,DURATION} from './timeline.mjs';
export const WALL_TILE_BUILD='walking-wall-tiles-012';
export const WALL_TILE_COUNT=WALL_SECTIONS*4;
export function tileGate(time,section,kind){
 const delay=section*.32+kind*.23,t=time-delay;
 if(t<0||time>DURATION)return 0;
 const phase=t%9.6;
 return smooth(phase/.45)*smooth((7.6-phase)/.65)*smooth((DURATION-time)/1.1);
}
export function wallTilePlans(wall,time,score,beats){
 return wallLayout(wall).map(p=>{
  const shape=wallScoreAt(score,beats,time,p.id),height=wall.height*shape.height,span=wall.diameter*Math.sin(Math.PI/WALL_SECTIONS),width=Math.min(span*.86,height*.46),panelHeight=width,inset=Math.min(.12,wall.diameter*.035);
  const matrix=mat4.create();mat4.translate(matrix,matrix,[p.position[0]+p.normal[0]*inset,height*.55,p.position[2]+p.normal[2]*inset]);mat4.rotateY(matrix,matrix,p.yaw);mat4.scale(matrix,matrix,[width,panelHeight,1]);
  return {section:p.id,matrix,gates:Array.from({length:4},(_,kind)=>tileGate(time,p.id,kind)),shift:p.id%4,phase:((time/8)%1+1)%1};
 });
}
// Pre-integrate measured bass and smoothed beats once. Seeking never accumulates
// frame error; the resulting angle is relative to the user's retained wall yaw.
export function buildWallWalk(score,beats){
 const dt=.02,phase=[0],count=Math.ceil(DURATION/dt);
 const speed=t=>(.012+.014*bandAt(score,'low',t)+.018*motionBeatAt(beats,t))*smooth(t/.6)*smooth((DURATION-t)/1.1);
 let previous=speed(0);
 for(let i=1;i<=count;i++){const now=Math.min(DURATION,i*dt),before=Math.min(DURATION,(i-1)*dt),next=speed(now);phase.push(phase.at(-1)+(previous+next)*.5*(now-before));previous=next;}
 return {secondsPerSample:dt,duration:DURATION,phase};
}
export function wallWalkAt(track,time){
 if(!track||!Number.isFinite(time)||time<=0)return 0;
 const p=Math.min(time,track.duration)/track.secondsPerSample,i=Math.floor(p),u=p-i,a=track.phase[i]??track.phase.at(-1),b=track.phase[i+1]??a;
 return a+(b-a)*u;
}
export function walkingWallActor(anchor,wall,time,track,enabled=true,offset=0,frozen=0){const root=wallActor(anchor,wall);mat4.rotateY(root,root,enabled?wallWalkAt(track,time)+offset:frozen);return root;}
