import * as T from 'three';
import {CULTIVARS,sampleCultivar,branchGrowth} from './cultivars.js?v=cannabis-1';
import {smooth,clamp} from './growth.js';
let atlas,flowerAtlas,normalMap,roughnessMap;
const UP=new T.Vector3(0,1,0),tmp=new T.Object3D(),v1=new T.Vector3(),v2=new T.Vector3(),v3=new T.Vector3(),quaternion=new T.Quaternion(),matrix=new T.Matrix4();
const rand=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export async function loadBotanicalTextures(renderer){
 [atlas,flowerAtlas]=await Promise.all(['assets/botanical-atlas.png','assets/flower-detail.png'].map(url=>new T.TextureLoader().loadAsync(url)));for(const texture of [atlas,flowerAtlas]){texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
 // Derive lighting data from the original generated albedo. These are surface data,
 // not extra painted shadows; the scene lights remain responsive in live AR.
 const canvas=document.createElement('canvas');canvas.width=atlas.image.width;canvas.height=atlas.image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(atlas.image,0,0);
 const {width:w,height:h}=canvas,rgba=ctx.getImageData(0,0,w,h).data,gray=new Float32Array(w*h),normal=new Uint8Array(w*h*4),rough=new Uint8Array(w*h*4);
 for(let i=0;i<gray.length;i++)gray[i]=(rgba[i*4]*.24+rgba[i*4+1]*.63+rgba[i*4+2]*.13)/255;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,q=i*4,left=x%Math.floor(w/2)===0?x:x-1,right=x===w-1||x===Math.floor(w/2)-1?x:x+1;
  const dx=(gray[y*w+right]-gray[y*w+left])*2.4,dy=(gray[Math.min(h-1,y+1)*w+x]-gray[Math.max(0,y-1)*w+x])*2.4,n=Math.sqrt(dx*dx+dy*dy+1);
  normal[q]=Math.round((-dx/n*.5+.5)*255);normal[q+1]=Math.round((dy/n*.5+.5)*255);normal[q+2]=Math.round((1/n*.5+.5)*255);normal[q+3]=255;
  const r=Math.round((y<h/2?.64+.18*(1-gray[i]):.54+.24*(1-gray[i]))*255);rough[q]=rough[q+1]=rough[q+2]=r;rough[q+3]=255;
 }
 normalMap=new T.DataTexture(normal,w,h);normalMap.flipY=true;normalMap.needsUpdate=true;normalMap.generateMipmaps=true;normalMap.minFilter=T.LinearMipmapLinearFilter;normalMap.magFilter=T.LinearFilter;
 roughnessMap=new T.DataTexture(rough,w,h);roughnessMap.flipY=true;roughnessMap.needsUpdate=true;roughnessMap.generateMipmaps=true;roughnessMap.minFilter=T.LinearMipmapLinearFilter;roughnessMap.magFilter=T.LinearFilter;
 return atlas;
}
function botanicalMaterial(kind){
 const leaf=kind==='leaf',detail=kind==='flower',m=new T.MeshPhysicalMaterial({map:detail?flowerAtlas:atlas,normalMap:detail?null:normalMap,normalScale:new T.Vector2(leaf?.3:.15,leaf?.3:.15),roughnessMap:detail?null:roughnessMap,roughness:detail?.95:1,metalness:0,side:leaf||detail?T.DoubleSide:T.FrontSide,alphaTest:detail?.42:0,alphaToCoverage:detail,clearcoat:leaf?.045:.025,clearcoatRoughness:.65,sheen:leaf?.28:.18,sheenColor:new T.Color(leaf?0x93ad5c:0xb2b891),sheenRoughness:.8});
 const purple={value:0};m.userData.purple=purple;
 m.onBeforeCompile=shader=>{
  shader.uniforms.uPurple=purple;shader.fragmentShader='uniform float uPurple;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec4 scanned = texture2D(map, vMapUv);
   vec4 pigmented = texture2D(map, vMapUv + vec2(0.5,0.0));
   ${kind!=='bud'?'':'float tissueLight = dot(pigmented.rgb,vec3(0.25,0.6,0.15)); pigmented.rgb = mix(pigmented.rgb,tissueLight*vec3(1.25,0.48,1.32),0.65);'}
   diffuseColor *= mix(scanned,pigmented,uPurple);
   ${leaf?'if(!gl_FrontFacing) diffuseColor.rgb *= vec3(1.08,1.12,0.96);':''}
   #endif`);
  if(leaf||detail)shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight += diffuseColor.rgb * 0.12;\n#include <opaque_fragment>');
 };
 m.customProgramCacheKey=()=>kind+'-pigment-v1';return m;
}
function leafletGeometry(){
 const positions=[],uvs=[],indices=[],normals=[],rows=16;
 for(let row=0;row<=rows;row++){
  const t=row/rows,outline=Math.pow(Math.sin(Math.PI*t),.78)*(row%2===0?1:.80)*.14;
  for(let col=-1;col<=1;col++){
   const x=outline*col,z=.018*Math.sin(Math.PI*t)*(1-Math.abs(col))-.075*t*t+.014*Math.sin(t*8)*Math.abs(col);
   positions.push(x,t,z);uvs.push(.004+(col+1)/2*.492,.504+t*.492);normals.push(0,.13,1);
  }
 }
 for(let row=0;row<rows;row++)for(let col=0;col<2;col++){const a=row*3+col,b=a+3;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function budGeometry(){const g=new T.SphereGeometry(1,8,4),uv=g.attributes.uv,position=g.attributes.position;for(let i=0;i<uv.count;i++){uv.setXY(i,.18+uv.getX(i)*.10,.17+uv.getY(i)*.10);const taper=1-position.getY(i)*.05;position.setX(i,position.getX(i)*taper);position.setZ(i,position.getZ(i)*taper);}g.computeVertexNormals();return g;}
function stemGeometry(count){
 const rings=9,sides=7,positions=new Float32Array(count*rings*(sides+1)*3),uvs=[],indices=[];
 for(let b=0;b<count;b++)for(let r=0;r<rings;r++)for(let s=0;s<=sides;s++){
  uvs.push(s/sides,r/(rings-1));if(r<rings-1&&s<sides){const a=b*rings*(sides+1)+r*(sides+1)+s,c=a+sides+1;indices.push(a,c,a+1,c,c+1,a+1);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);return g;
}
export class CannabisPlant{
 constructor(id){
  this.profile=CULTIVARS[id];this.id=id;this.root=new T.Group();this.root.name=this.profile.name;this.visual=new T.Group();this.root.add(this.visual);this.lastProgress=-1;this.leafMotion={enabled:true,strength:.65,speed:1};
  this.guide=new T.Mesh(new T.RingGeometry(.035,.037,48),new T.MeshBasicMaterial({color:0xd9edab,side:T.DoubleSide,depthTest:false}));this.guide.rotation.x=-Math.PI/2;this.guide.visible=false;this.root.add(this.guide);
  this.leafMaterial=botanicalMaterial('leaf');this.budMaterial=botanicalMaterial('bud');this.flowerMaterial=botanicalMaterial('flower');this.stemMaterial=new T.MeshStandardMaterial({color:0x6d8550,roughness:.88});
  this.pistilMaterial=new T.LineBasicMaterial({color:0xe1dbb1});this.trichomeMaterial=new T.PointsMaterial({color:0xdce3c4,size:.0012,sizeAttenuation:true});
  this.branches=[{parent:-1,attach:0,birth:0,finish:0,angle:0,reach:0,end:1},...this.profile.branches];
  this.stem=new T.Mesh(stemGeometry(this.branches.length),this.stemMaterial);this.stem.frustumCulled=false;this.visual.add(this.stem);
  this.leaves=[];this.clusters=[];
  // The early pairs and later node sequence are explicit, deterministic organs.
  for(let n=0;n<9;n++)for(let side=0;side<2;side++)this.leaves.push({branch:0,t:.065+n*.097,birth:n===0?-.05:.025+n*.035,finish:.13+n*.041,angle:n*Math.PI*.53+side*Math.PI,length:n===0?.035:Math.sin((n+1)/11*Math.PI)*this.profile.leafLength,leaflets:n===0?1:n===1?3:n===2?5:7,old:n<4,seed:n*2+side});
  this.branches.forEach((b,i)=>{
   if(!i)return;const secondary=b.parent>0;
   for(let n=0;n<(secondary?1:3);n++)this.leaves.push({branch:i,t:secondary?.68:.28+n*.28,birth:b.birth+.025+n*.055,finish:b.birth+.15+n*.065,angle:b.angle+(n%2?-.55:.45),length:this.profile.leafLength*(secondary?.5:.86-n*.13),leaflets:secondary?5:7,old:false,seed:i*17+n});
   this.clusters.push({branch:i,t:1,birth:this.profile.flowerStart+(secondary?.065:0)+rand(i)*.045,length:this.profile.colaLength*(secondary?.42:.66+rand(i)*.25),seed:i});
   if(!secondary&&i%2===0)this.clusters.push({branch:i,t:.72,birth:this.profile.flowerStart+.06,length:this.profile.colaLength*.36,seed:i+80});
  });
  this.clusters.push({branch:0,t:1,birth:this.profile.flowerStart-.015,length:this.profile.colaLength,seed:101});
  for(let i=0;i<3;i++)this.clusters.push({branch:0,t:.71+i*.07,birth:this.profile.flowerStart+.05+i*.015,length:this.profile.colaLength*.34,seed:120+i});
  this.clusters.forEach((c,index)=>{for(let j=0;j<3;j++)this.leaves.push({branch:c.branch,t:c.t,flowerCluster:index,clusterHeight:.16+j*.25,birth:c.birth+.025,finish:c.birth+.30,angle:c.seed*.83+j*2.399,length:c.length*(.30-j*.035),leaflets:1,old:false,seed:400+index*3+j});});
  const leafCount=this.leaves.reduce((n,l)=>n+l.leaflets,0);
  this.leaflets=new T.InstancedMesh(leafletGeometry(),this.leafMaterial,leafCount);this.leaflets.instanceMatrix.setUsage(T.DynamicDrawUsage);this.leaflets.frustumCulled=false;this.visual.add(this.leaflets);
  this.petiole=new T.InstancedMesh(new T.CylinderGeometry(1,1,1,5,1,true),this.stemMaterial,this.leaves.length);this.petiole.instanceMatrix.setUsage(T.DynamicDrawUsage);this.petiole.frustumCulled=false;this.visual.add(this.petiole);
  this.bractCount=30;this.bracts=new T.InstancedMesh(budGeometry(),this.budMaterial,this.clusters.length*this.bractCount);this.bracts.instanceMatrix.setUsage(T.DynamicDrawUsage);this.bracts.frustumCulled=false;this.visual.add(this.bracts);
  const flowerGeometry=new T.PlaneGeometry(1,1),flowerUV=flowerGeometry.attributes.uv;for(let i=0;i<flowerUV.count;i++)flowerUV.setX(i,.002+flowerUV.getX(i)*.496);
  this.flowerDetails=new T.InstancedMesh(flowerGeometry,this.flowerMaterial,this.clusters.length*4);this.flowerDetails.instanceMatrix.setUsage(T.DynamicDrawUsage);this.flowerDetails.frustumCulled=false;this.visual.add(this.flowerDetails);
  this.hairCount=18;this.hairSegments=3;
  this.hairPositions=new Float32Array(this.clusters.length*this.hairCount*this.hairSegments*2*3);const hairG=new T.BufferGeometry();hairG.setAttribute('position',new T.BufferAttribute(this.hairPositions,3).setUsage(T.DynamicDrawUsage));
  this.pistils=new T.LineSegments(hairG,this.pistilMaterial);this.pistils.frustumCulled=false;this.visual.add(this.pistils);
  this.dotPositions=new Float32Array(this.clusters.length*this.bractCount*3*3);this.dotVisibility=new Float32Array(this.clusters.length*this.bractCount*3);const dotG=new T.BufferGeometry();dotG.setAttribute('position',new T.BufferAttribute(this.dotPositions,3).setUsage(T.DynamicDrawUsage));dotG.setAttribute('organVisibility',new T.BufferAttribute(this.dotVisibility,1).setUsage(T.DynamicDrawUsage));
  this.trichomeMaterial.onBeforeCompile=shader=>{shader.vertexShader='attribute float organVisibility; varying float vOrganVisibility;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOrganVisibility=organVisibility;');shader.fragmentShader='varying float vOrganVisibility;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vOrganVisibility<0.02)discard;');};
  this.trichomes=new T.Points(dotG,this.trichomeMaterial);this.trichomes.frustumCulled=false;this.visual.add(this.trichomes);
  this.materials=[this.leafMaterial,this.budMaterial,this.flowerMaterial,this.stemMaterial,this.pistilMaterial,this.trichomeMaterial];this.state={};this.update(0);
 }
 point(index,t,out){
  const b=this.branches[index],h=this.sample.height*(1-this.profile.colaLength*.83/this.profile.height);
  if(index===0)return out.set(Math.sin(t*4.4)*.009*h,h*t,Math.sin(t*3.1)*.006*h);
  const base=this.nodePoint(b.parent,b.attach,new T.Vector3()),g=branchGrowth(b,this.sample.progress),rise=h*(b.end-b.attach)*(b.parent===0?1:.35)*g;
  const reach=this.profile.width*b.reach*this.sample.spread*g,arc=Math.sin(t*Math.PI/2),bend=arc*.94+.06*t;
  return out.set(base.x+Math.sin(b.angle)*reach*bend,base.y+rise*(t*.65+t*t*.35),base.z+Math.cos(b.angle)*reach*bend);
 }
 nodePoint(index,t,out){return this.point(index,index===0?Math.min(.98,t*this.profile.height/this.sample.height):t,out);}
 update(progress){
  progress=clamp(progress);if(progress===this.lastProgress)return;this.lastProgress=progress;this.sample=sampleCultivar(this.id,progress);
  const p=this.sample,stemPositions=this.stem.geometry.attributes.position,cycle=Math.sin(progress*Math.PI*8*this.leafMotion.speed-Math.PI/2),cycleAmount=this.leafMotion.enabled?this.leafMotion.strength:0;
  for(let i=0;i<this.branches.length;i++){
   const b=this.branches[i],growth=i===0?1:branchGrowth(b,progress),radius=(i===0?.0062:b.parent===0?.0032:.0016)*Math.max(.12,p.height/this.profile.height)*Math.sqrt(growth);
   for(let r=0;r<9;r++){
    const t=r/8,centre=this.point(i,t,v1),ahead=this.point(i,Math.min(1,t+.005),v2);if(t===1)ahead.sub(this.point(i,t-.005,v3)).add(centre);
    const tangent=ahead.sub(centre).normalize(),right=new T.Vector3().crossVectors(tangent,new T.Vector3(0,0,1)).normalize();if(right.lengthSq()<.001)right.set(1,0,0);const normal=new T.Vector3().crossVectors(right,tangent).normalize();
    for(let s=0;s<=7;s++){const a=s/7*Math.PI*2,rad=radius*(1-t*.77),v=centre.clone().addScaledVector(right,Math.cos(a)*rad).addScaledVector(normal,Math.sin(a)*rad);stemPositions.setXYZ((i*9+r)*8+s,v.x,v.y,v.z);}
   }
  }
  stemPositions.needsUpdate=true;this.stem.geometry.computeVertexNormals();
  let instance=0,visibleLeaves=0;
  this.leaves.forEach((leaf,index)=>{
   const growth=smooth(leaf.birth,leaf.finish,progress),parent=leaf.branch===0?1:branchGrowth(this.branches[leaf.branch],progress),g=growth*parent;
   if(g>.1)visibleLeaves++;const anchor=this.nodePoint(leaf.branch,leaf.t,new T.Vector3()),angle=leaf.angle,petioleLength=leaf.length*.25*g;
   if(leaf.flowerCluster!==undefined){const c=this.clusters[leaf.flowerCluster],cg=smooth(c.birth,Math.min(.98,c.birth+.38),progress);anchor.y+=c.length*cg*parent*(leaf.clusterHeight-.12);}
   const daily=cycle*.42*cycleAmount*growth,pitch=.58*(1-growth)+.10+(rand(leaf.seed+41)-.5)*.9-(leaf.old?.24:0)*p.maturity+daily,leafBase=anchor.clone().add(new T.Vector3(Math.sin(angle)*petioleLength,petioleLength*(.25+daily*.5),Math.cos(angle)*petioleLength));
   v1.subVectors(leafBase,anchor);tmp.position.copy(anchor).addScaledVector(v1,.5);tmp.quaternion.setFromUnitVectors(UP,v1.clone().normalize());tmp.scale.set(.0009*g,v1.length(),.0009*g);tmp.updateMatrix();this.petiole.setMatrixAt(index,tmp.matrix);
   const rootMatrix=new T.Matrix4().compose(leafBase,new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2-pitch,angle,0,'YXZ')),new T.Vector3(1,1,1));
   for(let j=0;j<leaf.leaflets;j++){
    const middle=(leaf.leaflets-1)/2,relative=j-middle,fan=relative/(middle||1),lengthScale=leaf.leaflets===1?1:1-.48*Math.pow(Math.abs(fan),1.4),length=leaf.length*lengthScale*g;
    tmp.position.set(0,0,0);tmp.rotation.set((1-growth)*.70*Math.abs(fan)+Math.abs(fan)*.14,0,-fan*1.16*smooth(leaf.birth,leaf.finish+.04,progress));tmp.scale.set(length*this.profile.leafWidth/.28,length,length);tmp.updateMatrix();matrix.multiplyMatrices(rootMatrix,tmp.matrix);this.leaflets.setMatrixAt(instance,matrix);
    const age=leaf.old?p.maturity:0,color=new T.Color().setRGB(1-.1*rand(leaf.seed),1-.08*rand(leaf.seed+20),1-.12*rand(leaf.seed+50));color.lerp(new T.Color(0xc3a668),age*this.profile.senescence);this.leaflets.setColorAt(instance++,color);
   }
  });
  this.leaflets.instanceMatrix.needsUpdate=true;this.leaflets.instanceColor.needsUpdate=true;this.petiole.instanceMatrix.needsUpdate=true;
  let bi=0,hi=0,di=0,visibleClusters=0;
  this.clusters.forEach((cluster,clusterIndex)=>{
   const g=smooth(cluster.birth,Math.min(.98,cluster.birth+.38),progress),parent=cluster.branch===0?1:branchGrowth(this.branches[cluster.branch],progress),growth=g*parent;
   if(growth>.06)visibleClusters++;const base=this.nodePoint(cluster.branch,cluster.t,new T.Vector3()),length=cluster.length*growth,width=length*.155;
   // Crossed alpha-tested detail layers preserve fine hairs and sugar-leaf
   // silhouettes around the modeled volume from every walking direction.
   for(let side=0;side<4;side++){tmp.position.set(base.x,base.y+length*.40,base.z);tmp.rotation.set(0,cluster.seed*.17+side*Math.PI/4,0);tmp.scale.set(length*.50,length*1.12,1);tmp.updateMatrix();this.flowerDetails.setMatrixAt(clusterIndex*4+side,tmp.matrix);}
   // Overlapping bracts make each compound cluster genuinely three-dimensional.
   for(let j=0;j<this.bractCount;j++){
    const t=(j+.5)/this.bractCount,a=j*Math.PI*(3-Math.sqrt(5))+cluster.seed*.31,rad=width*(.55+.2*Math.sin(t*Math.PI))*(1-t*.70)*(1+.14*rand(j+cluster.seed));
    const local=new T.Vector3(Math.sin(a)*rad*.25,t*length-length*.12,Math.cos(a)*rad*.25),bractCentre=base.clone().add(local),r=width*(.54+.12*rand(j+cluster.seed+30))*(1-t*.35)*.30;
    tmp.position.copy(bractCentre);tmp.rotation.set(Math.sin(a)*.6,a,Math.cos(a)*.6);tmp.scale.set(r,r*(1.3+.3*rand(j+23)),r*.83);tmp.updateMatrix();this.bracts.setMatrixAt(bi,tmp.matrix);this.bracts.setColorAt(bi++,new T.Color().setRGB(.86+rand(j+cluster.seed)*.14,.88+rand(j+cluster.seed+10)*.12,.85+rand(j+cluster.seed+20)*.15));
    for(let dot=0;dot<3;dot++){
     const da=(j*3+dot)*2.399,dy=(rand(j*3+dot+cluster.seed)-.5)*1.5,dr=Math.sqrt(Math.max(0,1-dy*dy));
     this.dotVisibility[di/3]=growth;this.dotPositions[di++]=bractCentre.x+Math.sin(da)*dr*r*1.025;this.dotPositions[di++]=bractCentre.y+dy*r*1.35;this.dotPositions[di++]=bractCentre.z+Math.cos(da)*dr*r*.86;
    }
   }
   for(let j=0;j<this.hairCount;j++){
    const t=(j+.5)/this.hairCount,a=j*2.399+cluster.seed,rad=width*(1-t*.72),hairLength=.011*growth*(1-.35*p.maturity),from=new T.Vector3(base.x+Math.sin(a)*rad,base.y+length*(t-.12),base.z+Math.cos(a)*rad);
    const hairPoint=u=>from.clone().add(new T.Vector3(Math.sin(a+u*.8)*hairLength*u,hairLength*(u-u*u*.45),Math.cos(a+u*.8)*hairLength*u));
    for(let seg=0;seg<this.hairSegments;seg++)for(const u of [seg/this.hairSegments,(seg+1)/this.hairSegments]){const point=hairPoint(u);this.hairPositions[hi++]=point.x;this.hairPositions[hi++]=point.y;this.hairPositions[hi++]=point.z;}
   }
  });
  this.bracts.instanceMatrix.needsUpdate=true;this.bracts.instanceColor.needsUpdate=true;this.flowerDetails.instanceMatrix.needsUpdate=true;this.pistils.geometry.attributes.position.needsUpdate=true;this.trichomes.geometry.attributes.position.needsUpdate=true;this.trichomes.geometry.attributes.organVisibility.needsUpdate=true;
  this.pistils.visible=visibleClusters>0;this.trichomes.visible=progress>this.profile.flowerStart+.08;this.pistilMaterial.color.set(0xe6dfc2).lerp(new T.Color(0xbc8a54),p.maturity*.8);
  this.leafMaterial.userData.purple.value=p.purple*.56;this.budMaterial.userData.purple.value=p.purple;this.flowerMaterial.userData.purple.value=p.purple;
  this.state={...p,leafCycle:cycle,leafMotion:this.leafMotion.enabled,visibleLeaves,visibleClusters,branches:this.branches.filter((b,i)=>i===0||branchGrowth(b,progress)>.05).length};
 }
 setLeafMotion(enabled,strength,speed){this.leafMotion={enabled:!!enabled,strength:clamp(strength),speed:clamp(speed,.25,4)};this.lastProgress=-1;}
 setClipping(planes){for(const material of this.materials){material.clippingPlanes=planes;material.needsUpdate=true;}}
 setOpacity(opacity){for(const material of this.materials){const transparent=opacity<1;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}material.opacity=opacity;material.depthWrite=!transparent;}}
 dispose(){const geometries=new Set();this.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();for(const m of this.materials)m.dispose();this.guide.material.dispose();this.root.clear();}
}
