// Reused surface placement from MAYHEM tv-tabletop-002. +Z faces the viewer.
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
