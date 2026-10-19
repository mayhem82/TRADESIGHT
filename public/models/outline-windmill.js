import * as THREE from 'three';
export const metadata={id:'outline-windmill-v1',name:'Outline Windmill',description:'Rotating windmill with transparent outlined fins inspired by Colour Vision Extreme outline mode.',version:1,units:'metres',parameters:{towerHeight:8,bladeLength:3.5,finWidth:1.15,finOpacity:.12,rotationSpeed:12},features:['3D','AR','Animated','Transparent fins','GLB export']};
export function createModel(options={}){
const p={...metadata.parameters,...options},root=new THREE.Group();root.name=metadata.name;
const metal=new THREE.MeshStandardMaterial({color:0x9eacba,metalness:.75,roughness:.33});
const dark=new THREE.MeshStandardMaterial({color:0x263541,metalness:.65,roughness:.36});
const fin=new THREE.MeshBasicMaterial({color:0x83d7f2,transparent:true,opacity:Math.max(0,Math.min(1,p.finOpacity)),side:THREE.DoubleSide,depthWrite:false});
const edge=new THREE.LineBasicMaterial({color:0x7bd9ff,transparent:true,opacity:.88,depthTest:true});
const cyl=(r1,r2,h,x,y,z,material,parent=root)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,16),material);o.position.set(x,y,z);parent.add(o);return o};
cyl(.16,.52,p.towerHeight,0,p.towerHeight/2,0,metal);
cyl(.85,.85,.22,0,.11,0,dark);
const head=new THREE.Group();head.position.set(0,p.towerHeight,0);root.add(head);
const nacelle=new THREE.Mesh(new THREE.BoxGeometry(1.25,.55,.7),metal);nacelle.position.set(0,0,-.35);head.add(nacelle);
const rotor=new THREE.Group();rotor.name='Animated transparent fins';rotor.position.set(0,0,.38);head.add(rotor);
cyl(.28,.28,.25,0,0,0,dark,rotor).rotation.x=Math.PI/2;
for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const blade=new THREE.Group();blade.rotation.z=a;rotor.add(blade);
const length=p.bladeLength,width=p.finWidth;
const shape=new THREE.Shape();shape.moveTo(-.12,.28);shape.lineTo(width*.38,length*.32);shape.lineTo(width*.56,length*.77);shape.lineTo(.10,length);shape.lineTo(-width*.25,length*.85);shape.lineTo(-width*.24,length*.34);shape.closePath();
const geo=new THREE.ShapeGeometry(shape);const panel=new THREE.Mesh(geo,fin);panel.position.z=.03;blade.add(panel);
const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geo),edge);outline.position.z=.045;blade.add(outline);
const spar=new THREE.Mesh(new THREE.CylinderGeometry(.035,.07,length*.92,8),metal);spar.position.set(0,length*.52,-.04);blade.add(spar);
}
cyl(.34,.34,.22,0,0,.48,metal,head).rotation.x=Math.PI/2;
root.userData={modelId:metadata.id,parameters:p,animation:{rotor,rotationSpeed:p.rotationSpeed}};
return root;
}
export function updateModel(model,delta){const anim=model.userData.animation;if(anim)anim.rotor.rotation.z-=delta*anim.rotationSpeed*Math.PI/30;}
