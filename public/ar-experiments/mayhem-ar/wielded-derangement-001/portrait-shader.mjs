// Native renderer companion shader. Photograph RGB is sRGB; alpha is linear.
export const PORTRAIT_FRAGMENT=`
uniform sampler2D baseColorTex;
uniform float modelOpacity;
uniform float modelExposure;
in vec2 vTex;
in vec3 vNorm;
in vec3 vLight;
vec3 fromSRGB(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
vec3 toSRGB(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-.055,step(vec3(.0031308),c));}
vec4 fragment_main(){
 vec4 photo=texture(baseColorTex,vTex);float alpha=photo.a*modelOpacity;
 if(alpha<.008)discard;
 float light=.68+.32*abs(dot(normalize(vNorm),normalize(vLight)));
 vec3 color=toSRGB(fromSRGB(photo.rgb)*light*modelExposure);
 return vec4(color,alpha);
}`;
