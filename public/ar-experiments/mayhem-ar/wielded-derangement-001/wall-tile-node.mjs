import {Node} from './vendor/js/render/core/node.js';
import {Primitive,PrimitiveAttribute} from './vendor/js/render/core/primitive.js';
import {Material,RENDER_ORDER} from './vendor/js/render/core/material.js';
import {WALL_TILE_VERTEX,WALL_TILE_FRAGMENT} from './wall-tile-shaders.mjs';
export const WALL_TILE_VERTICES=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,-.5,0,0,0,.5,.5,0,1,1,-.5,.5,0,0,1]);
export class WallTileMaterial extends Material {
 constructor(textures){super();this.state.blend=true;this.state.depthMask=false;this.state.cullFace=false;
  // After opaque mechanisms, before transparent portraits: tiles behind the
  // central machine cannot paint over its face reliefs.
  this.renderOrder=RENDER_ORDER.SKY;
  textures.forEach((texture,i)=>this.defineSampler('media'+i).texture=texture);
  this.defineUniform('loopPhase',0);this.defineUniform('modelExposure',1);this.defineUniform('tileReady',[0,0,0,0]);this.defineUniform('tileGates',[0,0,0,0]);this.defineUniform('tileShift',0);
 }
 get materialName(){return 'WieldedSharedWallTiles012';}
 get vertexSource(){return WALL_TILE_VERTEX;}
 get fragmentSource(){return WALL_TILE_FRAGMENT;}
}
const geometry=new WeakMap();
export class WallTilePanel extends Node {
 constructor(textures){super();this.textures=textures;this.visible=false;this.primitive=null;}
 onRendererChanged(renderer){let shape=geometry.get(renderer);if(!shape){const buffer=renderer.createRenderBuffer(34962,WALL_TILE_VERTICES);shape=new Primitive([new PrimitiveAttribute('POSITION',buffer,3,5126,20,0),new PrimitiveAttribute('TEXCOORD_0',buffer,2,5126,20,12)],6,4);shape.setBounds([-.5,-.5,0],[.5,.5,0]);geometry.set(renderer,shape);}this.primitive=renderer.createRenderPrimitive(shape,new WallTileMaterial(this.textures));this.addRenderPrimitive(this.primitive);}
 update(plan,enabled){this.visible=enabled&&!!plan&&plan.gates.some(g=>g>.01);if(!plan||!this.primitive)return;this.matrix=plan.matrix;const uniforms=this.primitive.uniforms;uniforms.loopPhase.value=plan.phase;uniforms.tileShift.value=plan.shift;uniforms.tileGates.value=plan.gates;uniforms.tileReady.value=this.textures.map(t=>t.playback.ready?1:0);}
}
