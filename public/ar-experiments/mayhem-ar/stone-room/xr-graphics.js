import * as THREE from './vendor/three.module.js';

// Temporary, opt-in diagnostic. No pixels are read and no framebuffer is rebound.
export const PROBE_BOUNDS={left:-.9,right:-.65,bottom:.65,top:.9};
export function createXRGraphics(renderer,scene){
 const geometry=new THREE.PlaneGeometry(.25,.25);
 geometry.translate(-.775,.775,0);
 const material=new THREE.ShaderMaterial({
  vertexShader:'void main(){gl_Position=vec4(position.xy,0.0,1.0);}',
  fragmentShader:'void main(){gl_FragColor=vec4(1.0,0.0,1.0,1.0);}',
  depthTest:false,depthWrite:false,transparent:true,blending:THREE.NoBlending,
  side:THREE.DoubleSide,toneMapped:false
 });
 const probe=new THREE.Mesh(geometry,material);
 probe.name='Temporary XR graphics probe';probe.visible=false;
 probe.frustumCulled=false;probe.renderOrder=1e9;scene.add(probe);
 let frame=0,sample=false,disposed=false;
 const initial=()=>({layer:'unknown',samples:0,fbo:'unmeasured',errors:[],viewport:[],framebufferBound:false,baseFramebufferMatches:null,probeEnabled:false,probeDraws:0,probeFrameDraws:0,probeFbo:'unmeasured',probeErrors:[],sampledFrame:0});
 let stats=initial();
 function errors(gl){
  const result=[];
  // getError consumes flags; the cap also prevents a broken driver from looping.
  for(let i=0;i<8;i++){const code=gl.getError();if(code===gl.NO_ERROR)break;result.push('0x'+code.toString(16));}
  return result;
 }
 function inspect(){
  const gl=renderer.getContext(),status=gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  const bound=gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const layer=renderer.xr?.getBaseLayer?.();
  const target=renderer.getRenderTarget();
  return {layer:layer?(('framebuffer' in layer)?'webgl':'projection'):'none',samples:target?.samples??0,
   fbo:status===gl.FRAMEBUFFER_COMPLETE?'complete':'0x'+status.toString(16),
   errors:errors(gl),viewport:Array.from(gl.getParameter(gl.VIEWPORT)??[]),framebufferBound:bound!==null,
   baseFramebufferMatches:layer&&'framebuffer' in layer?bound===layer.framebuffer:null};
 }
 probe.onAfterRender=()=>{
  stats.probeDraws++;stats.probeFrameDraws++;
  if(sample)try{const result=inspect();stats.probeFbo=result.fbo;stats.probeErrors=result.errors;}
  catch(e){stats.probeFbo='query failed';stats.probeErrors=[String(e.message||e)];}
 };
 return {
  beforeFrame(enabled=false){
   if(disposed)return;
   frame++;sample=frame===1||frame%30===0;
   probe.visible=!!enabled;stats.probeEnabled=probe.visible;stats.probeFrameDraws=0;
  },
  afterFrame(frameCount=frame){
   if(!disposed&&sample){
    try{Object.assign(stats,inspect());}catch(e){stats.fbo='query failed';stats.errors=[String(e.message||e)];}
    stats.sampledFrame=frameCount;sample=false;
   }
   return {...stats,errors:[...stats.errors],probeErrors:[...stats.probeErrors],viewport:[...stats.viewport]};
  },
  reset(){if(disposed)return;frame=0;sample=false;stats=initial();probe.visible=false;},
  dispose(){if(disposed)return;disposed=true;scene.remove(probe);geometry.dispose();material.dispose();}
 };
}
