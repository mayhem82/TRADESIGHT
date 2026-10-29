// A walk-around colour pavilion: architectural surfaces, floor, columns,
// roof beams and 96 fins. Every face receives the actual Colour Vision output.
// DOM/canvas uploads below use UNPACK_FLIP_Y_WEBGL=true: v=1 is the
// image's top. Vertical faces therefore increase v with model height.
// Reverse u on opposing outward faces so lettering reads left-to-right
// from either exterior, including the closed back facing the placement user.
export function surfaceUV(normal,x,y,z){
 if(normal[1]!==0)return [(x+1.25)/2.5,(z+.95)/1.9]; // Existing world-X/Z floor and roof mapping.
 const u=normal[0]!==0?(z+.95)/1.9:(x+1.25)/2.5;
 return [normal[0]>0||normal[2]<0?1-u:u,y/2.25];
}
export function architecture(kind='pavilion') {
 const out=[];
 const box=(x,y,z,w,h,d)=>{
  const faces=[[[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],[[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]],[[1,0,0],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]],[[-1,0,0],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]],[[0,1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],[[0,-1,0],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]]];
  for(const [normal,vertices] of faces)for(const i of [0,1,2,0,2,3]){const p=vertices[i],px=x+p[0]*w/2,py=y+p[1]*h/2,pz=z+p[2]*d/2;out.push(px,py,pz,...surfaceUV(normal,px,py,pz),...normal);}
 };
 if(kind==='surface'){box(0,1,0,2,2,.035);return new Float32Array(out);}
 box(0,.025,0,2.4,.05,1.8);box(0,1.98,0,2.5,.08,1.9);
 for(const x of [-1.12,1.12])for(const z of [-.82,.82])box(x,1,z,.1,2,.1);
 box(0,1,-.84,2.2,1.85,.035);
 if(kind==='gallery'){box(-1.1,1,0,.035,1.85,1.65);box(1.1,1,0,.035,1.85,1.65);for(let i=0;i<20;i++)box(-1.2+i*.126,2.12,0,.045,.22,1.9);}
 else{for(const side of [-1,1])for(let i=0;i<48;i++)box(side*1.1,1,-.8+i*1.6/47,.065,1.85,.018);for(let i=0;i<16;i++)box(-1.2+i*.16,2.12,0,.04,.22,1.9);}
 // Raised plinth and six stepped seats provide depth and varied image-bearing surfaces.
 for(let i=0;i<6;i++)box(-.85+i*.34,.18,.35,.27,.3,.45);
 return new Float32Array(out);
}
export class ModelRenderer{
 constructor(gl){this.gl=gl;const shader=(type,s)=>{const h=gl.createShader(type);gl.shaderSource(h,s);gl.compileShader(h);if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(h));return h;};this.program=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,'attribute vec3 position;attribute vec2 uv;attribute vec3 normal;uniform mat4 projection,view,model;varying vec2 v;varying float light;void main(){v=uv;light=.72+.28*abs(dot(normal,normalize(vec3(.5,.8,1.))));gl_Position=projection*view*model*vec4(position,1.);}'],[gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;varying float light;uniform sampler2D image;void main(){gl_FragColor=vec4(texture2D(image,v).rgb*light,1.);}']])gl.attachShader(this.program,shader(t,s));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));this.u=Object.fromEntries(['projection','view','model','image'].map(k=>[k,gl.getUniformLocation(this.program,k)]));this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);for(const [k,n,offset] of [['position',3,0],['uv',2,12],['normal',3,20]]){const a=gl.getAttribLocation(this.program,k);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,32,offset);}gl.bindVertexArray(null);this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);this.meshes={};}
 upload(canvas){const g=this.gl;g.bindTexture(g.TEXTURE_2D,this.texture);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,canvas);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,false);}
 draw(projection,view,items){const g=this.gl;g.enable(g.DEPTH_TEST);g.depthMask(true);g.disable(g.CULL_FACE);g.disable(g.BLEND);g.useProgram(this.program);g.bindVertexArray(this.vao);g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,this.texture);g.uniform1i(this.u.image,0);g.uniformMatrix4fv(this.u.projection,false,projection);g.uniformMatrix4fv(this.u.view,false,view);for(const item of items){const data=this.meshes[item.kind]??=architecture(item.kind);g.bindBuffer(g.ARRAY_BUFFER,this.buffer);g.bufferData(g.ARRAY_BUFFER,data,g.STATIC_DRAW);g.uniformMatrix4fv(this.u.model,false,item.matrix);g.drawArrays(g.TRIANGLES,0,data.length/8);}g.bindVertexArray(null);}
}
