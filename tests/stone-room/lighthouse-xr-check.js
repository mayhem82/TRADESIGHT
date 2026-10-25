async () => {
 // Real r164 renderer/controller/production GLB with explicit synthetic native
 // session/layer fixtures. This checks application pixels, not a phone compositor.
 const THREE=await import('./vendor/three.module.js'),{GLTFLoader}=await import('./vendor/GLTFLoader.js'),{setupAR}=await import('./xr.js'),{createARRenderProfile}=await import('./ar-render-profile.js');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(128,192);renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');
 const gl=renderer.getContext();gl.makeXRCompatible=async()=>{};const resources=[];
 const previousLayer=globalThis.XRWebGLLayer,previousBinding=globalThis.XRWebGLBinding;
 globalThis.XRWebGLLayer=class {
  constructor(session,g){this.framebufferWidth=128;this.framebufferHeight=192;this.framebuffer=g.createFramebuffer();this.texture=g.createTexture();this.depth=g.createRenderbuffer();g.bindTexture(g.TEXTURE_2D,this.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,128,192,0,g.RGBA,g.UNSIGNED_BYTE,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.bindFramebuffer(g.FRAMEBUFFER,this.framebuffer);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,this.texture,0);g.bindRenderbuffer(g.RENDERBUFFER,this.depth);g.renderbufferStorage(g.RENDERBUFFER,g.DEPTH_COMPONENT16,128,192);g.framebufferRenderbuffer(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.RENDERBUFFER,this.depth);g.bindFramebuffer(g.FRAMEBUFFER,null);resources.push(this)}
  getViewport(){return {x:0,y:0,width:128,height:192}}
 };
 globalThis.XRWebGLBinding=class {
  constructor(session,g){this.gl=g}
  createProjectionLayer(){const g=this.gl,l={textureWidth:128,textureHeight:192,ignoreDepthValues:true,texture:g.createTexture()};g.bindTexture(g.TEXTURE_2D,l.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA8,128,192,0,g.RGBA,g.UNSIGNED_BYTE,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);resources.push(l);return l}
  getViewSubImage(l){return {colorTexture:l.texture,viewport:{x:0,y:0,width:128,height:192}}}
 };
 class Session extends EventTarget {
  renderState={};inputSources=[];enabledFeatures=[];environmentBlendMode='alpha-blend';scheduled=0;
  requestReferenceSpace(){return Promise.resolve({})}updateRenderState(s){Object.assign(this.renderState,s)}
  requestAnimationFrame(callback){this.callback=callback;return ++this.scheduled}cancelAnimationFrame(){}
  end(){this.dispatchEvent(new Event('end'));return Promise.resolve()}
 }
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,128/192,.035,120),room=new THREE.Group(),exterior=new THREE.Group();scene.add(room,exterior,new THREE.HemisphereLight(0xdfefff,0xa79b87,1.25));const sun=new THREE.DirectionalLight(0xffefd7,2.6);sun.position.set(-3,6,-8);scene.add(sun);
 const gltf=await new GLTFLoader().loadAsync('./assets/photo-guided-npc.glb');room.add(gltf.scene);gltf.scene.traverse(o=>{if(o.isMesh)o.frustumCulled=false});const mixer=new THREE.AnimationMixer(gltf.scene),profile=createARRenderProfile(renderer,scene,room),errors=[];
 const api=setupAR({renderer,scene,camera,room,exterior,snapshot:()=>({}),restore(){},message(){},error:e=>errors.push(e),clearInput(){},ready:()=>true,setContent:m=>m==='virtual'?profile.exit():profile.enter(),createButton:()=>document.querySelector('#ar')});
 const set=(name,value)=>{const input=document.querySelector('#ar-'+name);input.value=String(value);input.oninput()};
 const pixels=new Uint8Array(128*192*4),read=()=>{renderer.readRenderTargetPixels(renderer.getRenderTarget(),0,0,128,192,pixels);let opaque=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)opaque++;return opaque};
 const result=[];
 try {
  for(let pass=0;pass<4;pass++){
   document.querySelector('#ar-content').value='companion';for(const [name,value]of Object.entries({distance:3,height:-1.4,horizontal:0,scale:1,rotation:0}))document.querySelector('#ar-'+name).value=String(value);
   const session=new Session();if(pass>=2)session.renderState.layers=[];await renderer.xr.setSession(session);
   const immediate=api.active&&room.visible&&room.position.z===-3;let draws=0;
   renderer.setAnimationLoop((time,frame)=>{api.update(frame);mixer.update(.04);renderer.render(scene,camera);draws++});
   const matrix=new THREE.Matrix4().toArray(),projection=new THREE.PerspectiveCamera(60,128/192,.035,120).projectionMatrix.toArray();
   const frame={getViewerPose:()=>({transform:{matrix},views:[{transform:{matrix},projectionMatrix:projection}]})};
   const clips=[];for(const clip of gltf.animations){mixer.stopAllAction();mixer.clipAction(clip).reset().play();session.callback(16,frame);clips.push({name:clip.name,pixels:read()})}
   set('distance',4);set('height',-.8);set('horizontal',.3);set('scale',.6);set('rotation',30);const positioned=room.position.toArray(),scale=room.scale.x,yaw=room.rotation.y;session.callback(32,frame);const manualPixels=read();
   document.querySelector('#ar-follow').onclick();session.callback(48,frame);const follows=!!api.motion?.follow;document.querySelector('#ar-stop').onclick();const stopped=api.motion===null;
   session.callback(64,{getViewerPose:()=>null});const retained=room.visible;const notices=document.body.style.display;
   await session.end();const restored=!api.active&&room.position.length()===0&&room.scale.x===1&&document.body.style.display===notices&&!renderer.xr.isPresenting;
   result.push({pass,layer:pass<2?'webgl':'projection',immediate,clips,manualPixels,positioned,scale,yaw,follows,stopped,retained,restored,draws,scheduled:session.scheduled});
  }
  for(let i=0;i<8;i++){const e=gl.getError();if(!e)break;errors.push(e)}
 }finally{
  renderer.setAnimationLoop(null);for(const r of resources){gl.deleteTexture(r.texture);if(r.depth)gl.deleteRenderbuffer(r.depth);if(r.framebuffer)gl.deleteFramebuffer(r.framebuffer)}renderer.dispose();globalThis.XRWebGLLayer=previousLayer;globalThis.XRWebGLBinding=previousBinding;
 }
 return {result,errors,scope:'Actual Three renderer, production model/animations and manual controller; synthetic sessions/layers; no physical AR verification'};
}
