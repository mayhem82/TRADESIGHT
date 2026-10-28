import {Node} from './js/render/core/node.js';
import {Material} from './js/render/core/material.js';
import {PrimitiveStream} from './js/render/geometry/primitive-stream.js';
import {mat4} from './js/render/math/gl-matrix.js';

export function classifyNormal(matrix) {
  const up = Math.abs(matrix[5]) / (Math.hypot(matrix[4], matrix[5], matrix[6]) || 1);
  return up > 0.9 ? 'horizontal' : up < 0.25 ? 'vertical' : 'sloped';
}
class SurfaceMaterial extends Material {
  constructor(wall) { super(); this.wall=wall; this.state.cullFace=false; }
  get materialName() { return this.wall ? 'SCAN_WALL' : 'SCAN_HORIZONTAL'; }
  get vertexSource() { return `in vec3 POSITION;
    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {return proj * view * model * vec4(POSITION,1.0);}`; }
  get fragmentSource() { return `vec4 fragment_main() {return ${this.wall ? 'vec4(0.1,0.65,1.0,1.0)' : 'vec4(0.2,1.0,0.35,1.0)'};}`; }
}
class Edge extends Node {
  constructor(wall) { super(); this.wall=wall; }
  onRendererChanged(renderer) {
    const s=new PrimitiveStream(); s.startGeometry();
    s.pushVertex(0,0.012,-0.006); s.pushVertex(1,0.012,-0.006);
    s.pushVertex(1,0.012,0.006); s.pushVertex(0,0.012,0.006);
    s.pushTriangle(0,1,2); s.pushTriangle(0,2,3); s.endGeometry();
    this.addRenderPrimitive(renderer.createRenderPrimitive(s.finishPrimitive(renderer),new SurfaceMaterial(this.wall)));
  }
}
export class SurfaceTools {
  constructor(scene) {
    this.scene=scene; this.planes=new Map(); this.filter='all'; this.enabled=true;
    this.templates=[new Edge(false),new Edge(true)];
    for(const t of this.templates){t.visible=false;scene.addNode(t);}
    this.status=document.querySelector('#scan-status');
    for(const b of document.querySelectorAll('[data-surface]'))b.addEventListener('click',()=>{
      this.filter=b.dataset.surface;
      for(const item of document.querySelectorAll('[data-surface]'))item.setAttribute('aria-pressed',String(item===b));
    });
    document.querySelector('#surface-outlines').addEventListener('change',e=>this.enabled=e.target.checked);
    document.querySelector('#scan-tools').addEventListener('beforexrselect',e=>e.preventDefault());
  }
  remove(item) {for(const edge of item.node.children)edge.clearRenderPrimitives();this.scene.removeNode(item.node);}
  clear() {for(const item of this.planes.values())this.remove(item);this.planes.clear();}
  end() {this.clear();this.status.textContent='AR ended. Start again to scan surfaces.';}
  update(frame,space,tracking,hitMatrix) {
    if(!tracking){for(const item of this.planes.values())item.node.visible=false;this.status.textContent='Tracking paused. Move the phone slowly.';return;}
    const detected=frame.detectedPlanes;
    const counts={horizontal:0,vertical:0,other:0};
    for(const [plane,item] of this.planes)if(!detected?.has(plane)){this.remove(item);this.planes.delete(plane);}
    if(detected)for(const plane of detected){
      const orientation=plane.orientation,kind=orientation==='horizontal'?'horizontal':orientation==='vertical'?'vertical':'other'; counts[kind]++;
      let item=this.planes.get(plane);
      if(!item || item.changed!==plane.lastChangedTime){
        if(item)this.remove(item);
        const node=new Node(),points=plane.polygon;
        // Edge instances share two GPU primitives, even when polygons change.
        for(let i=0;i<points.length;i++){
          const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
          if(length<0.001)continue;
          const edge=new Node();for(const primitive of this.templates[kind==='vertical'?1:0].renderPrimitives)edge.addRenderPrimitive(primitive);
          const m=mat4.create();mat4.translate(m,m,[a.x,0,a.z]);mat4.rotateY(m,m,-Math.atan2(dz,dx));mat4.scale(m,m,[length,1,1]);edge.matrix=m;node.addNode(edge);
        }
        this.scene.addNode(node);item={node,changed:plane.lastChangedTime};this.planes.set(plane,item);
      }
      const pose=frame.getPose(plane.planeSpace,space);
      item.node.visible=!!pose && this.enabled && (this.filter==='all'||this.filter===kind);
      if(pose)item.node.matrix=pose.transform.matrix;
    }
    const target=hitMatrix?classifyNormal(hitMatrix):null;
    const label=target==='horizontal'?'horizontal surface':target==='vertical'?'wall-like surface':target==='sloped'?'sloped surface':'searching';
    this.status.textContent=(detected ? `Mapped: ${counts.horizontal} horizontal · ${counts.vertical} vertical. ` : 'Surface map unavailable; hit target only. ')+`Circle: ${label}.`;
  }
}
