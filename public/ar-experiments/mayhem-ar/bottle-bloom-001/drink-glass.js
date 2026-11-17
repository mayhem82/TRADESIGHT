import * as T from 'three';

export function edgeGlass(material){
 material.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`#include <opaque_fragment>
   float glassEdge = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.0);
   gl_FragColor.a *= mix(0.18, 1.0, glassEdge);`);
 };
 material.customProgramCacheKey=()=> 'mayhem-ar-edge-glass-1';
 return material;
}

// A hollow, tapered tumbler. Its origin is the selected liquid surface.
export class DrinkGlass{
 constructor({height=.14,width=.08,liquid=.095}={}){
  this.root=new T.Group();this.root.name='Transparent drink glass at liquid surface';
  this.preview=new T.MeshPhysicalMaterial({color:0xeaf5ef,transmission:1,thickness:.0022,ior:1.5,roughness:.055,clearcoat:1,envMapIntensity:.75});
  // The phone camera is composited outside the transmission render target.
  // Alpha glass places the front highlights and tint over the shoot in AR.
  this.ar=edgeGlass(new T.MeshPhysicalMaterial({color:0xdcece6,transparent:true,opacity:.35,roughness:.055,clearcoat:1,envMapIntensity:.8,depthWrite:false}));
  this.body=new T.Mesh(undefined,this.preview);this.body.name='Hollow tumbler';this.body.renderOrder=10;
  this.rim=new T.Mesh(undefined,this.preview);this.rim.name='Open glass rim';this.rim.rotation.x=Math.PI/2;this.rim.renderOrder=11;
  this.liquid=new T.Mesh(undefined,new T.MeshPhysicalMaterial({color:0x321509,roughness:.16,transmission:.08,thickness:.07,ior:1.33}));this.liquid.name='Preview drink';
  this.root.add(this.body,this.rim,this.liquid);this.setDimensions(height,width,liquid);
 }
 setDimensions(height,width,liquid){
  this.height=height;this.width=width;this.level=liquid;
  const r=width/2,base=r*.73,wall=.0022;
  const points=[[0,0],[base-.003,0],[base,.003],[base+.001,height*.18],[r*.97,height*.72],[r,height*.94],[r,height],[r-wall,height],[r-wall,height*.94],[r*.97-wall,height*.72],[base-wall,height*.18],[base-wall,.005],[0,.005]].map(p=>new T.Vector2(...p));
  for(const mesh of [this.body,this.rim,this.liquid])mesh.geometry?.dispose();
  this.body.geometry=new T.LatheGeometry(points,80);this.body.position.y=-liquid;
  this.rim.geometry=new T.TorusGeometry(r-wall/2,wall/2,8,80);this.rim.position.y=height-liquid;
  const fillRadius=base+(r-base)*liquid/height-wall;
  this.liquid.geometry=new T.CylinderGeometry(fillRadius,base-wall,Math.max(.001,liquid-.005),80);
  this.liquid.position.y=-(liquid-.005)/2;
 }
 setAR(active){this.body.material=this.rim.material=active?this.ar:this.preview;this.liquid.visible=!active;}
}
