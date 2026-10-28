import * as THREE from './vendor/three.module.js';

// Match the direct-lit MeshStandardMaterial path used by the Flying Saucer AR
// page. Retain the real skinned meshes, colour textures and measured placement.
// The walkthrough's environment, shadow pass and detailed maps are restored.
export function createARRenderProfile(renderer,scene,root){
 let saved=null;
 return {
  enter(){
   if(saved)return;
   saved={environment:scene.environment,shadows:renderer.shadowMap.enabled,toneMapping:renderer.toneMapping,alpha:renderer.getClearAlpha(),materials:new Map()};
   root.traverse(object=>{
    if(!object.isMesh)return;
    for(let material of [].concat(object.material)){
     // Save the original even when its comparison clone is currently selected.
     // Original mode therefore uses the baseline AR profile in either toggle order.
     if(material.userData.textureExperiment)material=material.userData.textureExperimentOriginal;
     if(!material.isMeshStandardMaterial||saved.materials.has(material))continue;
     saved.materials.set(material,{normalMap:material.normalMap,roughnessMap:material.roughnessMap,metalnessMap:material.metalnessMap,envMap:material.envMap});
     material.normalMap=null;material.roughnessMap=null;material.metalnessMap=null;material.envMap=null;material.needsUpdate=true;
    }
   });
   scene.environment=null;renderer.shadowMap.enabled=false;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearAlpha(0);
  },
  exit(){
   if(!saved)return;
   for(const [material,properties] of saved.materials){Object.assign(material,properties);material.needsUpdate=true;}
   scene.environment=saved.environment;renderer.shadowMap.enabled=saved.shadows;renderer.toneMapping=saved.toneMapping;renderer.setClearAlpha(saved.alpha);saved=null;
  },
  get active(){return saved!==null;}
 };
}
