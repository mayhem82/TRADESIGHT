// Adapted from AR Colour Vision's granted XR camera readback path.
export function makeCameraReader(gl,target){
 const raw={texture:gl.createTexture(),fbo:gl.createFramebuffer(),width:0,height:0,pixels:null,reader:null,image:null};
 function read(camera){
  const g=gl,w=384,h=Math.max(1,Math.round(w*camera.height/camera.width));
  if(!raw.reader){
   const compile=(type,source)=>{const shader=g.createShader(type);g.shaderSource(shader,source);g.compileShader(shader);if(!g.getShaderParameter(shader,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(shader));return shader;};
   raw.reader=g.createProgram();g.attachShader(raw.reader,compile(g.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}'));g.attachShader(raw.reader,compile(g.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D image;varying vec2 uv;void main(){gl_FragColor=vec4(texture2D(image,uv).rgb,1.);}'));g.linkProgram(raw.reader);if(!g.getProgramParameter(raw.reader,g.LINK_STATUS))throw Error(g.getProgramInfoLog(raw.reader));
   raw.vao=g.createVertexArray();g.bindVertexArray(raw.vao);raw.buffer=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,raw.buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);const a=g.getAttribLocation(raw.reader,'p');g.enableVertexAttribArray(a);g.vertexAttribPointer(a,2,g.FLOAT,false,0,0);g.bindVertexArray(null);
  }
  if(raw.width!==w||raw.height!==h){raw.width=w;raw.height=h;raw.pixels=new Uint8Array(w*h*4);raw.image=new ImageData(w,h);g.bindTexture(g.TEXTURE_2D,raw.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,w,h,0,g.RGBA,g.UNSIGNED_BYTE,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.bindFramebuffer(g.FRAMEBUFFER,raw.fbo);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,raw.texture,0);if(g.checkFramebufferStatus(g.FRAMEBUFFER)!==g.FRAMEBUFFER_COMPLETE)throw Error('Camera framebuffer incomplete');}
  g.bindFramebuffer(g.FRAMEBUFFER,raw.fbo);g.viewport(0,0,w,h);g.disable(g.DEPTH_TEST);g.disable(g.BLEND);g.disable(g.SCISSOR_TEST);g.disable(g.STENCIL_TEST);g.colorMask(true,true,true,true);g.useProgram(raw.reader);g.bindVertexArray(raw.vao);g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,camera.texture);g.uniform1i(g.getUniformLocation(raw.reader,'image'),0);g.drawArrays(g.TRIANGLE_STRIP,0,4);g.readPixels(0,0,w,h,g.RGBA,g.UNSIGNED_BYTE,raw.pixels);const error=g.getError();if(error!==g.NO_ERROR)throw Error('Camera readback error '+error);
  for(let y=0;y<h;y++)raw.image.data.set(raw.pixels.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4);if(target.width!==w||target.height!==h){target.width=w;target.height=h;}target.getContext('2d').putImageData(raw.image,0,0);g.bindVertexArray(null);
 }
 read.dispose=()=>{gl.deleteTexture(raw.texture);gl.deleteFramebuffer(raw.fbo);if(raw.reader)gl.deleteProgram(raw.reader);if(raw.buffer)gl.deleteBuffer(raw.buffer);if(raw.vao)gl.deleteVertexArray(raw.vao);};
 return read;
}

// Raw camera readback bypasses Three's state cache. Restore the renderer's
// render target as well as WebGL state: XR's framebuffer is not the default
// framebuffer and resetState() clears Three's current render-target pointer.
export function readCameraFrame(renderer,read,camera){
 const gl=renderer.getContext(),target=renderer.getRenderTarget(),face=renderer.getActiveCubeFace(),level=renderer.getActiveMipmapLevel();
 const viewport=Array.from(gl.getParameter(gl.VIEWPORT)),scissor=Array.from(gl.getParameter(gl.SCISSOR_BOX)),scissorEnabled=gl.isEnabled(gl.SCISSOR_TEST);
 const drawFramebuffer=gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING),readFramebuffer=gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
 try{return read(camera);}
 finally{
  renderer.resetState();renderer.setRenderTarget(target,face,level);
  renderer.state.bindFramebuffer(gl.DRAW_FRAMEBUFFER,drawFramebuffer);renderer.state.bindFramebuffer(gl.READ_FRAMEBUFFER,readFramebuffer);
  renderer.state.viewport({x:viewport[0],y:viewport[1],z:viewport[2],w:viewport[3]});
  renderer.state.scissor({x:scissor[0],y:scissor[1],z:scissor[2],w:scissor[3]});renderer.state.setScissorTest(scissorEnabled);
 }
}
