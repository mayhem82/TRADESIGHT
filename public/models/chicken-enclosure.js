import * as THREE from 'three';
export const metadata={id:'chicken-enclosure-v1',name:'Chicken Enclosure',description:'Parametric pitched galvanised-tube enclosure and coop. All dimensions provisional.',version:1,units:'metres',parameters:{length:12,width:9,wallHeight:2.4,coopWidth:2.1,coopDepth:1.7,coopHeight:2,roofRise:.85},features:['3D','AR','Parametric','GLB export']};
export function createModel(params={}){
 const p={...metadata.parameters,...params},group=new THREE.Group();group.name=metadata.name;
 const steel=new THREE.MeshStandardMaterial({color:0x9aabb7,metalness:.75,roughness:.32,side:THREE.DoubleSide});
 const mesh=new THREE.MeshStandardMaterial({color:0x8caaa7,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false});
 const brick=new THREE.MeshStandardMaterial({color:0xa35e43,roughness:.92});
 const roof=new THREE.MeshStandardMaterial({color:0x5c7181,metalness:.65,roughness:.4,side:THREE.DoubleSide});
 const ground=new THREE.MeshStandardMaterial({color:0x536b46,roughness:1});
 const join=new THREE.MeshStandardMaterial({color:0xe59c31,metalness:.4});
 function box(parent,x,y,z,w,h,d,material){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);parent.add(o);return o}
 function tube(parent,a,b,r=.038,material=steel){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),diff=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,diff.length(),10),material);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());parent.add(o);return o}
 function marker(x,y,z){const o=new THREE.Mesh(new THREE.SphereGeometry(.105,12,8),join);o.position.set(x,y,z);group.add(o)}
 const L=p.length,W=p.width,H=p.wallHeight,R=p.roofRise,x0=-L/2,x1=L/2,z0=-W/2,z1=W/2;
 box(group,0,-.075,0,L+3,.15,W+3,ground);
 const run=new THREE.Group();run.name='Galvanised tube frame';group.add(run);
 for(let i=0;i<3;i++){const x=x0+i*L/2;for(const z of [z0,z1])tube(run,[x,0,z],[x,H,z]);tube(run,[x,H,z0],[x,H+R,0]);tube(run,[x,H+R,0],[x,H,z1]);marker(x,H,z0);marker(x,H+R,0);marker(x,H,z1)}
 for(const z of [z0,z1]){tube(run,[x0,H,z],[x1,H,z]);box(run,0,H/2,z,L,H,.018,mesh)}
 tube(run,[x0,H+R,0],[x1,H+R,0]);
 for(const z of [z0,z1]){const panel=box(run,0,H+R/2,z/2,L,.014,W/2,mesh);panel.rotation.x=z<0?-Math.atan2(R,W/2):Math.atan2(R,W/2)}
 for(const x of [x0,x1])box(run,x,H/2,0,.018,H,W,mesh);
 const coop=new THREE.Group();coop.name='Brick coop';coop.position.set(x1+1.65,0,z1-1.1);group.add(coop);
 box(coop,0,p.coopHeight/2,0,p.coopWidth,p.coopHeight,p.coopDepth,brick);
 box(coop,0,p.coopHeight+.08,0,p.coopWidth+.28,.16,p.coopDepth+.28,roof);
 const door=box(coop,0,.8,p.coopDepth/2+.025,.78,1.55,.05,steel);door.name='Coop door';
 group.userData={modelId:metadata.id,parameters:p};return group;
}
