// User-pasted Samsung specifications, converted from millimetres to metres.
export const SPEC=Object.freeze({width:1.2246,height:.760,depth:.199,bodyHeight:.7078,bodyDepth:.0766,standWidth:.8126,standDepth:.199,weight:10.3,bodyWeight:10});
export const PARTS=Object.freeze([
 {name:'body',size:[SPEC.width,SPEC.bodyHeight,SPEC.bodyDepth],center:[0,SPEC.height-SPEC.bodyHeight/2,0],color:[.065,.073,.085]},
 ...[-1,1].flatMap(sign=>[
  {name:'foot',size:[.030,.012,SPEC.standDepth],center:[sign*(SPEC.standWidth/2-.015),.006,0],color:[.10,.11,.12]},
  {name:'neck',size:[.024,.052,.030],center:[sign*(SPEC.standWidth/2-.015),.038,0],color:[.10,.11,.12]}
 ])
]);
export function bounds(parts=PARTS){return [0,1,2].map(axis=>({min:Math.min(...parts.map(p=>p.center[axis]-p.size[axis]/2)),max:Math.max(...parts.map(p=>p.center[axis]+p.size[axis]/2))}));}
// The root is the bottom of the feet. +Z is the screen front. Never add a floor offset.
export class TablePlacement {
 constructor(){this.reset();}
 reset(){this.point=null;this.matrix=null;this.yaw=0;this.pending=false;this.repositioning=false;}
 request(){if(!this.point||this.repositioning)this.pending=true;}
 cancelPending(){this.pending=false;}
 reposition(){if(this.point){this.repositioning=true;this.pending=false;}}
 cancel(){this.repositioning=false;this.pending=false;}
 resolve(hit,viewer){const requested=this.pending;this.pending=false;if(!requested||!hit||!viewer||hit.length!==16||!Array.from(hit).every(Number.isFinite)||![viewer.x,viewer.y,viewer.z].every(Number.isFinite)||hit[5]<.94)return false;
  this.point=[hit[12],hit[13],hit[14]];this.yaw=Math.atan2(viewer.x-this.point[0],viewer.z-this.point[2]);this.repositioning=false;this.update();return true;}
 rotate(radians){if(this.point){this.yaw+=radians;this.update();}}
 move(dx,dz){if(this.point){this.point[0]+=dx;this.point[2]+=dz;this.update();}}
 update(){const c=Math.cos(this.yaw),s=Math.sin(this.yaw);this.matrix=new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,...this.point,1]);}
}
