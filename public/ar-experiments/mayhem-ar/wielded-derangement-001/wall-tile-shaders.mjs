import {SCREEN_FRAGMENT} from './screen-shaders.mjs?v=recovered-clips-011';
export const WALL_TILE_VERTEX=`
in vec3 POSITION;in vec2 TEXCOORD_0;out vec2 screenUV;
vec4 vertex_main(mat4 proj,mat4 view,mat4 model){screenUV=TEXCOORD_0;return proj*view*model*vec4(POSITION,1.0);}`;
// Retain the original procedural functions as a decode-independent fallback.
export const WALL_TILE_FRAGMENT=SCREEN_FRAGMENT.slice(0,SCREEN_FRAGMENT.indexOf('vec4 fragment_main(){'))+`
uniform sampler2D media0;uniform sampler2D media1;uniform sampler2D media2;uniform sampler2D media3;
uniform vec4 tileReady;uniform vec4 tileGates;uniform float tileShift;
vec4 fragment_main(){
 vec2 grid=screenUV*2.0,uv=fract(grid);float cell=floor(grid.x)+floor(grid.y)*2.0,kind=mod(cell+tileShift,4.0);
 if(!gl_FrontFacing)uv.x=1.0-uv.x;
 float gate=kind<.5?tileGates.x:kind<1.5?tileGates.y:kind<2.5?tileGates.z:tileGates.w;
 if(gate<.008)discard;
 float ready=kind<.5?tileReady.x:kind<1.5?tileReady.y:kind<2.5?tileReady.z:tileReady.w;
 vec3 color;
 vec2 p=(uv-.5)*vec2(1.3333333,1.0);
 if(ready<.5){if(kind<.5)color=clockwork(p,loopPhase*TAU);
 else if(kind<1.5)color=weave(p,loopPhase*TAU);
 else if(kind<2.5)color=loading(p,loopPhase*TAU);
 else color=mix(clockwork(p,loopPhase*TAU),weave(p,-loopPhase*TAU),.5)*vec3(1.15,.8,.65);}
 else{vec2 videoUV=vec2(uv.x,(1.0-uv.y-.125)/.75); // fit 4:3 into square cells
  if(uv.y<.125||uv.y>.875)color=vec3(.012,.018,.02);
  else{
   if(kind<.5)color=texture(media0,videoUV).rgb;
   else if(kind<1.5)color=texture(media1,videoUV).rgb;
   else if(kind<2.5)color=texture(media2,videoUV).rgb;
   else color=texture(media3,videoUV).rgb;}}
 float edge=min(min(uv.x,1.0-uv.x),min(uv.y,1.0-uv.y));
 color=mix(color,vec3(.40,.28,.13),1.0-smoothstep(.025,.04,edge));
 return vec4(color*modelExposure,gate*.94);
}`;
