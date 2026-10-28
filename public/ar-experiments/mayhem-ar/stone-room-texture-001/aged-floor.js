import * as THREE from './vendor/three.module.js';

// Opaque, continuous treatment at the highest original board elevation.
// The original timber geometry and all navigation/collision rules remain intact.
export function createAgedFloor(root,maps){
 root.updateWorldMatrix(true,true);
 const bounds=new THREE.Box3();let source;
 root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||!/Quarter sawn oak/.test(o.material.name))return;const b=new THREE.Box3().setFromObject(o);if(b.max.y<.03&&b.min.y>-.04){bounds.union(b);source??=o.material;}});
 if(bounds.isEmpty()||!source)throw Error('Original floor-only timber boundary could not be identified');
 const size=bounds.getSize(new THREE.Vector3()),height=bounds.max.y,swaps=[];
 // Hide the old board faces and their shadow silhouettes in the new treatment.
 // Shared position/normal/UV attributes stay intact; only an alternate index is used.
 root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||!/Quarter sawn oak/.test(o.material.name)||!o.geometry.index)return;const original=o.geometry,p=original.attributes.position,index=original.index.array,keep=[],v=new THREE.Vector3();let removed=0;for(let i=0;i<index.length;i+=3){let floor=true;for(let k=0;k<3;k++){v.fromBufferAttribute(p,index[i+k]).applyMatrix4(o.matrixWorld);if(v.y>.03||v.y<-.04||v.x<bounds.min.x-1e-5||v.x>bounds.max.x+1e-5||v.z<bounds.min.z-1e-5||v.z>bounds.max.z+1e-5)floor=false;}if(floor)removed++;else keep.push(index[i],index[i+1],index[i+2]);}if(!removed)return;const filtered=new THREE.BufferGeometry();for(const [name,attribute] of Object.entries(original.attributes))filtered.setAttribute(name,attribute);filtered.setIndex(keep);filtered.boundingBox=original.boundingBox?.clone()??null;filtered.boundingSphere=original.boundingSphere?.clone()??null;swaps.push({mesh:o,original,filtered,removed,empty:keep.length===0,originalVisible:o.visible});});
 const material=source.clone();material.name='Aged irregular floorboards';material.color.set('#ffffff');material.map=maps[0];material.normalMap=maps[1];material.roughnessMap=maps[2];material.normalScale.set(.65,.65);material.roughness=1;material.metalness=0;material.envMap=null;
 material.userData.textureExperiment=true;material.userData.textureExperimentOriginal=source;
 // Resolve the rare coplanar bevel peak without changing the floor elevation.
 material.polygonOffset=true;material.polygonOffsetFactor=-1;material.polygonOffsetUnits=-1;
 maps.forEach(t=>{t.flipY=true;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.repeat.set(1,1);t.anisotropy=4;});maps[0].colorSpace=THREE.SRGBColorSpace;
 const geometry=new THREE.PlaneGeometry(size.x,size.z);geometry.rotateX(-Math.PI/2);
 const mesh=new THREE.Mesh(geometry,material);mesh.name='AgedFloorTreatment';mesh.receiveShadow=true;mesh.castShadow=false;mesh.position.copy(root.worldToLocal(new THREE.Vector3((bounds.min.x+bounds.max.x)/2,height,(bounds.min.z+bounds.max.z)/2)));root.add(mesh);
 let enabled=true,hidden=false,disposed=false;
 function sync(){mesh.visible=enabled&&!hidden;for(const s of swaps){s.mesh.geometry=enabled?s.filtered:s.original;if(s.empty)s.mesh.visible=!enabled&&!hidden&&s.originalVisible;}}
 sync();
 return {setEnabled(v){enabled=v;sync();},setHidden(v){hidden=v;sync();},dispose(){if(disposed)return;disposed=true;for(const s of swaps){s.mesh.geometry=s.original;s.mesh.visible=s.originalVisible;s.filtered.dispose();}root.remove(mesh);geometry.dispose();material.dispose();},get diagnostics(){return {enabled,hidden,height,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},size:[size.x,size.z],continuous:true,opaque:!material.transparent,polygonOffset:material.polygonOffset,originalBoardTrianglesSuppressed:swaps.reduce((n,s)=>n+s.removed,0),originalGeometryRestored:!enabled||disposed,repeat:maps[0].repeat.toArray(),images:maps.map(t=>[t.image.width,t.image.height]),disposed};}};
}
