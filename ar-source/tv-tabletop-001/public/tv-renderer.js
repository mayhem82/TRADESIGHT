import {PARTS,SPEC} from './model.js';
export class TVRenderer {
 constructor(gl){this.gl=gl;const vertices=[];const face=(corners,color)=>{for(const i of [0,1,2,0,2,3])vertices.push(...corners[i],...color);};
  for(const {size:s,center:p,color:c} of PARTS){const x=p[0]-s[0]/2,X=p[0]+s[0]/2,y=p[1]-s[1]/2,Y=p[1]+s[1]/2,z=p[2]-s[2]/2,Z=p[2]+s[2]/2;
   face([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],c);face([[X,y,z],[x,y,z],[x,Y,z],[X,Y,z]],c.map(v=>v*.6));face([[x,Y,Z],[X,Y,Z],[X,Y,z],[x,Y,z]],c.map(v=>v*1.5));face([[x,y,z],[X,y,z],[X,y,Z],[x,y,Z]],c);face([[X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z]],c.map(v=>v*.85));face([[x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z]],c.map(v=>v*.85));}
  const x=SPEC.width/2-.012,y=SPEC.height-SPEC.bodyHeight+.014,Y=SPEC.height-.012,z=SPEC.bodyDepth/2;
  face([[-x,y,z],[x,y,z],[x,Y,z],[-x,Y,z]],[.035,.19,.27]);
  // Original abstract screen graphic; no third-party marketing imagery.
  face([[-x*.97,y+.02,z],[x*.97,y+.02,z],[x*.97,y+.11,z],[-x*.97,y+.11,z]],[.08,.36,.40]);
  this.count=vertices.length/6;this.screenStart=PARTS.length*36;this.guideStart=this.count;const w=SPEC.standWidth/2,d=SPEC.standDepth/2;
  for(const p of [[-w,0,-d],[w,0,-d],[w,0,d],[-w,0,d]])vertices.push(...p,.3,.95,.7);
  const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const vs=shader(gl.VERTEX_SHADER,'attribute vec3 position,color;uniform mat4 projection,view,model;varying vec3 tint;void main(){tint=color;gl_Position=projection*view*model*vec4(position,1.);}');
  const fs=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 tint;void main(){gl_FragColor=vec4(tint,1.);}');this.program=gl.createProgram();gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.bindAttribLocation(this.program,0,'position');gl.bindAttribLocation(this.program,1,'color');gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.deleteShader(vs);gl.deleteShader(fs);
  this.u=Object.fromEntries(['projection','view','model'].map(k=>[k,gl.getUniformLocation(this.program,k)]));this.buffer=gl.createBuffer();const old=gl.getParameter(gl.ARRAY_BUFFER_BINDING);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,old);
  this.vao=gl.createVertexArray();
 }
 draw(projection,view,model,viewport,guide=true){if(!model)return;const g=this.gl,flags=[g.DEPTH_TEST,g.BLEND,g.CULL_FACE,g.SCISSOR_TEST,g.POLYGON_OFFSET_FILL],old={program:g.getParameter(g.CURRENT_PROGRAM),vao:g.getParameter(g.VERTEX_ARRAY_BINDING),buffer:g.getParameter(g.ARRAY_BUFFER_BINDING),depth:g.getParameter(g.DEPTH_WRITEMASK),func:g.getParameter(g.DEPTH_FUNC),factor:g.getParameter(g.POLYGON_OFFSET_FACTOR),units:g.getParameter(g.POLYGON_OFFSET_UNITS),viewport:g.getParameter(g.VIEWPORT),flags:flags.map(f=>g.isEnabled(f))};
  try{g.bindVertexArray(this.vao);g.bindBuffer(g.ARRAY_BUFFER,this.buffer);for(let i=0;i<2;i++){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,3,g.FLOAT,false,24,i*12);}g.useProgram(this.program);g.enable(g.DEPTH_TEST);g.depthMask(true);g.depthFunc(g.LEQUAL);g.disable(g.BLEND);g.disable(g.CULL_FACE);g.disable(g.SCISSOR_TEST);g.disable(g.POLYGON_OFFSET_FILL);g.viewport(viewport.x,viewport.y,viewport.width,viewport.height);for(const [k,v]of Object.entries({projection,view,model}))g.uniformMatrix4fv(this.u[k],false,v);g.drawArrays(g.TRIANGLES,0,this.screenStart);g.enable(g.POLYGON_OFFSET_FILL);g.polygonOffset(-1,-1);g.drawArrays(g.TRIANGLES,this.screenStart,6);g.polygonOffset(-2,-2);g.drawArrays(g.TRIANGLES,this.screenStart+6,6);if(guide){g.disable(g.DEPTH_TEST);g.drawArrays(g.LINE_LOOP,this.guideStart,4);}}
  finally{g.useProgram(old.program);g.bindVertexArray(old.vao);g.bindBuffer(g.ARRAY_BUFFER,old.buffer);g.depthMask(old.depth);g.depthFunc(old.func);g.polygonOffset(old.factor,old.units);g.viewport(...old.viewport);flags.forEach((f,i)=>old.flags[i]?g.enable(f):g.disable(f));}
 }
}
