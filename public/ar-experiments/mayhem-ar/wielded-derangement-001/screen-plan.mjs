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
const point=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
// Detect a screen between the viewer and a bright portrait. The current
// presentation uses local soft cutouts; it never camera-parents a panel.
export function screenFaceRisk(plan,portraits,viewerInModel){
 if(!viewerInModel?.every(Number.isFinite))return 0;
 const inverse=mat4.invert(mat4.create(),plan.matrix);if(!inverse)return 0;const camera=point(inverse,viewerInModel);let risk=0;
 for(const face of portraits){
  if(face.strength<=0)continue;const target=point(inverse,face.position),dz=target[2]-camera[2];if(Math.abs(dz)<1e-7)continue;
  const t=-camera[2]/dz;if(t<=0||t>=1)continue;
  const x=camera[0]+(target[0]-camera[0])*t,y=camera[1]+(target[1]-camera[1])*t,margin=face.radius/SCREEN_WIDTH;
  const overlap=Math.min(.5+margin-Math.abs(x),.28125+margin-Math.abs(y));
  risk=Math.max(risk,smooth(overlap/Math.max(.001,margin))*face.strength);
 }return risk;
}
export function viewSafeScreens(plans,state,viewerInModel){
 const portraits=Array.from({length:12},(_,i)=>faceAt(i,state)).filter(p=>p.alpha>.15&&(!viewerInModel||(viewerInModel[0]-p.x)*Math.sin(p.yaw)+(viewerInModel[2]-p.z)*Math.cos(p.yaw)>0)).map(p=>({position:[p.x+Math.sin(p.yaw)*p.scale*.1,p.y,p.z+Math.cos(p.yaw)*p.scale*.1],radius:p.scale*.23,strength:smooth((p.alpha-.15)/.5)}));
 return plans.map(plan=>{
  const holes=Array(48).fill(0),inverse=mat4.invert(mat4.create(),plan.matrix);let count=0;
  if(inverse&&viewerInModel?.every(Number.isFinite)){const camera=point(inverse,viewerInModel);
   for(const face of portraits){const target=point(inverse,face.position),dz=target[2]-camera[2];if(Math.abs(dz)<1e-7)continue;const t=-camera[2]/dz;if(t<=0||t>=1)continue;const x=camera[0]+(target[0]-camera[0])*t,y=camera[1]+(target[1]-camera[1])*t,r=face.radius/SCREEN_WIDTH*t;if(Math.abs(x)>.5+r*1.2||Math.abs(y)>.28125+r*2)continue;holes.splice(count*4,4,x+.5,y/.5625+.5,r,face.strength);count++;}
  }
  return {...plan,faceOcclusion:screenFaceRisk(plan,portraits,viewerInModel),holes};
 });
}
