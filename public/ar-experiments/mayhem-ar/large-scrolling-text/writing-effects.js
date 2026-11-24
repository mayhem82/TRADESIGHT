import * as T from '../bottle-bloom-001/vendor/three.module.js';
// Draw the same font outlines used by TextGeometry into the original effects engine.
export function drawWritingSource(canvas,items,width,height,colour='#ffffff'){
 const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(canvas.width/width,0,0,-canvas.height/height,canvas.width/2,canvas.height/2);ctx.fillStyle=colour;
 for(const {text,font,size,x,y} of items){let cursor=x;const scale=size/font.data.resolution;for(const ch of text){const glyph=font.data.glyphs[ch]||font.data.glyphs['?'];if(!glyph)continue;const outline=glyph.o?.split(' ')||[];ctx.beginPath();for(let i=0;i<outline.length;){const op=outline[i++];if(op==='m'){const x=Number(outline[i++])*scale+cursor,y2=Number(outline[i++])*scale+y;ctx.moveTo(x,y2);}else if(op==='l'){const x=Number(outline[i++])*scale+cursor,y2=Number(outline[i++])*scale+y;ctx.lineTo(x,y2);}else if(op==='q'){const x=Number(outline[i++])*scale+cursor,y2=Number(outline[i++])*scale+y,cx=Number(outline[i++])*scale+cursor,cy=Number(outline[i++])*scale+y;ctx.quadraticCurveTo(cx,cy,x,y2);}else if(op==='b'){const x=Number(outline[i++])*scale+cursor,y2=Number(outline[i++])*scale+y,cx1=Number(outline[i++])*scale+cursor,cy1=Number(outline[i++])*scale+y,cx2=Number(outline[i++])*scale+cursor,cy2=Number(outline[i++])*scale+y;ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x,y2);}else break;}ctx.fill('evenodd');cursor+=glyph.ha*scale;}}
}
// The engine output colours the real extruded glyph geometry. Its transparent
// outside-glyph contribution (outlines and particles) is placed on a
// world-anchored, transparent effects-only plane; no text is drawn on it.
export class WritingEffects {
 constructor(engine,root,front,side){
  this.engine=engine;this.root=root;this.front=front;this.side=side;
  this.source=document.createElement('canvas');this.output=document.createElement('canvas');this.halo=document.createElement('canvas');
  this.source.width=this.output.width=this.halo.width=512;this.source.height=this.output.height=this.halo.height=640;
  this.texture=new T.CanvasTexture(this.output);this.texture.colorSpace=T.SRGBColorSpace;
  this.haloTexture=new T.CanvasTexture(this.halo);this.haloTexture.colorSpace=T.SRGBColorSpace;
  this.haloMaterial=new T.MeshBasicMaterial({map:this.haloTexture,transparent:true,depthWrite:false,side:T.DoubleSide});
  this.haloMesh=new T.Mesh(new T.PlaneGeometry(1,1),this.haloMaterial);this.haloMesh.position.z=.027;this.haloMesh.renderOrder=2;root.add(this.haloMesh);
  engine.begin(this.source);this.enabled=false;
 }
 setEnabled(enabled){
  this.enabled=enabled;this.haloMesh.visible=enabled;
  for(const material of [this.front,this.side]){material.map=enabled?this.texture:null;material.transparent=enabled;material.alphaTest=enabled?.01:0;material.needsUpdate=true;}
 }
 update(items,meshes,width,height,colour='#ffffff'){
  if(!this.enabled)return;
  const w=512,h=Math.max(1,Math.round(w*height/width));
  if(this.source.width!==w||this.source.height!==h){for(const c of [this.source,this.output,this.halo]){c.width=w;c.height=h;}}
  drawWritingSource(this.source,items,width,height,colour);this.engine.render();this.engine.composite(this.output);
  const ctx=this.halo.getContext('2d');ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='source-over';ctx.drawImage(this.output,0,0);ctx.globalCompositeOperation='destination-out';ctx.drawImage(this.source,0,0);ctx.globalCompositeOperation='source-over';
  this.texture.needsUpdate=true;this.haloTexture.needsUpdate=true;this.haloMesh.scale.set(width,height,1);
  for(const mesh of meshes)mapWritingGeometry(mesh,width,height);
 }
 dispose(){this.setEnabled(false);this.engine.suspend();this.root.remove(this.haloMesh);this.haloMesh.geometry.dispose();this.haloMaterial.dispose();this.texture.dispose();this.haloTexture.dispose();}
}
export function mapWritingGeometry(mesh,width,height){
 const p=mesh.geometry.getAttribute('position'),uv=mesh.geometry.getAttribute('uv');if(!p||!uv)return;
 for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+mesh.position.x+width/2)/width,(p.getY(i)+mesh.position.y+height/2)/height);
 uv.needsUpdate=true;
}
