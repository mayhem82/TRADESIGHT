// PNG capture and native file sharing follow the Colour Vision photo controls.
function saveGL(g) {
  const caps=[g.BLEND,g.CULL_FACE,g.DEPTH_TEST,g.STENCIL_TEST,g.SCISSOR_TEST];
  const enabled=caps.map(c=>g.isEnabled(c)),textures=[],active=g.getParameter(g.ACTIVE_TEXTURE);
  for(let i=0;i<g.getParameter(g.MAX_COMBINED_TEXTURE_IMAGE_UNITS);i++){g.activeTexture(g.TEXTURE0+i);textures.push([g.getParameter(g.TEXTURE_BINDING_2D),g.getParameter(g.TEXTURE_BINDING_CUBE_MAP)]);}
  g.activeTexture(active);
  const state={read:g.getParameter(g.READ_FRAMEBUFFER_BINDING),draw:g.getParameter(g.DRAW_FRAMEBUFFER_BINDING),renderbuffer:g.getParameter(g.RENDERBUFFER_BINDING),program:g.getParameter(g.CURRENT_PROGRAM),vao:g.getParameter(g.VERTEX_ARRAY_BINDING),array:g.getParameter(g.ARRAY_BUFFER_BINDING),pack:g.getParameter(g.PIXEL_PACK_BUFFER_BINDING),viewport:g.getParameter(g.VIEWPORT),scissor:g.getParameter(g.SCISSOR_BOX),color:g.getParameter(g.COLOR_WRITEMASK),clear:g.getParameter(g.COLOR_CLEAR_VALUE),depthMask:g.getParameter(g.DEPTH_WRITEMASK),depthFunc:g.getParameter(g.DEPTH_FUNC),depthClear:g.getParameter(g.DEPTH_CLEAR_VALUE),depthRange:g.getParameter(g.DEPTH_RANGE),blend:[g.getParameter(g.BLEND_SRC_RGB),g.getParameter(g.BLEND_DST_RGB),g.getParameter(g.BLEND_SRC_ALPHA),g.getParameter(g.BLEND_DST_ALPHA)],equation:[g.getParameter(g.BLEND_EQUATION_RGB),g.getParameter(g.BLEND_EQUATION_ALPHA)],blendColor:g.getParameter(g.BLEND_COLOR),cull:g.getParameter(g.CULL_FACE_MODE),front:g.getParameter(g.FRONT_FACE),stencil:[g.getParameter(g.STENCIL_WRITEMASK),g.getParameter(g.STENCIL_BACK_WRITEMASK)]};
  return ()=>{
    g.bindFramebuffer(g.READ_FRAMEBUFFER,state.read);g.bindFramebuffer(g.DRAW_FRAMEBUFFER,state.draw);g.bindRenderbuffer(g.RENDERBUFFER,state.renderbuffer);
    g.useProgram(state.program);g.bindVertexArray(state.vao);g.bindBuffer(g.ARRAY_BUFFER,state.array);g.bindBuffer(g.PIXEL_PACK_BUFFER,state.pack);
    textures.forEach((t,i)=>{g.activeTexture(g.TEXTURE0+i);g.bindTexture(g.TEXTURE_2D,t[0]);g.bindTexture(g.TEXTURE_CUBE_MAP,t[1]);});g.activeTexture(active);
    caps.forEach((c,i)=>enabled[i]?g.enable(c):g.disable(c));g.viewport(...state.viewport);g.scissor(...state.scissor);g.colorMask(...state.color);g.clearColor(...state.clear);g.depthMask(state.depthMask);g.depthFunc(state.depthFunc);g.clearDepth(state.depthClear);g.depthRange(...state.depthRange);g.blendFuncSeparate(...state.blend);g.blendEquationSeparate(...state.equation);g.blendColor(...state.blendColor);g.cullFace(state.cull);g.frontFace(state.front);g.stencilMaskSeparate(g.FRONT,state.stencil[0]);g.stencilMaskSeparate(g.BACK,state.stencil[1]);
  };
}
function pixelCanvas(g,w,h) {
  const pixels=new Uint8Array(w*h*4);g.bindBuffer(g.PIXEL_PACK_BUFFER,null);g.readPixels(0,0,w,h,g.RGBA,g.UNSIGNED_BYTE,pixels);
  if(g.getError()!==g.NO_ERROR)throw Error('Photo pixels could not be read');
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const context=canvas.getContext('2d'),data=context.createImageData(w,h);
  for(let y=0;y<h;y++)data.data.set(pixels.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4);
  context.putImageData(data,0,0);return canvas;
}
export class DogPhotos {
  constructor(gl) {
    this.gl=gl;this.ready=false;this.ar=false;this.available=false;this.pending=false;this.busy=false;this.last=null;this.token=0;this.binding=null;this.gpu=null;this.disposed=false;
    this.button=document.querySelector('#take-photo');this.lastButton=document.querySelector('#last-photo');this.review=document.querySelector('#photo-review');this.image=document.querySelector('#photo-image');this.save=document.querySelector('#save-photo');this.shareButton=document.querySelector('#share-photo');this.closeButton=document.querySelector('#close-photo');this.note=document.querySelector('#photo-status');
    this.button.onclick=()=>{if(this.button.disabled)return;this.pending=true;this.busy=true;this.note.textContent='Taking photo…';this.sync();};
    this.lastButton.onclick=()=>this.open();this.closeButton.onclick=()=>this.close();this.shareButton.onclick=()=>this.share();
    this.save.addEventListener('click',e=>e.stopPropagation());
    this.review.addEventListener('click',e=>{if(e.target===this.review)this.close();});
    this.review.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();this.close();}});
    this.sync();
  }
  shareSupported() {
    if(!this.last||typeof navigator.share!=='function'||typeof navigator.canShare!=='function')return false;
    try{return navigator.canShare({files:[new File([this.last.blob],this.last.filename,{type:'image/png'})]});}catch{return false;}
  }
  sync() {
    this.button.disabled=!this.ready||this.busy||(this.ar&&!this.available);this.lastButton.hidden=!this.last;
    this.shareButton.hidden=!this.shareSupported();this.shareButton.disabled=!this.last;
  }
  setReady(ready) {this.ready=ready;this.sync();}
  begin(session) {
    this.session=session;this.ar=true;this.available=false;
    try{this.binding=new XRWebGLBinding(session,this.gl);}catch{this.binding=null;}
    this.note.textContent='Checking camera photo support…';this.sync();
  }
  end() {this.session=null;this.binding=null;this.ar=false;this.available=false;this.cancel();this.note.textContent='Photo saves the 3D preview. Start AR for a camera photo.';this.sync();}
  cancel(message) {if(this.pending){this.pending=false;this.busy=false;if(message)this.note.textContent=message;}this.sync();}
  paused() {this.available=false;this.cancel('Photo cancelled while tracking is paused.');this.sync();}
  unavailable() {const text='AR camera photos are unavailable in this browser. A phone screenshot can include the camera view.';if(this.note.textContent!==text)this.note.textContent=text;}
  onPreview() {
    if(this.ar||!this.ready)return;
    if(!this.available){this.available=true;this.note.textContent='Photo saves the 3D preview. Start AR for a camera photo.';this.sync();}
    if(!this.pending)return;
    const restore=saveGL(this.gl);
    try{this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);this.finish(pixelCanvas(this.gl,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight),'preview');}
    catch(e){this.failed(e);}finally{restore();}
  }
  onXRFrame(frame,pose,scene,reticle) {
    if(!this.ar||frame.session!==this.session)return;
    let view,camera;
    try{view=pose.views.find(v=>v.camera);camera=view?.camera;}catch{}
    const granted=Array.from(this.session.enabledFeatures||[]).includes('camera-access');
    const available=!!(granted&&camera&&this.binding?.getCameraImage);
    if(available!==this.available){this.available=available;if(!this.busy){if(available)this.note.textContent='Photo includes the camera view and your dog.';else this.unavailable();}this.sync();}
    if(!available){if(!this.busy)this.unavailable();if(this.pending){this.cancel();this.unavailable();}return;}
    if(!this.pending)return;
    const g=this.gl,restore=saveGL(g),visible=reticle.visible;
    try{
      const texture=this.binding.getCameraImage(camera);
      if(!texture||!g.isTexture(texture)||!(camera.width>0&&camera.height>0))throw Error('Camera image is not available');
      const factor=Math.min(1,2048/Math.max(camera.width,camera.height),g.getParameter(g.MAX_RENDERBUFFER_SIZE)/Math.max(camera.width,camera.height));
      const w=Math.max(1,Math.round(camera.width*factor)),h=Math.max(1,Math.round(camera.height*factor));
      this.prepare(w,h);
      g.bindFramebuffer(g.FRAMEBUFFER,this.gpu.fbo);g.viewport(0,0,w,h);
      for(const cap of [g.SCISSOR_TEST,g.BLEND,g.CULL_FACE,g.DEPTH_TEST,g.STENCIL_TEST])g.disable(cap);
      g.colorMask(true,true,true,true);g.depthMask(true);g.clearColor(0,0,0,0);g.clearDepth(1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
      g.useProgram(this.gpu.program);g.bindVertexArray(this.gpu.vao);g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,texture);g.uniform1i(this.gpu.sampler,0);g.depthMask(false);g.drawArrays(g.TRIANGLE_STRIP,0,4);
      reticle.visible=false;scene.startFrame();scene.draw(view.projectionMatrix,view.transform);scene.endFrame();
      this.finish(pixelCanvas(g,w,h),'ar');
    }catch(e){this.failed(e);}finally{reticle.visible=visible;restore();}
  }
  prepare(w,h) {
    const g=this.gl;
    if(!this.gpu){
      const compile=(type,source)=>{const shader=g.createShader(type);g.shaderSource(shader,source);g.compileShader(shader);if(!g.getShaderParameter(shader,g.COMPILE_STATUS))throw Error('Photo shader could not compile');return shader;};
      const vertex=compile(g.VERTEX_SHADER,'#version 300 es\nlayout(location=0) in vec2 position;out vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
      const fragment=compile(g.FRAGMENT_SHADER,'#version 300 es\nprecision mediump float;uniform sampler2D cameraImage;in vec2 uv;out vec4 color;void main(){color=vec4(texture(cameraImage,uv).rgb,1.);}');
      const program=g.createProgram();g.attachShader(program,vertex);g.attachShader(program,fragment);g.linkProgram(program);g.deleteShader(vertex);g.deleteShader(fragment);
      if(!g.getProgramParameter(program,g.LINK_STATUS))throw Error('Photo shader could not link');
      const vao=g.createVertexArray(),buffer=g.createBuffer();g.bindVertexArray(vao);g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,g.FLOAT,false,0,0);
      this.gpu={program,vao,buffer,sampler:g.getUniformLocation(program,'cameraImage'),fbo:g.createFramebuffer(),texture:g.createTexture(),depth:g.createRenderbuffer(),w:0,h:0};
    }
    if(this.gpu.w!==w||this.gpu.h!==h){
      g.bindTexture(g.TEXTURE_2D,this.gpu.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,w,h,0,g.RGBA,g.UNSIGNED_BYTE,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
      g.bindFramebuffer(g.FRAMEBUFFER,this.gpu.fbo);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,this.gpu.texture,0);
      g.bindRenderbuffer(g.RENDERBUFFER,this.gpu.depth);g.renderbufferStorage(g.RENDERBUFFER,g.DEPTH_COMPONENT16,w,h);g.framebufferRenderbuffer(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.RENDERBUFFER,this.gpu.depth);
      if(g.checkFramebufferStatus(g.FRAMEBUFFER)!==g.FRAMEBUFFER_COMPLETE)throw Error('Photo target is unavailable');
      this.gpu.w=w;this.gpu.h=h;
    }
  }
  finish(canvas,source) {
    this.pending=false;const token=this.token;
    canvas.toBlob(blob=>{
      if(this.disposed||token!==this.token)return;
      if(!blob){this.failed(Error('Photo could not be saved'));return;}
      if(this.last)URL.revokeObjectURL(this.last.url);
      const filename='dog-lying-photo-'+new Date().toISOString().replace(/[:.]/g,'-')+'.png';
      this.last={blob,filename,url:URL.createObjectURL(blob),width:canvas.width,height:canvas.height,source};
      this.image.src=this.last.url;this.save.href=this.last.url;this.save.download=filename;this.busy=false;this.note.textContent='Photo ready. Save or share it from the preview.';this.sync();this.open();
      const link=document.createElement('a');link.href=this.last.url;link.download=filename;link.addEventListener('click',e=>e.stopPropagation());document.body.append(link);link.click();link.remove();
    },'image/png');
  }
  failed(error) {this.pending=false;this.busy=false;this.note.textContent='Photo could not be taken. '+(error?.message||'Try again.');this.sync();}
  open() {if(!this.last)return;this.review.hidden=false;this.closeButton.focus();}
  close() {this.review.hidden=true;this.button.focus();}
  async share() {
    if(!this.shareSupported())return;
    try{await navigator.share({files:[new File([this.last.blob],this.last.filename,{type:'image/png'})]});}
    catch(e){if(e.name!=='AbortError')this.note.textContent='Photo sharing failed. Use Save photo instead.';}
  }
  dispose() {
    this.disposed=true;this.token++;this.pending=false;if(this.last)URL.revokeObjectURL(this.last.url);
    const g=this.gl,p=this.gpu;if(p){g.deleteFramebuffer(p.fbo);g.deleteRenderbuffer(p.depth);g.deleteTexture(p.texture);g.deleteBuffer(p.buffer);g.deleteVertexArray(p.vao);g.deleteProgram(p.program);}this.gpu=null;
  }
}
