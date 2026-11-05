import {mat4,vec3,quat} from './vendor/js/render/math/gl-matrix.js';
import {cellAt,faceAt} from './timeline.mjs';

export const GROUND_BUILD='ground-002';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function floorHit(matrix,viewerY){
 if(!matrix||matrix.length!==16||!Array.from(matrix).every(Number.isFinite))return false;
 const n=Math.hypot(matrix[4],matrix[5],matrix[6]);
 // Upward near-horizontal hit below the viewer. A hit test cannot classify a
 // floor semantically; the viewer must aim at the actual ground, not furniture.
 return n>.99&&n<1.01&&matrix[5]/n>=Math.cos(Math.PI/9)&&Number.isFinite(viewerY)&&matrix[13]<viewerY-.2;
}
export function freshFloorHit(matrix,viewerY,hitTime,now){return Number.isFinite(hitTime)&&now-hitTime>=0&&now-hitTime<=200&&floorHit(matrix,viewerY);}
export function manualGroundAt(x,y,width,height,distance=2.4){
 const d=clamp(distance,.6,7),tan=Math.tan(Math.PI/6),aspect=width/height;
 return [(2*clamp(x,0,width)/width-1)*d*tan*aspect,(1-2*clamp(y,0,height)/height)*d*tan,-d];
}
export function floorStep(anchor,dx,dz){return [anchor[0]*dx+anchor[2]*dz,anchor[8]*dx+anchor[10]*dz];}
function corners(bounds){const out=[];for(const x of [bounds.min[0],bounds.max[0]])for(const y of [bounds.min[1],bounds.max[1]])for(const z of [bounds.min[2],bounds.max[2]])out.push([x,y,z]);return out;}
export function transformPoint(matrix,p){return [matrix[0]*p[0]+matrix[4]*p[1]+matrix[8]*p[2]+matrix[12],matrix[1]*p[0]+matrix[5]*p[1]+matrix[9]*p[2]+matrix[13],matrix[2]*p[0]+matrix[6]*p[1]+matrix[10]*p[2]+matrix[14]];}
export function minimumY(bounds,matrix){return Math.min(...corners(bounds).map(p=>transformPoint(matrix,p)[1]));}
export function boundsFromGltf(data){
 const result=new Map();
 function nodeMatrix(n){if(n.matrix)return new Float32Array(n.matrix);return mat4.fromRotationTranslationScale(mat4.create(),n.rotation||[0,0,0,1],n.translation||[0,0,0],n.scale||[1,1,1]);}
 function include(index,parent,bounds){
  const n=data.nodes[index],m=mat4.multiply(mat4.create(),parent,nodeMatrix(n));
  if(n.mesh!==undefined)for(const primitive of data.meshes[n.mesh].primitives){
   const a=data.accessors[primitive.attributes.POSITION];if(!a.min||!a.max)throw Error('Machine position bounds missing');
   for(const p of corners({min:a.min,max:a.max})){const v=transformPoint(m,p);for(let j=0;j<3;j++){bounds.min[j]=Math.min(bounds.min[j],v[j]);bounds.max[j]=Math.max(bounds.max[j],v[j]);}}
  }
  for(const child of n.children||[])include(child,m,bounds);
 }
 for(let i=0;i<data.nodes.length;i++)if(data.nodes[i].name){const b={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};include(i,mat4.create(),b);result.set(data.nodes[i].name,b);}
 if(!result.has('base')||!Number.isFinite(result.get('base').min[1]))throw Error('Machine base geometry missing');return result;
}
function partMatrix(position,scale=[1,1,1],yaw=0,pitch=0){const m=mat4.create();mat4.translate(m,m,position);mat4.rotateY(m,m,yaw);mat4.rotateX(m,m,pitch);mat4.scale(m,m,scale);return m;}
export function groundedFrame(state,bounds){
 const frame=new Map(),bottom=bounds.get('base').min[1];
 const put=(name,m,opacity=1)=>{const low=minimumY(bounds.get(name),m);if(low<bottom)m[13]+=bottom-low+.00001;frame.set(name,{matrix:m,opacity});};
 for(let i=0;i<48;i++){const p=cellAt(i,state);put('cell-'+i,partMatrix([p.x,p.y,p.z],[p.scale,p.scale*(1+state.angular*.3),p.scale],p.yaw,Math.sin(state.t*.1+i)*.1));}
 const origin=[0,.6+state.height*.3,0];put('core',partMatrix(origin,[state.pulse,state.pulse*(.9+state.angular),state.pulse],state.twist*.25));
 for(let i=0;i<24;i++){
  const p=cellAt(i*2,state),target=[p.x,p.y,p.z],d=vec3.subtract(vec3.create(),target,origin),length=vec3.length(d),q=quat.create();quat.rotationTo(q,[0,1,0],vec3.normalize(d,d));
  put('strut-'+i,mat4.fromRotationTranslationScale(mat4.create(),q,origin.map((v,j)=>(v+target[j])/2),[1,length,1]));
 }
 for(let i=0;i<12;i++){const p=faceAt(i,state);put('face-'+i,partMatrix([p.x,p.y,p.z],[p.scale,p.scale,p.scale],p.yaw),p.alpha);}
 return frame;
}
export function groundedActor(anchor,pose,yaw,size,heightScale,baseBottom){
 const local=mat4.create();mat4.translate(local,local,[pose[0],0,pose[2]]);mat4.rotateY(local,local,yaw);mat4.scale(local,local,[size,size*heightScale,size]);
 // The bottom of the physical base is the invariant placement pivot. Growth,
 // morphing, exposure, uniform size and vertical height do not translate it.
 mat4.translate(local,local,[0,-baseBottom,0]);return mat4.multiply(mat4.create(),anchor,local);
}
