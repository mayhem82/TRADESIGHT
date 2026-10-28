import * as THREE from './vendor/three.module.js';

// Same world-space reticle as public/sound-wall-cube-ar.html. Its matrix comes
// directly from XRHitTestResult.getPose(renderer.xr.getReferenceSpace()).
export function createSurfaceReticle(){
 const ring=new THREE.Mesh(new THREE.RingGeometry(.10,.16,48),new THREE.MeshBasicMaterial({color:0x00ff44,side:THREE.DoubleSide,depthTest:false,depthWrite:false,transparent:false}));
 ring.name='WebXR surface ring';ring.renderOrder=999;
 ring.geometry.rotateX(-Math.PI/2);ring.matrixAutoUpdate=false;ring.visible=false;
 return ring;
}
