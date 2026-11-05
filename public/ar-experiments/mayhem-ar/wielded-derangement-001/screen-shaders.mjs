export const SCREEN_VERTEX=`
in vec3 POSITION;
in vec2 TEXCOORD_0;
out vec2 screenUV;
vec4 vertex_main(mat4 proj,mat4 view,mat4 model){screenUV=TEXCOORD_0;return proj*view*model*vec4(POSITION,1.0);}
`;
// Three original analytic loops. No footage, image/video files, remote service
// or frame uploads. Integer-cycle harmonics give exact eight-second loops.
export const SCREEN_FRAGMENT=`
uniform float loopPhase;
uniform float screenKind;
uniform float modelOpacity;
uniform float modelExposure;
in vec2 screenUV;
const float TAU=6.28318530718;
float line(float d,float width){return 1.0-smoothstep(width,width+max(fwidth(d)*1.3,.001),abs(d));}
float boxShape(vec2 p,vec2 h){vec2 d=abs(p)-h;return 1.0-smoothstep(0.0,max(fwidth(d.x)+fwidth(d.y),.0015),max(d.x,d.y));}
mat2 rotate2(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float gear(vec2 p,float radius,float teeth,float spin){
 float angle=atan(p.y,p.x+.000001)+spin,edge=radius*(.90+.10*step(.05,cos(angle*teeth)));
 float rim=line(length(p)-edge,.014)+line(length(p)-radius*.58,.012);
 float spoke=line(sin(angle*3.0)*length(p),.011)*(1.0-step(radius*.83,length(p)));
 return clamp(rim+spoke+boxShape(p,vec2(.024)),0.0,1.0);
}
vec3 clockwork(vec2 p,float t){
 float g=gear(p-vec2(-.40,.06),.20,16.0,t*3.0)+gear(p-vec2(-.04,-.05),.15,12.0,-t*4.0)+gear(p-vec2(.27,.10),.18,14.0,t*3.0);
 float stroke=.10*sin(t*3.0);float piston=boxShape(p-vec2(.57,-.02+stroke),vec2(.075,.12));
 float guides=line(p.x-.47,.006)+line(p.x-.67,.006);guides*=1.0-step(.26,abs(p.y));
 float track=line(p.y+.30,.006)+line(p.y-.30,.006);
 return vec3(.035,.075,.08)+vec3(.89,.57,.22)*clamp(g+piston*.7+guides*.45+track*.22,0.0,1.0);
}
vec3 weave(vec2 p,float t){
 float field=0.0;for(int i=0;i<7;i++){float k=float(i)-3.0;float y=k*.075+.055*sin(p.x*5.0+t*2.0+k*.7)+.025*cos(p.x*11.0-t*3.0);field+=line(p.y-y,.0045);}
 float lattice=line(sin(p.x*18.0+t)*sin(p.y*21.0-t),.026)*.28;
 float pulse=exp(-28.0*pow(p.x-.5*sin(t),2.0));
 vec3 color=mix(vec3(.10,.42,.44),vec3(.90,.70,.38),.5+.5*sin(t+p.x*3.0));
 return vec3(.025,.07,.08)+color*clamp(field*.8+lattice+pulse*.08,0.0,1.0);
}
vec3 loading(vec2 p,float t){
 float ink=0.0,edges=0.0;for(int i=0;i<6;i++){float k=float(i);float x=(fract(k/6.0+t/TAU)-.5)*1.8;vec2 q=p-vec2(x,-.12+.025*sin(t*2.0+k));float card=boxShape(q,vec2(.095,.12));edges+=card*.24;ink+=card*(line(q.y+.06,.003)+line(q.y+.015,.003)+line(q.y-.03,.003))*step(-.065,q.x)*step(q.x,.065);}
 float down=.17-.17*pow(.5+.5*cos(t*3.0),3.0);float stamp=boxShape(p-vec2(0.0,.18+down),vec2(.12,.055));float shaft=boxShape(p-vec2(0.0,.34),vec2(.022,.10));float belt=line(p.y+.28,.009)*(1.0-step(.82,abs(p.x)));
 return vec3(.04,.07,.075)+vec3(.92,.70,.37)*clamp(edges+ink*.65+stamp*.8+shaft*.6+belt*.7,0.0,1.0);
}
vec4 fragment_main(){
 if(modelOpacity<.008)discard;
 vec2 p=(screenUV-.5)*vec2(1.7777778,1.0);float edge=min(min(screenUV.x,1.0-screenUV.x),min(screenUV.y,1.0-screenUV.y));
 vec3 color;
 if(!gl_FrontFacing)color=vec3(.055,.09,.095);
 else if(screenKind<.5)color=clockwork(p,loopPhase*TAU);
 else if(screenKind<1.5)color=weave(p,loopPhase*TAU);
 else color=loading(p,loopPhase*TAU);
 float frame=1.0-smoothstep(.018,.024,edge);color=mix(color,vec3(.35,.26,.14),frame);
 float corner=(step(abs(p.x),.85)*step(.80,abs(p.x))+step(abs(p.y),.46)*step(.41,abs(p.y)))*frame;
 color+=vec3(.28,.17,.04)*corner;
 return vec4(color*modelExposure,modelOpacity);
}`;
