// Synthetic session/poses only; real Chromium WebGL renders the frames.
export const installXREmulator=()=>{
  const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  class Session extends EventTarget{
   constructor(){super();this.enabledFeatures=['local','hit-test','dom-overlay'];this.domOverlayState={type:'screen'};this.visibilityState='visible';this.environmentBlendMode='alpha-blend';this.renderState={};this.inputSources=[];}
   updateRenderState(s){Object.assign(this.renderState,s);}
   async requestReferenceSpace(){return new EventTarget();}
   async requestHitTestSource(){return {cancel(){}};}
   requestAnimationFrame(fn){this.next=fn;return 1;}
   async end(){this.dispatchEvent(new Event('end'));}
  }
  Object.defineProperty(navigator,'xr',{value:{isSessionSupported:async()=>true,requestSession:async()=>window.testSession=new Session()}});
  window.XRWebGLLayer=class{constructor(s,gl){this.framebuffer=null;this.framebufferWidth=gl.drawingBufferWidth;this.framebufferHeight=gl.drawingBufferHeight;}getViewport(){return {x:0,y:0,width:720,height:360};}};
  let time=0;
  window.driveFrame=()=>{const s=window.testSession,world=identity(),inverse=identity();world[13]=1.6;world[14]=3;inverse[13]=-1.6;inverse[14]=-3;
   const projection=identity();projection[0]=1;projection[5]=2;projection[10]=-1.002;projection[11]=-1;projection[14]=-.2;projection[15]=0;
   const view={eye:'none',projectionMatrix:projection,transform:{matrix:world,position:{x:0,y:1.6,z:3},orientation:{x:0,y:0,z:0,w:1},inverse:{matrix:inverse}}};
   const frame={session:s,getViewerPose:()=>({views:[view],transform:{matrix:world,position:{x:0,y:1.6,z:3}}}),getHitTestResults:()=>[{getPose:()=>({transform:{matrix:identity()}})}]};
   s.next(time+=16,frame);
  };
 };
