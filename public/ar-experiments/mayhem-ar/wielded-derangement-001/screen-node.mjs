import {Node} from './vendor/js/render/core/node.js';
import {Primitive,PrimitiveAttribute} from './vendor/js/render/core/primitive.js';
import {Material} from './vendor/js/render/core/material.js';
import {SCREEN_VERTEX,SCREEN_FRAGMENT} from './screen-shaders.mjs';
export const SCREEN_VERTICES=new Float32Array([
 -.5,-.28125,0,0,0, .5,-.28125,0,1,0, .5,.28125,0,1,1,
 -.5,-.28125,0,0,0, .5,.28125,0,1,1, -.5,.28125,0,0,1
]);
export class ScreenMaterial extends Material {
 constructor(){super();this.state.blend=true;this.state.depthMask=false;this.state.cullFace=false;this.defineUniform('loopPhase',0);this.defineUniform('screenKind',0);this.defineUniform('modelOpacity',0);this.defineUniform('modelExposure',1);}
 get materialName(){return 'WieldedProceduralAnimationScreen';}
 get vertexSource(){return SCREEN_VERTEX;}
 get fragmentSource(){return SCREEN_FRAGMENT;}
}
const geometry=new WeakMap();
export class AnimationScreen extends Node {
 constructor(){super();this.visible=false;this.primitive=null;}
 onRendererChanged(renderer){let shape=geometry.get(renderer);if(!shape){const buffer=renderer.createRenderBuffer(34962,SCREEN_VERTICES);shape=new Primitive([new PrimitiveAttribute('POSITION',buffer,3,5126,20,0),new PrimitiveAttribute('TEXCOORD_0',buffer,2,5126,20,12)],6,4);shape.setBounds([-.5,-.28125,0],[.5,.28125,0]);geometry.set(renderer,shape);}this.primitive=renderer.createRenderPrimitive(shape,new ScreenMaterial());this.addRenderPrimitive(this.primitive);}
 update(plan,enabled){this.visible=!!plan&&enabled&&plan.opacity>.01;if(!plan||!this.primitive)return;this.matrix=plan.matrix;this.primitive.uniforms.loopPhase.value=plan.phase;this.primitive.uniforms.screenKind.value=plan.kind;this.primitive.uniforms.modelOpacity.value=plan.opacity;}
}
