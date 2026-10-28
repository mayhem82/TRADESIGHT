import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

const EPS=1e-7;
function arch(width,bottom,spring,segments=18){const r=width/2,p=[[-r,bottom],[r,bottom]];for(let i=0;i<=segments;i++){const a=i*Math.PI/segments;p.push([Math.cos(a)*r,spring+Math.sin(a)*r]);}return p;}
function circle(radius,cy,segments=32){return Array.from({length:segments},(_,i)=>{const a=i*Math.PI*2/segments;return [Math.cos(a)*radius,cy+Math.sin(a)*radius];});}
function planes(window){const p=[[-1,0,0,3.65],[1,0,0,-4.5]];for(let i=0;i<window.polygon.length;i++){const [u,y]=window.polygon[i],[v,z]=window.polygon[(i+1)%window.polygon.length],du=v-u,dy=z-y,n=Math.hypot(du,dy);p.push([0,-du/n,dy/n,(du*y-dy*(window.z+u))/n]);}return p;}
const signed=(v,p)=>v[0]*p[0]+v[1]*p[1]+v[2]*p[2]+p[3];
function clip(poly,plane,inside){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=signed(a,plane),db=signed(b,plane),ka=inside?da<=EPS:da>=-EPS,kb=inside?db<=EPS:db>=-EPS;if(ka)out.push(a);if(ka!==kb){const t=da/(da-db);out.push(a.map((x,j)=>x+(b[j]-x)*t));}}return out;}
function subtract(poly,volume){let carry=poly;const kept=[];for(const p of volume){if(carry.length<3)break;const outside=clip(carry,p,false);if(outside.length>=3)kept.push(outside);carry=clip(carry,p,true);}return kept;}

function cut(mesh,windows){
 const old=mesh.geometry;if(!old.index||!old.attributes.uv)return null;
 const position=old.attributes.position,normal=old.attributes.normal,uv=old.attributes.uv,index=old.index.array,world=new Float64Array(position.count*3),v=new THREE.Vector3();
 for(let i=0;i<position.count;i++){v.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);world.set(v.toArray(),i*3);}
 const pos=Array.from(position.array),norm=Array.from(normal.array),tex=Array.from(uv.array),indices=[];const inverse=mesh.matrixWorld.clone().invert();let touched=0;
 const vertex=i=>[world[i*3],world[i*3+1],world[i*3+2],normal.getX(i),normal.getY(i),normal.getZ(i),uv.getX(i),uv.getY(i)];
 for(let i=0;i<index.length;i+=3){const ids=[index[i],index[i+1],index[i+2]],xs=ids.map(k=>world[k*3]),ys=ids.map(k=>world[k*3+1]),zs=ids.map(k=>world[k*3+2]);const relevant=windows.filter(w=>Math.max(...xs)>=3.65&&Math.min(...xs)<=4.5&&Math.max(...ys)>=w.bounds.minY&&Math.min(...ys)<=w.bounds.maxY&&Math.max(...zs)>=w.bounds.minZ&&Math.min(...zs)<=w.bounds.maxZ);
  if(!relevant.length){indices.push(...ids);continue;}touched++;let polygons=[ids.map(vertex)];for(const w of relevant)polygons=polygons.flatMap(p=>subtract(p,w.planes));
  for(const poly of polygons){const start=pos.length/3;for(const a of poly){v.set(a[0],a[1],a[2]).applyMatrix4(inverse);pos.push(v.x,v.y,v.z);const n=new THREE.Vector3(a[3],a[4],a[5]).normalize();norm.push(n.x,n.y,n.z);tex.push(a[6],a[7]);}for(let j=1;j<poly.length-1;j++){const a=poly[0],b=poly[j],c=poly[j+1],ab=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),ac=new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2]);if(ab.cross(ac).lengthSq()>1e-16)indices.push(start,start+j,start+j+1);}}
 }
 if(!touched)return null;
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));geometry.setIndex(indices);geometry.computeBoundingBox();geometry.computeBoundingSphere();mesh.geometry=geometry;old.dispose();return {mesh:mesh.name,touchedTriangles:touched,beforeTriangles:index.length/3,afterTriangles:indices.length/3};
}

export function addWindowDesigns(root){
 root.updateWorldMatrix(true,true);
 const windows=[{name:'East tall arched window',wall:'east',z:-1.35,polygon:arch(1.16,.65,1.91),type:'arch'},{name:'East round window',wall:'east',z:1.3,polygon:circle(.43,1.75),type:'round'}];
 for(const w of windows){w.planes=planes(w);w.bounds={minY:Math.min(...w.polygon.map(p=>p[1])),maxY:Math.max(...w.polygon.map(p=>p[1])),minZ:w.z+Math.min(...w.polygon.map(p=>p[0])),maxZ:w.z+Math.max(...w.polygon.map(p=>p[0]))};}
 const cuts=[],cutGeometries=[];let oak,stone;const originalMeshes=[];root.traverse(o=>{if(!o.isMesh)return;originalMeshes.push(o);if(/Quarter sawn oak/.test(o.material.name))oak??=o.material;if(/Mineral limestone/.test(o.material.name))stone??=o.material;});
 for(const mesh of originalMeshes){const result=cut(mesh,windows);if(result){cuts.push(result);cutGeometries.push(mesh.geometry);}}
 const wood=oak.clone();wood.name='Aged oak window frames';wood.color.multiplyScalar(.72);wood.roughness=1;const rock=stone.clone();rock.name='Mineral limestone window surrounds';
 const wooden=[],masonry=[],inverse=root.matrixWorld.clone().invert();
 function ring(inner,outer,z,x,depth,list){const shape=new THREE.Shape(outer.map(([u,y])=>new THREE.Vector2(-u,y)));shape.holes.push(new THREE.Path(inner.map(([u,y])=>new THREE.Vector2(-u,y)).reverse()));const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:18});g.rotateY(Math.PI/2);g.translate(x,0,z);g.applyMatrix4(inverse);list.push(g);}
 for(const w of windows){if(w.type==='arch'){ring(w.polygon,arch(1.30,.58,1.91),w.z,3.80,.33,wooden);ring(arch(1.30,.58,1.91),arch(1.54,.48,1.91),w.z,3.84,.28,masonry);}else{ring(w.polygon,circle(.50,1.75),w.z,3.80,.33,wooden);ring(circle(.50,1.75),circle(.62,1.75),w.z,3.84,.28,masonry);}}
 function bar(w,h,d,x,y,z){const g=new THREE.BoxGeometry(w,h,d).toNonIndexed();g.translate(x,y,z);g.applyMatrix4(inverse);wooden.push(g);}
 // New slender rails sit in existing apertures, clear of the legacy test sightlines.
 for(const center of [-1.8,1.8]){for(const x of [center-.55,center+.55])bar(.035,1.82,.085,x,1.60,3.0);bar(2.20,.04,.085,center,1.72,3.0);}
 // South: small upper transom lights over broad casements. West: a narrow pair.
 for(const x of [-.4,.4])bar(.035,.45,.085,x,2.255,-3.0);bar(2.40,.045,.085,0,2.03,-3.0);
 for(const z of [0,1.0])bar(.085,.04,.98,-4.0,1.78,z);bar(.085,1.82,.045,-4.0,1.60,.5);
 const additions=[];
 function install(list,material,name){const merged=mergeGeometries(list.map(g=>g.index?g.toNonIndexed():g),false);list.forEach(g=>g.dispose());const mesh=new THREE.Mesh(merged,material);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);additions.push(mesh);}
 install(wooden,wood,'AgedWindowTimberFrames');install(masonry,rock,'StoneWindowSurrounds');
 let disposed=false;
 return {diagnostics:{windows:windows.map(({planes,polygon,...w})=>w),styles:{north:'multi-pane rectangular casements',south:'broad casements with upper transom lights',west:'paired tall narrow casements',east:'tall arched and small round apertures'},cuts,glass:false,legacyAperturesPreserved:true},dispose(){if(disposed)return;disposed=true;for(const mesh of additions){mesh.geometry.dispose();root.remove(mesh);}cutGeometries.forEach(g=>g.dispose());wood.dispose();rock.dispose();}};
}
