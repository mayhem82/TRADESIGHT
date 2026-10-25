import * as THREE from './vendor/three.module.js';

// Lighthouse uses direct lighting without environment or shadow render passes.
// Keep every model material/map intact and restore walkthrough renderer settings.
export function createARRenderProfile(renderer,scene,root){
 let saved=null;
 return {
  enter(){
   if(saved)return;
   saved={environment:scene.environment,shadows:renderer.shadowMap.enabled,toneMapping:renderer.toneMapping,alpha:renderer.getClearAlpha()};
   scene.environment=null;renderer.shadowMap.enabled=false;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearAlpha(0);
  },
  exit(){
   if(!saved)return;
   scene.environment=saved.environment;renderer.shadowMap.enabled=saved.shadows;renderer.toneMapping=saved.toneMapping;renderer.setClearAlpha(saved.alpha);saved=null;
  },
  get active(){return saved!==null;}
 };
}
