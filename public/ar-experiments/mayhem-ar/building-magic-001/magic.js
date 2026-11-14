import {Material,RENDER_ORDER} from '../ar-colour-vision-001/vendor/js/render/core/material.js';
import {Node} from '../ar-colour-vision-001/vendor/js/render/core/node.js';
import {PrimitiveStream} from '../ar-colour-vision-001/vendor/js/render/geometry/primitive-stream.js';
class MagicMaterial extends Material{
 constructor(kind){super();this.state.cullFace=false;this.state.blend=kind===1;this.state.depthMask=kind!==1;this.renderOrder=kind===1?RENDER_ORDER.TRANSPARENT:RENDER_ORDER.DEFAULT;this.defineUniform('clock',0);this.defineUniform('power',0);this.defineUniform('kind',kind);}
 get materialName(){return 'MAYHEM_BUILDING_MAGIC';}
 get vertexSource(){return `in vec3 POSITION;in vec2 TEXCOORD_0;out vec2 vUV;vec4 vertex_main(mat4 proj,mat4 view,mat4 model){vUV=TEXCOORD_0;return proj*view*model*vec4(POSITION,1.0);}`;}
 get fragmentSource(){return `in vec2 vUV;uniform float clock;uniform float power;uniform float kind;vec4 fragment_main(){vec2 q=vUV*2.0-1.0;float r=length(q),a=atan(q.y,q.x);vec3 teal=vec3(.04,.95,.7),violet=vec3(.55,.14,1.0);float wave=.5+.5*sin(15.0*r-3.0*a-clock*2.0);vec3 c=mix(teal,violet,wave);if(kind<.5){float tunnel=pow(max(0.0,1.0-r*.65),1.7);return vec4(c*(.05+power*(.18+.65*wave))*tunnel+vec3(.003,.008,.018),1.0);}vec2 p=vUV;float line=abs(sin(p.x*49.0+sin(p.y*18.0+clock)*.7));float crack=pow(max(0.0,1.0-line),22.0);vec2 cell=fract(p*vec2(13.0,8.0)+vec2(0.0,clock*.05))-.5;float spark=pow(max(0.0,1.0-length(cell)*5.0),8.0);float pulse=.65+.35*sin(clock*2.0);float alpha=power*clamp(crack*.6+spark*.9,0.0,.85)*pulse;return vec4(c*1.2,alpha);}`;}
}
export class MagicSurface extends Node{
 constructor(width,height,kind=0){super();this.width=width;this.height=height;this.kind=kind;}
 onRendererChanged(renderer){const s=new PrimitiveStream();s.startGeometry();for(const [x,y,u,v] of [[-.5,0,0,0],[.5,0,1,0],[.5,1,1,1],[-.5,1,0,1]])s.pushVertex(x*this.width,y*this.height,0,u,v,0,0,1);s.pushTriangle(0,1,2);s.pushTriangle(0,2,3);s.endGeometry();this.primitive=renderer.createRenderPrimitive(s.finishPrimitive(renderer),new MagicMaterial(this.kind));this.addRenderPrimitive(this.primitive);}
 update(time,power){this.visible=power>.001;if(this.primitive){this.primitive.uniforms.clock.value=time;this.primitive.uniforms.power.value=power;}}
}
