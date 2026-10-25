// An injected stale binding reproduces missing pixels; this does not establish
// that the same state mismatch occurred on the user's phone.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage();
  await page.route('https://stone.test/**',route=>{
   const name=new URL(route.request().url()).pathname.slice(1);
   if(name==='fixture')return route.fulfill({body:'<!doctype html><title>Framebuffer regression</title>',contentType:'text/html'});
   if(!['public/stone-room/vendor/three.module.js','public/stone-room/xr-presentation.js'].includes(name))return route.fulfill({status:404,body:'not found'});
   return route.fulfill({body:fs.readFileSync(path.resolve(name)),contentType:'text/javascript'});
  });
  await page.goto('https://stone.test/fixture');
  const result=await page.evaluate(async()=>{
   const THREE=await import('/public/stone-room/vendor/three.module.js');
   const {renderScene}=await import('/public/stone-room/xr-presentation.js');
   const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,premultipliedAlpha:false});renderer.setSize(64,64);renderer.setClearColor(0,0);
   const target=new THREE.WebGLRenderTarget(64,64,{colorSpace:renderer.outputColorSpace});target.isXRRenderTarget=true;
   const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1,.01,10);camera.position.set(0,1,1);camera.lookAt(0,0,0);
   scene.add(new THREE.Mesh(new THREE.RingGeometry(.10,.16,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x00ff44,side:THREE.DoubleSide,depthTest:false,depthWrite:false})));
   const gl=renderer.getContext(),pixels=new Uint8Array(64*64*4);
   const count=()=>{renderer.resetState();renderer.setRenderTarget(target);renderer.readRenderTargetPixels(target,0,0,64,64,pixels);let green=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+1]>80&&pixels[i+1]>pixels[i]*2)green++;return green;};
   const corrupt=()=>{renderer.setRenderTarget(target);renderer.clear();gl.bindFramebuffer(gl.FRAMEBUFFER,null);};
   corrupt();renderer.render(scene,camera);const before=count();
   corrupt();const facade={xr:{isPresenting:true},getRenderTarget:()=>renderer.getRenderTarget(),resetState:()=>renderer.resetState(),setRenderTarget:t=>renderer.setRenderTarget(t),render:(s,c)=>renderer.render(s,c)};
   renderScene(facade,scene,camera);const after=count();const errors=[];for(let i=0;i<8;i++){const error=gl.getError();if(!error)break;errors.push(error);}
   target.dispose();renderer.dispose();
   // Exercise the actual r164 WebXRManager lifecycle with synthetic device poses
   // and a real GL framebuffer. Only XRSession/XRWebGLLayer are test shims.
   const xrRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true,premultipliedAlpha:false});xrRenderer.setSize(64,64);xrRenderer.xr.enabled=true;xrRenderer.xr.setReferenceSpaceType('local');
   const context=xrRenderer.getContext();context.makeXRCompatible=async()=>{};
   const layers=[];
   globalThis.XRWebGLLayer=class {
    constructor(session,g){
     this.framebufferWidth=64;this.framebufferHeight=64;this.framebuffer=g.createFramebuffer();this.texture=g.createTexture();this.depth=g.createRenderbuffer();
     g.bindTexture(g.TEXTURE_2D,this.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,64,64,0,g.RGBA,g.UNSIGNED_BYTE,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);
     g.bindFramebuffer(g.FRAMEBUFFER,this.framebuffer);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,this.texture,0);
     g.bindRenderbuffer(g.RENDERBUFFER,this.depth);g.renderbufferStorage(g.RENDERBUFFER,g.DEPTH_COMPONENT16,64,64);g.framebufferRenderbuffer(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.RENDERBUFFER,this.depth);g.bindFramebuffer(g.FRAMEBUFFER,null);layers.push(this);
    }
    getViewport(){return {x:0,y:0,width:64,height:64};}
   };
   class Session extends EventTarget {
    renderState={};inputSources=[];enabledFeatures=[];environmentBlendMode='alpha-blend';
    requestReferenceSpace(){return Promise.resolve({});}
    updateRenderState(state){Object.assign(this.renderState,state);}
    requestAnimationFrame(callback){this.callback=callback;return 1;}
    cancelAnimationFrame(){}
    end(){this.dispatchEvent(new Event('end'));return Promise.resolve();}
   }
   globalThis.XRWebGLBinding=class {
    constructor(session,g){this.gl=g;}
    createProjectionLayer(){
     const g=this.gl,layer={textureWidth:64,textureHeight:64,ignoreDepthValues:true,texture:g.createTexture()};
     g.bindTexture(g.TEXTURE_2D,layer.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA8,64,64,0,g.RGBA,g.UNSIGNED_BYTE,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);layers.push(layer);return layer;
    }
    getViewSubImage(layer){return {colorTexture:layer.texture,viewport:{x:0,y:0,width:64,height:64}};}
   };
   const lifecycle=[];
   for(let pass=0;pass<4;pass++){
    const session=new Session();if(pass>=2)session.renderState.layers=[];await xrRenderer.xr.setSession(session);let rendered=false;
    xrRenderer.setAnimationLoop((time,frame)=>{if(frame)rendered=renderScene(xrRenderer,scene,camera,frame);});
    session.callback(-1,{getViewerPose:()=>null});if(rendered)throw Error('Rendered before initial tracking');
    camera.updateMatrixWorld();const matrix=camera.matrixWorld.toArray(),projectionMatrix=camera.projectionMatrix.toArray();
    session.callback(0,{getViewerPose:()=>({views:[{transform:{matrix},projectionMatrix}]})});
    const layer=xrRenderer.xr.getBaseLayer(),renderTarget=xrRenderer.getRenderTarget();const actual=context.getParameter(context.FRAMEBUFFER_BINDING);const rgba=new Uint8Array(64*64*4);xrRenderer.readRenderTargetPixels(renderTarget,0,0,64,64,rgba);
    let green=0;for(let i=0;i<rgba.length;i+=4)if(rgba[i+1]>80&&rgba[i+1]>rgba[i]*2)green++;
    const boundToXR=pass<2?actual===layer.framebuffer:context.getFramebufferAttachmentParameter(context.FRAMEBUFFER,context.COLOR_ATTACHMENT0,context.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME)===layer.texture;
    lifecycle.push({pass,type:pass<2?'webgl':'projection',samples:renderTarget.samples,rendered,xrTarget:renderTarget.isXRRenderTarget===true,views:xrRenderer.xr.getCamera().cameras.length,boundToXR,green});
    await session.end();lifecycle[pass].restored=!xrRenderer.xr.isPresenting&&xrRenderer.getRenderTarget()===null;
   }
   xrRenderer.setAnimationLoop(null);for(const l of layers){context.deleteTexture(l.texture);if(l.depth)context.deleteRenderbuffer(l.depth);if(l.framebuffer)context.deleteFramebuffer(l.framebuffer);}xrRenderer.dispose();
   return {before,after,errors,lifecycle,scope:'Real WebGL and real Three XRManager; synthetic sessions, poses and XR layers; no XR compositor or phone verification'};
  });
  assert.equal(result.before,0);assert(result.after>10);assert.deepEqual(result.errors,[]);for(const step of result.lifecycle){assert(step.rendered&&step.xrTarget&&step.boundToXR&&step.restored);assert.equal(step.views,1);assert(step.green>10);}console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
