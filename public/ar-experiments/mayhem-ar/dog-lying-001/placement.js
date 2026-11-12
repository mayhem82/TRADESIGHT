// Reused surface placement from MAYHEM tv-tabletop-002. +Z faces the viewer.
export class TablePlacement {
 constructor(){this.reset();}
 reset(){this.point=null;this.matrix=null;this.yaw=0;this.pending=false;this.repositioning=false;this.heightOffset=0;}
 request(){if(!this.point||this.repositioning)this.pending=true;}
 cancelPending(){this.pending=false;}
 reposition(){if(this.point){this.repositioning=true;this.pending=false;}}
 cancel(){this.repositioning=false;this.pending=false;}
 resolve(hit,viewer){const requested=this.pending;this.pending=false;if(!requested||!hit||!viewer||hit.length!==16||!Array.from(hit).every(Number.isFinite)||![viewer.x,viewer.y,viewer.z].every(Number.isFinite)||hit[5]/(Math.hypot(hit[4],hit[5],hit[6])||1)<Math.cos(Math.PI/4))return false;
  this.point=[hit[12],hit[13],hit[14]];this.yaw=Math.atan2(viewer.x-this.point[0],viewer.z-this.point[2]);this.repositioning=false;this.update();return true;}
 rotate(radians){if(this.point){this.yaw+=radians;this.update();}}
 move(dx,dz){if(this.point){this.point[0]+=dx;this.point[2]+=dz;this.update();}}
 setHeightOffset(m){if(!Number.isFinite(m))return;this.heightOffset=Math.max(-.5,Math.min(1.5,m));if(this.point)this.update();}
 update(){const c=Math.cos(this.yaw),s=Math.sin(this.yaw);this.matrix=new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,this.point[0],this.point[1]+this.heightOffset,this.point[2],1]);}
}

export function makeHandTarget(camera,distance=.35){
 if(!camera||camera.length!==16||!Array.from(camera).every(Number.isFinite))return null;
 const n=Math.hypot(camera[8],camera[9],camera[10]);if(n<.001)return null;
 distance=Math.max(.15,Math.min(1,Number.isFinite(Number(distance))?Number(distance):.35));
 const x=camera[12]-camera[8]/n*distance,y=camera[13]-camera[9]/n*distance,z=camera[14]-camera[10]/n*distance;
 const yaw=Math.atan2(camera[12]-x,camera[14]-z),c=Math.cos(yaw),s=Math.sin(yaw);
 return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,x,y,z,1]);
}
