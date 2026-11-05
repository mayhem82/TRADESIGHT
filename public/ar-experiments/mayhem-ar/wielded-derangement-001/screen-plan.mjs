import {mat4} from './vendor/js/render/math/gl-matrix.js';
import {stateAt,faceAt,smooth,DURATION} from './timeline.mjs';
export const SCREEN_WIDTH=1.5,SCREEN_HEIGHT=SCREEN_WIDTH*9/16,SCREEN_PERIOD=8,SCREEN_WINDOW=12,MAX_SCREENS=2;
export const SCREEN_LOOPS=Object.freeze(['Clockwork','Signal weave','Loading circuit']);
const order=[0,6,3,9,1,7,4,10,2,8,5,11];
export const loopPhaseAt=(seconds,slot=0)=>{const t=Number.isFinite(seconds)?seconds:0;return ((t/SCREEN_PERIOD+slot*.137)%1+1)%1;};
export function screenPlans(state){
 const time=state.t,cycle=Math.floor(time/SCREEN_WINDOW),local=time-cycle*SCREEN_WINDOW;
 const midpoint=stateAt(Math.min(DURATION,cycle*SCREEN_WINDOW+SCREEN_WINDOW/2));
 const sequence=order.map((_,i)=>order[(i+cycle*5)%order.length]);
 const candidates=sequence.filter(id=>faceAt(id,midpoint).alpha<.01);
 const selected=[];
 if(candidates.length){selected.push(candidates[0]);const a=faceAt(candidates[0],midpoint).yaw;const next=candidates.slice(1).find(id=>Math.acos(Math.cos(faceAt(id,midpoint).yaw-a))>1.4);if(next!==undefined)selected.push(next);}
 const life=smooth(local)*smooth(SCREEN_WINDOW-local)*smooth((DURATION-time)/1.3);
 return selected.map((slot,index)=>{
  const face=faceAt(slot,state),free=smooth((.01-face.alpha)/.01),r=Math.hypot(face.x,face.z),distance=r+.62;
  const position=[Math.sin(face.yaw)*distance,Math.max(face.y+.08,SCREEN_HEIGHT/2+.1),Math.cos(face.yaw)*distance];
  const matrix=mat4.create();mat4.translate(matrix,matrix,position);mat4.rotateY(matrix,matrix,face.yaw);mat4.scale(matrix,matrix,[SCREEN_WIDTH,SCREEN_WIDTH,SCREEN_WIDTH]);
  return {slot,kind:(cycle+index)%SCREEN_LOOPS.length,phase:loopPhaseAt(time,slot),opacity:life*free*.92,matrix};
 });
}
