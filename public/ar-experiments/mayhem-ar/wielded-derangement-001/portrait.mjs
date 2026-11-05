import {Renderer} from './vendor/js/render/core/renderer.js';
import {PbrMaterial} from './vendor/js/render/materials/pbr.js';
import {PORTRAIT_FRAGMENT} from './portrait-shader.mjs';
export class PortraitMaterial extends PbrMaterial {
 constructor(texture){super();this.baseColor.texture=texture;this.state.blend=true;this.state.depthMask=false;this.state.cullFace=false;texture.mipmap=false;texture.sampler.minFilter=9729;texture.sampler.magFilter=9729;texture.sampler.wrapS=33071;texture.sampler.wrapT=33071;}
 get materialName(){return 'WieldedPhotoRelief';}
 get fragmentSource(){return PORTRAIT_FRAGMENT;}
}
export class PortraitRenderer extends Renderer {
 createRenderPrimitive(primitive,material){
  const texture=material?.baseColor?.texture;
  if(texture&&/frontal-head\.png(?:$|\?)/.test(texture.textureKey||''))material=new PortraitMaterial(texture);
  const rendered=super.createRenderPrimitive(primitive,material);
  rendered.originalEmission=Array.from(material.emissiveFactor?.value||[0,0,0]);
  return rendered;
 }
}
