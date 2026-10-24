// Pure placement and collision rules, shared by runtime and tests. Metres, Y up.
export const ROOM={width:8,depth:6,height:3,eye:1.65,radius:.25};
export function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
export function constrain(x,z,r=.25){return {x:clamp(x,-4+r,4-r),z:clamp(z,-3+r,3-r)}}
export function separate(x,z,other,r=.55){const dx=x-other.x,dz=z-other.z,d=Math.hypot(dx,dz);if(d>=r)return {x,z};const a=d>1e-6?dx/d:1,b=d>1e-6?dz/d:0;return {x:other.x+a*r,z:other.z+b*r}}
export function surfaceKind(normal){return normal.y>.75?'floor':Math.abs(normal.y)<.3?'wall':'slope'}
// A room always stays upright. For a wall hit its rear wall sits against the
// detected plane; its floor is derived from the current viewer's nominal eye height.
export function placement(normal,point,viewer){
 const kind=surfaceKind(normal);if(kind==='slope')return null;
 if(kind==='floor')return {kind,x:point.x,y:point.y,z:point.z,yaw:Math.atan2(viewer.x-point.x,viewer.z-point.z)};
 const n=Math.hypot(normal.x,normal.z);let nx=normal.x/n,nz=normal.z/n;
 if(nx*(viewer.x-point.x)+nz*(viewer.z-point.z)<0){nx=-nx;nz=-nz}
 return {kind,x:point.x+nx*3.15,y:viewer.y-ROOM.eye,z:point.z+nz*3.15,yaw:Math.atan2(nx,nz),estimatedFloor:true};
}

// AR movement is in the detected floor's local metres, without virtual-room walls.
export function advanceCompanion(from,target,speed,dt,stopDistance=.06){
 const dx=target.x-from.x,dz=target.z-from.z,d=Math.hypot(dx,dz),step=Math.min(Math.max(0,speed)*Math.max(0,dt),Math.max(0,d-stopDistance));
 return {x:from.x+(d?dx/d*step:0),z:from.z+(d?dz/d*step:0),walking:step>.00001,arrived:d<=stopDistance+.01,heading:Math.atan2(dx,dz)};
}
