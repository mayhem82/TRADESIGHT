import * as T from '../bottle-bloom-001/vendor/three.module.js';

// Render just the virtual scene for the same XR view as the camera image.
// A separate context avoids changing the live XR framebuffer, camera or state.
// The caller composites this transparent layer over a *current* raw XR frame.
export class XRCaptureRenderer {
 constructor({scene,renderer}){
  if(!scene?.isScene||!renderer?.isWebGLRenderer)throw new Error('Capture requires the live scene and renderer.');
  this.scene=scene;this.live=renderer;this.camera=new T.PerspectiveCamera();
  this.camera.matrixAutoUpdate=false;this.camera.matrixWorldAutoUpdate=false;
  this.renderer=null;this.disposed=false;
 }
 render(view,width,height){
  if(this.disposed)throw new Error('Capture renderer was disposed.');
  if(!view?.transform?.matrix||view.transform.matrix.length!==16||!view.projectionMatrix||view.projectionMatrix.length!==16)throw new Error('The current AR view is unavailable.');
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>4096||height>4096)throw new Error('Invalid capture dimensions.');
  if(this.scene.background!==null)throw new Error('Capture requires the live AR scene.');
  if(!this.renderer){
   const canvas=document.createElement('canvas');
   this.renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
   this.renderer.setPixelRatio(1);this.renderer.setClearColor(0x000000,0);
  }
  const r=this.renderer,cam=this.camera;
  r.outputColorSpace=this.live.outputColorSpace;r.toneMapping=this.live.toneMapping;r.toneMappingExposure=this.live.toneMappingExposure;
  r.localClippingEnabled=this.live.localClippingEnabled;r.clippingPlanes=this.live.clippingPlanes;
  if(r.domElement.width!==width||r.domElement.height!==height)r.setSize(width,height,false);
  cam.matrix.fromArray(view.transform.matrix);cam.matrixWorld.copy(cam.matrix);
  cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
  cam.projectionMatrix.fromArray(view.projectionMatrix);cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  r.render(this.scene,cam);
  return r.domElement;
 }
 dispose(){if(this.disposed)return;this.disposed=true;if(this.renderer){this.renderer.dispose();this.renderer.forceContextLoss();this.renderer=null;}}
}
