import * as THREE from './vendor/three.module.js';
// Keep the lowest sampled boot surface on the placed floor during skeletal motion.
// This corrects vertical gait drift; it is not terrain reconstruction or foot IK.
export function createFloorContact(model){
 model.updateWorldMatrix(true,false);model.updateMatrixWorld(true);const point=new THREE.Vector3(),bounds=new THREE.Box3().setFromObject(model),candidates=[];
 model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;for(let index=0;index<mesh.geometry.attributes.position.count;index++){mesh.getVertexPosition(index,point).applyMatrix4(mesh.matrixWorld);if(point.y<=bounds.min.y+.025)candidates.push({mesh,index})}});
 if(!candidates.length)return null;
 const samples=candidates.filter((_,i)=>i%Math.max(1,Math.ceil(candidates.length/96))===0),parentScale=new THREE.Vector3();
 function lowest(){model.updateWorldMatrix(true,false);model.updateMatrixWorld(true);let y=Infinity;for(const {mesh,index} of samples){mesh.getVertexPosition(index,point).applyMatrix4(mesh.matrixWorld);y=Math.min(y,point.y)}return y}
 return {samples:samples.length,clearance(floorY){return lowest()-floorY},settle(floorY){const delta=floorY-lowest();if(Number.isFinite(delta)&&Math.abs(delta)<.25){model.parent?.getWorldScale(parentScale);model.position.y+=delta/(model.parent?parentScale.y:1)}}};
}
