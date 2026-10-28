import {Node} from './js/render/core/node.js';
import {Material,RENDER_ORDER} from './js/render/core/material.js';
import {Primitive,PrimitiveAttribute} from './js/render/core/primitive.js';

const VERTEX=`in vec3 POSITION; vec4 vertex_main(mat4 proj,mat4 view,mat4 model){return proj*view*model*vec4(POSITION,1.0);}`;
class WallMaterial extends Material {
  constructor(guide=false){super();this.guide=guide;this.state.cullFace=false;this.state.colorMask=guide;this.state.depthMask=!guide;this.state.depthTest=!guide;this.renderOrder=guide?RENDER_ORDER.ADDITIVE:RENDER_ORDER.OPAQUE;}
  get materialName(){return this.guide?'YOWIE_WALL_GUIDE':'YOWIE_DEPTH_WALL';}
  get vertexSource(){return VERTEX;}
  get fragmentSource(){return this.guide?'vec4 fragment_main(){return vec4(0.25,1.0,0.65,1.0);}':'vec4 fragment_main(){return vec4(0.0);}';}
}
class WallNode extends Node {
  constructor(points,guide=false){super();this.points=points;this.guide=guide;}
  onRendererChanged(renderer){
    const gl=renderer.gl,positions=new Float32Array(this.points.flatMap(p=>[p.x,p.y,p.z]));
    const indices=new Uint16Array(this.guide?[0,1,1,2,2,3,3,0]:[0,1,2,0,2,3]);
    const vb=renderer.createRenderBuffer(gl.ARRAY_BUFFER,positions),ib=renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);
    const primitive=new Primitive([new PrimitiveAttribute('POSITION',vb,3,gl.FLOAT,0,0)],indices.length,this.guide?gl.LINES:gl.TRIANGLES);primitive.setIndexBuffer(ib);
    const draw=renderer.createRenderPrimitive(primitive,new WallMaterial(this.guide));this.addRenderPrimitive(draw);
    if(!this.guide){const queue=renderer._renderPrimitives[RENDER_ORDER.OPAQUE],index=queue.indexOf(draw);queue.splice(index,1);queue.unshift(draw);}
  }
}
function lerp(a,b,t){return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};}
export function wallPanels(wall){
  const {a,b,height,door}=wall,length=Math.hypot(b.x-a.x,b.z-a.z);
  const panel=(p,q,bottomP=p.y,bottomQ=q.y)=>({a:p,b:q,bottomA:bottomP,bottomB:bottomQ,topA:p.y+height,topB:q.y+height,points:[{...p,y:bottomP},{...q,y:bottomQ},{...q,y:q.y+height},{...p,y:p.y+height}]});
  if(!door)return [panel(a,b)];
  const left=lerp(a,b,(length-door.width)/(2*length)),right=lerp(a,b,(length+door.width)/(2*length)),header=(a.y+b.y)/2+door.height;
  return [panel(a,left),panel(right,b),panel(left,right,header,header)];
}
export class InvisibleWalls {
  constructor(scene){
    this.scene=scene;this.walls=[];this.nodes=[];this.guides=[];this.pendingNode=null;this.first=null;this.building=false;this.showGuides=false;
    this.status=document.querySelector('#wall-status');
    document.querySelector('#wall-add')?.addEventListener('click',()=>{this.building=!this.building;this.first=null;const details=document.querySelector('#environment-tools');if(details)details.open=false;this.refreshPending();this.status.textContent=this.building?'Tap the circle at the first wall corner.':'Wall editing stopped.';const live=document.querySelector('#walking-status');if(live)live.textContent=this.status.textContent;this.updateVisibility();});
    document.querySelector('#wall-undo')?.addEventListener('click',()=>{this.walls.pop();this.rebuild();this.status.textContent='Last wall removed.';});
    document.querySelector('#wall-clear')?.addEventListener('click',()=>{this.walls=[];this.cancelBuild();this.rebuild();this.status.textContent='Walls cleared.';});
    document.querySelector('#wall-guides')?.addEventListener('change',e=>{this.showGuides=e.target.checked;this.updateVisibility();});
    for(const input of document.querySelectorAll('[data-wall-dimension]'))input.addEventListener('input',()=>{const out=document.querySelector('[data-wall-value="'+input.id+'"]');if(out)out.textContent=Number(input.value).toFixed(2)+' m';});
  }
  settings(){return {height:Number(document.querySelector('#wall-height')?.value||2.4),door:document.querySelector('#wall-door')?.checked?{width:Number(document.querySelector('#door-width')?.value||1.5),height:Number(document.querySelector('#door-height')?.value||2.1)}:null};}
  select(matrix){
    const point={x:matrix[12],y:matrix[13],z:matrix[14]};
    if(!this.first){this.first=point;this.refreshPending();this.status.textContent='First corner saved. Tap the circle at the other end of the wall.';return;}
    const length=Math.hypot(point.x-this.first.x,point.z-this.first.z),settings=this.settings();
    if(length<.25){this.status.textContent='Choose wall endpoints at least 25 cm apart.';return;}
    if(settings.door&&(length<settings.door.width+.24||settings.door.height>=settings.height-.05)){this.status.textContent='Allow space for both jambs and a lintel. Increase wall length or height.';return;}
    if(settings.door){const delta=Math.abs(point.y-this.first.y)*settings.door.width/(2*length);if(settings.door.height+delta>settings.height-.05){this.status.textContent='Increase wall height for this doorway on sloping ground.';return;}}
    this.walls.push({a:this.first,b:point,...settings});this.first=null;this.building=false;this.refreshPending();this.rebuild();this.status.textContent=settings.door?'Invisible wall with doorway added.':'Invisible wall added.';
  }
  dispose(node){
    if(!node)return;const renderer=node._renderer;
    if(renderer)for(const primitive of node.renderPrimitives||[]){const queue=renderer._renderPrimitives[primitive._material._renderOrder],index=queue?.indexOf(primitive);if(index>=0)queue.splice(index,1);const buffers=new Set(primitive._attributeBuffers.map(a=>a._buffer._buffer));if(primitive._indexBuffer)buffers.add(primitive._indexBuffer._buffer);for(const buffer of buffers)if(buffer)renderer.gl.deleteBuffer(buffer);if(primitive._vao)renderer.gl.deleteVertexArray(primitive._vao);}
    node.clearRenderPrimitives();this.scene.removeNode(node);
  }
  refreshPending(){this.dispose(this.pendingNode);this.pendingNode=null;if(this.first){const p=this.first,h=this.settings().height;this.pendingNode=new WallNode([{x:p.x-.04,y:p.y,z:p.z},{x:p.x+.04,y:p.y,z:p.z},{x:p.x+.04,y:p.y+h,z:p.z},{x:p.x-.04,y:p.y+h,z:p.z}],true);this.scene.addNode(this.pendingNode);}}
  cancelBuild(){this.building=false;this.first=null;this.refreshPending();this.updateVisibility();}
  updateVisibility(){for(const guide of this.guides)guide.visible=this.showGuides||this.building;const button=document.querySelector('#wall-add');if(button)button.textContent=this.building?'Cancel wall':'Add invisible wall';}
  rebuild(){
    for(const node of [...this.nodes,...this.guides])this.dispose(node);this.nodes=[];this.guides=[];
    for(const wall of this.walls)for(const panel of wallPanels(wall)){const depth=new WallNode(panel.points),guide=new WallNode(panel.points,true);this.nodes.push(depth);this.guides.push(guide);this.scene.addNode(depth);this.scene.addNode(guide);}
    this.updateVisibility();
  }
  end(){this.walls=[];this.cancelBuild();this.rebuild();}
}
