import {attachedViews} from './wall-set.js';
import {squareMesh} from './square-geometry.js';
import {MAX_VIEWS,MAX_BYTES,MAX_EDGE,SECTORS,coverage,selectViews,guideMesh,wallExterior} from './multi-view.js';
import {mat4} from './vendor/js/render/math/gl-matrix.js';
export const LIMITS={translation:.08,rotation:4};
export function alignment(captured,current){
  if(!captured||!current)return {usable:false,distance:Infinity,degrees:180};
  const distance=Math.hypot(current[12]-captured[12],current[13]-captured[13],current[14]-captured[14]);
  let trace=0;for(const i of [0,1,2,4,5,6,8,9,10])trace+=captured[i]*current[i];
  const degrees=Math.acos(Math.max(-1,Math.min(1,(trace-1)/2)))*180/Math.PI;
  return {usable:Number.isFinite(distance)&&Number.isFinite(degrees)&&distance<=LIMITS.translation&&degrees<=LIMITS.rotation,distance,degrees};
}
// Pure camera rotation changes image coordinates, not the camera centre: projective
// UVs already handle it. Positional changes create parallax and are warned, not hidden.
export function viewPolicy(captured,current){
  const a=alignment(captured,current),valid=!!captured&&!!current&&Number.isFinite(a.distance)&&Number.isFinite(a.degrees);
  return {...a,usable:valid,translationWarning:valid&&a.distance>.02,largeTranslation:valid&&a.distance>.08,warning:valid&&a.distance>.02?(a.distance>.08?'PARALLAX WARNING':'POSITION SHIFT — parallax possible'):''};
}
export function projectiveUV(pv,point){
  const [x,y,z]=point,v=[0,0,0,0];for(let r=0;r<4;r++)v[r]=pv[r]*x+pv[4+r]*y+pv[8+r]*z+pv[12+r];
  if(!(v[3]>1e-6))return null;const n=v.slice(0,3).map(a=>a/v[3]);if(n.some(a=>!Number.isFinite(a)||a<-1||a>1))return null;return [(n[0]+1)/2,(n[1]+1)/2];
}
export function arcMesh(segments=48){
  const strip=[],outline=[];for(let i=0;i<=segments;i++){const t=-Math.PI/2+i*Math.PI/segments,x=Math.sin(t),z=Math.cos(t)-1;strip.push(x,-.5,z,x,.5,z);outline.push(x,-.5,z);}for(let i=segments;i>=0;i--){const t=-Math.PI/2+i*Math.PI/segments;outline.push(Math.sin(t),.5,Math.cos(t)-1);}return {data:new Float32Array([...strip,...outline]),stripCount:strip.length/3,outlineCount:outline.length/3};
}
export class CaptureWall {
  constructor(gl){
    this.gl=gl;this.snapshot=null;this.captures=0;this.views=[];this.bytes=0;this.wallVersion=0;this.plan=null;
    const make=(vs,fs)=>{const program=gl.createProgram();for(const [kind,source] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader);gl.deleteShader(shader);}gl.bindAttribLocation(program,0,'a');gl.bindAttribLocation(program,1,'n');gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));return program;};
    this.copy=make('attribute vec3 a;varying vec2 uv;void main(){uv=a.xy*.5+.5;gl_Position=vec4(a.xy,0.,1.);}','precision highp float;varying vec2 uv;uniform sampler2D image;void main(){gl_FragColor=vec4(texture2D(image,uv).rgb,1.);}');
    this.program=make('attribute vec3 a;attribute vec3 n;uniform mat4 projection,view,model,capturePV;uniform float radius,height;varying vec4 captured;varying vec3 wp,wn;void main(){vec4 world=model*vec4(a.x*radius,a.y*height,a.z*radius,1.);wp=world.xyz;wn=normalize((model*vec4(n,0.)).xyz);captured=capturePV*world;gl_Position=projection*view*world;}',`precision highp float;varying vec4 captured;varying vec3 wp,wn;uniform sampler2D image;uniform float debug;uniform vec3 guideColor,capturePosition,currentPosition;void main(){if(debug>.5){gl_FragColor=vec4(guideColor,1.);return;}if(dot(capturePosition-wp,wn)<=.001||dot(currentPosition-wp,wn)<=.001)discard;if(captured.w<=.000001)discard;vec3 p=captured.xyz/captured.w;if(any(lessThan(p,vec3(-1.)))||any(greaterThan(p,vec3(1.))))discard;gl_FragColor=vec4(texture2D(image,p.xy*.5+.5).rgb,1.);}`);
    this.u=Object.fromEntries(['projection','view','model','capturePV','radius','height','debug','image','guideColor','capturePosition','currentPosition'].map(n=>[n,gl.getUniformLocation(this.program,n)]));this.copySampler=gl.getUniformLocation(this.copy,'image');
    const old=gl.getParameter(gl.ARRAY_BUFFER_BINDING);this.copyBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.copyBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),gl.STATIC_DRAW);this.mesh=squareMesh();this.arcBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.arcBuffer);gl.bufferData(gl.ARRAY_BUFFER,this.mesh.data,gl.STATIC_DRAW);this.guides=guideMesh();this.guideBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.guideBuffer);gl.bufferData(gl.ARRAY_BUFFER,this.guides.data,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,old);this.vao=gl.createVertexArray();
    const previous=gl.getParameter(gl.TEXTURE_BINDING_2D);this.fallback=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.fallback);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.bindTexture(gl.TEXTURE_2D,previous);
  }
  withState(run){
    const g=this.gl,flags=[g.DEPTH_TEST,g.BLEND,g.CULL_FACE,g.SCISSOR_TEST,g.STENCIL_TEST];
    const old={depthFunc:g.getParameter(g.DEPTH_FUNC),program:g.getParameter(g.CURRENT_PROGRAM),buffer:g.getParameter(g.ARRAY_BUFFER_BINDING),vao:g.getParameter(g.VERTEX_ARRAY_BINDING),draw:g.getParameter(g.DRAW_FRAMEBUFFER_BINDING),read:g.getParameter(g.READ_FRAMEBUFFER_BINDING),viewport:g.getParameter(g.VIEWPORT),active:g.getParameter(g.ACTIVE_TEXTURE),depth:g.getParameter(g.DEPTH_WRITEMASK),color:g.getParameter(g.COLOR_WRITEMASK),flags:flags.map(f=>g.isEnabled(f))};
    g.activeTexture(g.TEXTURE0);old.texture=g.getParameter(g.TEXTURE_BINDING_2D);
    try{flags.forEach(f=>g.disable(f));g.depthMask(false);g.colorMask(true,true,true,true);g.bindVertexArray(this.vao);return run();}
    finally{g.bindTexture(g.TEXTURE_2D,old.texture);g.activeTexture(old.active);g.useProgram(old.program);g.bindVertexArray(old.vao);g.bindBuffer(g.ARRAY_BUFFER,old.buffer);g.bindFramebuffer(g.DRAW_FRAMEBUFFER,old.draw);g.bindFramebuffer(g.READ_FRAMEBUFFER,old.read);g.viewport(...old.viewport);g.depthMask(old.depth);g.depthFunc(old.depthFunc);g.colorMask(...old.color);flags.forEach((f,i)=>old.flags[i]?g.enable(f):g.disable(f));}
  }
  bind(buffer){const g=this.gl;g.bindBuffer(g.ARRAY_BUFFER,buffer);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,3,g.FLOAT,false,0,0);g.disableVertexAttribArray(1);g.vertexAttrib3f(1,0,0,1);}
  clear(){for(const view of this.views){this.gl.deleteTexture(view.texture);this.gl.deleteFramebuffer(view.framebuffer);}this.views=[];this.snapshot=null;this.bytes=0;this.plan=null;this.wallVersion++;}
  choose(current,model,radius,height){this.plan=selectViews(attachedViews(this.views,model),current,model,radius,height,this.snapshot?.id,this.wallVersion);this.snapshot=this.plan.primary||this.views.at(-1)||null;return this.plan;}
  capture({texture,width,height,projection,viewInverse,cameraGranted=false,model,radius=1.2,wallHeight=2}){
    const g=this.gl;if(!cameraGranted||!texture||texture===this.fallback||!g.isTexture(texture)||width<16||height<16)throw Error('Capture requires a granted, valid current raw camera image; no diagnostic substitute');
    if(!projection||!viewInverse||!model)throw Error('Capture pose/projection or wall transform unavailable');if(this.views.length>=MAX_VIEWS)throw Error('Six views already stored. Clear views to start a new set; existing views retained.');
    const capturePV=mat4.create(),cameraWorld=mat4.create();mat4.multiply(capturePV,projection,viewInverse);if(!mat4.invert(cameraWorld,viewInverse))throw Error('Invalid capture pose');const exterior=coverage([{capturePV,world:cameraWorld}],model,radius,wallHeight,cameraWorld);if(!exterior.some(row=>row.usable>0))throw Error('No exterior panel in this view. Walk outside the left, back or right wall and aim at its outer face; previous photos kept.');
    const scale=Math.min(1,MAX_EDGE/Math.max(width,height)),w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));let owned=null,framebuffer=null;if(this.bytes+w*h*4>MAX_BYTES)throw Error('16 MiB image limit reached; existing views retained. Clear views to start a new set.');
    try{
      this.withState(()=>{
        owned=g.createTexture();g.bindTexture(g.TEXTURE_2D,owned);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,w,h,0,g.RGBA,g.UNSIGNED_BYTE,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
        framebuffer=g.createFramebuffer();g.bindFramebuffer(g.FRAMEBUFFER,framebuffer);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,owned,0);if(g.checkFramebufferStatus(g.FRAMEBUFFER)!==g.FRAMEBUFFER_COMPLETE)throw Error('Capture framebuffer incomplete');
        g.viewport(0,0,w,h);g.useProgram(this.copy);this.bind(this.copyBuffer);g.bindTexture(g.TEXTURE_2D,texture);g.uniform1i(this.copySampler,0);g.drawArrays(g.TRIANGLE_FAN,0,4);
        let brightest=0;const pixel=new Uint8Array(4);for(const u of [.2,.5,.8])for(const v of [.2,.5,.8]){g.readPixels(Math.floor(u*(w-1)),Math.floor(v*(h-1)),1,1,g.RGBA,g.UNSIGNED_BYTE,pixel);brightest=Math.max(brightest,pixel[0],pixel[1],pixel[2]);}
        if(g.getError()!==g.NO_ERROR)throw Error('Camera copy or pixel validation failed');if(brightest<=2)throw Error('Camera copy appears blank/black; capture not accepted');
      });
      const pv=mat4.create(),world=mat4.create();mat4.multiply(pv,projection,viewInverse);if(!mat4.invert(world,viewInverse))throw Error('Invalid capture pose');
      const shot={texture:owned,framebuffer,width:w,pixelHeight:h,height:h,rawWidth:width,rawHeight:height,projection:new Float32Array(projection),viewInverse:new Float32Array(viewInverse),capturePV:pv,world,at:Date.now(),id:++this.captures,wallVersion:this.wallVersion,model:new Float32Array(model),radius,height:wallHeight,bytes:w*h*4};this.views.push(shot);this.bytes+=shot.bytes;this.snapshot=shot;this.plan=null;return shot;
    }catch(e){if(owned)g.deleteTexture(owned);if(framebuffer)g.deleteFramebuffer(framebuffer);throw e;}
  }
  draw({projection,view,model,radius=1.2,height=2,effect=true,debug=true,viewport,aligned=false,currentWorld=null,guideExteriorOnly=false,selected=true}){
    if(!model||!effect)return {imageSubmitted:false,selected:null};if(!currentWorld){currentWorld=mat4.create();if(!mat4.invert(currentWorld,view))return {imageSubmitted:false,selected:null};}const g=this.gl,u=this.u,plan=this.choose(currentWorld,model,radius,height);let submitted=0;
    this.withState(()=>{g.enable(g.DEPTH_TEST);g.depthMask(true);g.depthFunc(g.LEQUAL);g.viewport(viewport.x,viewport.y,viewport.width,viewport.height);g.useProgram(this.program);this.bind(this.arcBuffer);g.vertexAttribPointer(0,3,g.FLOAT,false,24,0);g.enableVertexAttribArray(1);g.vertexAttribPointer(1,3,g.FLOAT,false,24,12);g.uniformMatrix4fv(u.projection,false,projection);g.uniformMatrix4fv(u.view,false,view);g.uniformMatrix4fv(u.model,false,model);g.uniform1f(u.radius,radius);g.uniform1f(u.height,height);g.uniform1i(u.image,0);g.uniform3f(u.currentPosition,currentWorld[12],currentWorld[13],currentWorld[14]);
      if(aligned)for(const shot of plan.order){g.uniformMatrix4fv(u.capturePV,false,shot.capturePV);g.uniform3f(u.capturePosition,shot.world[12],shot.world[13],shot.world[14]);g.uniform1f(u.debug,0);g.bindTexture(g.TEXTURE_2D,shot.texture);g.drawArrays(g.TRIANGLES,0,this.mesh.stripCount);submitted++;}
      if(debug){this.bind(this.guideBuffer);g.bindTexture(g.TEXTURE_2D,this.fallback);g.uniformMatrix4fv(u.capturePV,false,mat4.create());g.uniform1f(u.debug,1);for(const row of plan.coverage){if(guideExteriorOnly&&!wallExterior(currentWorld,model,radius,height,row.sector))continue;const green=row.currentUsable;g.uniform3f(u.guideColor,selected?(green?.25:1):.55,selected?(green?1:.62):.65,selected?(green?.65:.15):.7);const range=this.guides.ranges[row.sector];g.drawArrays(g.LINE_LOOP,range.first,range.count);}}
    });return {imageSubmitted:submitted>0,selected:plan.primary?.id||null,passes:submitted,recordedSectors:plan.recordedSectors,usableSectors:plan.usableSectors};
  }
}
