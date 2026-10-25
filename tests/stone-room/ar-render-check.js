async () => {
 const THREE=await import('./vendor/three.module.js');
 const {GLTFLoader}=await import('./vendor/GLTFLoader.js');
 const {createARRenderProfile}=await import('./ar-render-profile.js');
 const canvas=document.createElement('canvas');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setSize(360,480);renderer.setClearColor(0x000000,0);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,360/480,.035,120);
 camera.position.set(0,1.65,0);camera.lookAt(0,.9,-3);
 scene.add(new THREE.HemisphereLight(0xdfefff,0xa79b87,1.25));
 const sun=new THREE.DirectionalLight(0xffefd7,2.6);sun.position.set(-3,6,-8);scene.add(sun);
 const root=new THREE.Group();root.position.set(0,0,-3);scene.add(root);
 const gltf=await new GLTFLoader().loadAsync('./assets/photo-guided-npc.glb');root.add(gltf.scene);
 gltf.scene.traverse(o=>{if(o.isMesh)o.frustumCulled=false});
 const mixer=new THREE.AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations.find(c=>c.name==='Walk')).play();mixer.update(.4);
 const profile=createARRenderProfile(renderer,scene,root);profile.enter();
 const clips=[];for(const clip of gltf.animations){mixer.stopAllAction();mixer.clipAction(clip).reset().play();mixer.update(.4);renderer.render(scene,camera);clips.push(clip.name);}
 renderer.render(scene,camera);
 const gl=renderer.getContext(),pixels=new Uint8Array(360*480*4);gl.readPixels(0,0,360,480,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
 let coloured=0,green=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]>128)coloured++;if(pixels[i+1]>180&&pixels[i+1]>pixels[i]*1.4&&pixels[i+1]>pixels[i+2]*1.2)green++;}
 const screenshot=canvas.toDataURL('image/png');profile.exit();
 const errors=[];for(let i=0;i<8;i++){const e=gl.getError();if(!e)break;errors.push(e)}
 scene.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[])){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose()}});renderer.dispose();
 return {coloured,clips,errors,screenshot,scope:'Ordinary WebGL framebuffer with all four animated production GLB clips and original materials; not physical XR'};
}
