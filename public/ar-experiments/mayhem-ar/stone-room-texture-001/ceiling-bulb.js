import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

export function createCeilingBulb(root){
 root.updateWorldMatrix(true,true);
 const hit=new THREE.Raycaster(new THREE.Vector3(0,2,0),new THREE.Vector3(0,1,0),0,2).intersectObject(root,true)[0];
 if(!hit||hit.point.y<2.5)throw Error('The centre ceiling mounting surface was not found');
 const ceilingY=hit.point.y,group=new THREE.Group();group.name='CentreCeilingBulb';group.position.copy(root.worldToLocal(new THREE.Vector3(0,ceilingY,0)));root.add(group);
 const fittings=[];
 for(const [radius,height,y,segments] of [[.07,.02,-.01,24],[.003,.08,-.06,12],[.023,.04,-.12,24]]){const g=new THREE.CylinderGeometry(radius,radius,height,segments).toNonIndexed();g.translate(0,y,0);fittings.push(g);}
 const fittingGeometry=mergeGeometries(fittings,false);fittings.forEach(g=>g.dispose());const fittingMaterial=new THREE.MeshStandardMaterial({name:'Aged brass bulb fitting',color:'#514639',roughness:.72,metalness:.45});const fitting=new THREE.Mesh(fittingGeometry,fittingMaterial);fitting.name='CeilingBulbFitting';fitting.castShadow=true;fitting.receiveShadow=true;group.add(fitting);
 const profile=[[0,-.052],[.019,-.046],[.030,-.025],[.034,-.003],[.029,.024],[.019,.044],[.014,.055],[0,.055]].map(([x,y])=>new THREE.Vector2(x,y));
 const bulbGeometry=new THREE.LatheGeometry(profile,24),bulbMaterial=new THREE.MeshStandardMaterial({name:'Warm frosted ceiling bulb',color:'#fff0cd',emissive:'#ffd29a',emissiveIntensity:1.35,roughness:.32,metalness:0});const bulb=new THREE.Mesh(bulbGeometry,bulbMaterial);bulb.name='CeilingBulbGlass';bulb.position.y=-.185;bulb.castShadow=false;group.add(bulb);
 // A broad downward cone avoids shining above the ceiling; the bounded falloff
 // keeps light near the room interior without a second expensive shadow map.
 const light=new THREE.SpotLight('#ffd29a',65,3.65,Math.PI/3,.45,2);light.name='CentreBulbWarmLight';light.position.copy(bulb.position);light.castShadow=false;const target=new THREE.Object3D();target.position.set(0,-ceilingY,0);group.add(light,target);light.target=target;
 let disposed=false;
 return {sync({ceilingVisible=true,hidden=false}={}){group.visible=ceilingVisible&&!hidden;},dispose(){if(disposed)return;disposed=true;root.remove(group);fittingGeometry.dispose();bulbGeometry.dispose();fittingMaterial.dispose();bulbMaterial.dispose();light.dispose();},get diagnostics(){root.updateWorldMatrix(true,true);return {exists:!disposed,ceilingY,centre:[0,0],bulbPosition:bulb.getWorldPosition(new THREE.Vector3()).toArray(),bulbLowestY:ceilingY-.237,visible:group.visible,lightType:light.type,intensity:light.intensity,colour:light.color.getHexString(),distance:light.distance,angle:light.angle,shadowMapAdded:!!light.shadow.map,castShadow:light.castShadow,disposed};}};
}
