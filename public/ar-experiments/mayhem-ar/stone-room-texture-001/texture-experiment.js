import * as THREE from './vendor/three.module.js';

// Material-only experiment: never replace geometry, parents or transforms.
export function createTextureExperiment(){
 const original=new Map(),variants=new Map(),owned=new Set(),visibility=new Map();
 let maps=[],ready=false,textured=true,pulse=true,hidden=false,time=0,frozen=.6,disposed=false;
 const status=document.querySelector('#texture-status');
 function apply(){for(const [mesh,material] of original)mesh.material=textured?variants.get(mesh):material;}
 function intensity(){return pulse?.55+.4*Math.sin(time*2*Math.PI/3):frozen;}
 function update(){if(disposed)return;time=performance.now()/1000;for(const material of owned)if(material.emissiveMap)material.emissiveIntensity=intensity();}
 async function install(root){
  const loader=new THREE.TextureLoader(),names=['weathered-albedo','weathered-normal','weathered-roughness','rune-emissive'];
  // allSettled allows complete cleanup if any one image is missing.
  const results=await Promise.allSettled(names.map(n=>loader.loadAsync('./assets/texture-001/'+n+'.png')));
  maps=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
  if(disposed||results.some(r=>r.status==='rejected')){maps.forEach(t=>t.dispose());maps=[];if(disposed)return;throw Error('Texture comparison images could not load');}
  maps.forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.flipY=false;t.anisotropy=2;});maps[0].colorSpace=maps[3].colorSpace=THREE.SRGBColorSpace;
  const cache=new Map();
  function variant(material){
   if(!/limestone/i.test(material.name))return material;
   if(cache.has(material))return cache.get(material);
   const m=material.clone();m.name=material.name+' / texture 001';
   m.userData.textureExperiment=true;m.userData.textureExperimentOriginal=material;m.map=maps[0];m.normalMap=maps[1];m.normalScale.set(.45,.45);m.roughnessMap=maps[2];m.roughness=1;m.metalness=0;m.envMap=null;
   // Keep baseline per-slot tint, alpha, face side, depth and UV assignment.
   if(material.name==='Mineral limestone 0'){m.emissiveMap=maps[3];m.emissive.set('#8de0ca');m.emissiveIntensity=intensity();}
   cache.set(material,m);owned.add(m);return m;
  }
  root.traverse(mesh=>{if(!mesh.isMesh)return;original.set(mesh,mesh.material);variants.set(mesh,Array.isArray(mesh.material)?mesh.material.map(variant):variant(mesh.material));});
  ready=true;apply();status.textContent='Effects in Browser AR + walkthrough. Native Android keeps the original appearance.';
 }
 document.querySelector('#texture-enabled').onchange=e=>{textured=e.target.checked;apply();};
 document.querySelector('#texture-pulse').onchange=e=>{if(!e.target.checked)frozen=intensity();pulse=e.target.checked;update(0);};
 const panel=document.querySelector('#texture-panel'),toggle=document.querySelector('#texture-menu');
 toggle.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden){document.querySelector('#ar-options').open=false;document.querySelector('#npcpanel').hidden=true;document.querySelector('#npc-toggle').setAttribute('aria-expanded','false');}toggle.setAttribute('aria-expanded',String(!panel.hidden));};
 document.querySelector('#ar-options').addEventListener('toggle',e=>{if(e.target.open){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}});
 document.querySelector('#npc-toggle').addEventListener('click',()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false');});
 document.querySelector('#texture-close').onclick=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false');};
 const hide=document.querySelector('#texture-hide');
 hide.onclick=()=>{hidden=!hidden;for(const mesh of original.keys()){if(hidden){visibility.set(mesh,mesh.visible);mesh.visible=false;}else mesh.visible=visibility.get(mesh)??true;}if(!hidden)visibility.clear();hide.setAttribute('aria-pressed',String(hidden));hide.textContent=hidden?'Show architecture':'Hide architecture';};
 // Same control nodes move into the already requested DOM overlay in AR.
 const dock=document.querySelector('#texture-dock');
 const observer=new MutationObserver(()=>{const host=document.body.classList.contains('in-ar')?document.querySelector('#ar-overlay'):document.body;if(dock.parentElement!==host)host.append(dock);panel.hidden=true;toggle.setAttribute('aria-expanded','false');});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 function dispose(){if(disposed)return;disposed=true;observer.disconnect();for(const [mesh,material]of original)mesh.material=material;for(const material of owned)material.dispose();maps.forEach(t=>t.dispose());maps=[];owned.clear();variants.clear();original.clear();}
 return {install,update,dispose,get diagnostics(){return {ready,textured,pulse,hidden,intensity:intensity(),time,materials:owned.size,images:maps.map(t=>({width:t.image.width,height:t.image.height,loaded:t.image.complete})),additionalTextureBytesWithMipmaps:4*512*512*4*4/3,disposed};}};
}

