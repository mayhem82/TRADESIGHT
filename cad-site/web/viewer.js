(()=>{'use strict';
const objects=JSON.parse(document.getElementById('mesh').textContent), mount=document.getElementById('viewer'), canvas=document.createElement('canvas');mount.append(canvas);const ctx=canvas.getContext('2d');
const all=objects.flatMap(o=>o.positions);if(!all.length)return;
const bounds=[[Infinity,-Infinity],[Infinity,-Infinity],[Infinity,-Infinity]];for(const p of all)for(let i=0;i<3;i++){bounds[i][0]=Math.min(bounds[i][0],p[i]);bounds[i][1]=Math.max(bounds[i][1],p[i]);}
const centre=bounds.map(b=>(b[0]+b[1])/2), extent=Math.max(...bounds.map(b=>b[1]-b[0]),1);
let yaw=.7,pitch=.45,zoom=1,w=800,h=500,labels=false,transparent=false,textures=true,hit=[],lastDistance=0,moved=false,start;
const photoImages={},photoData=JSON.parse(document.getElementById('texture-data')?.textContent||'{}');
for(const [name,source]of Object.entries(photoData)){const image=new Image();image.onload=()=>draw();image.src=source;photoImages[name]=image;}
for(const o of objects)if(o.texture)o.texture.faceSet=new Set(o.texture.faces);
const hidden=new Set(objects.filter(o=>o.initiallyHidden).map(o=>o.id)), pointers=new Map();
function project(p){let [x,y,z]=p.map((n,i)=>(n-centre[i])/extent);let rx=x*Math.cos(yaw)-z*Math.sin(yaw),rz=x*Math.sin(yaw)+z*Math.cos(yaw);const scale=Math.min(w,h)*.85*zoom;return [w/2+rx*scale,h/2-(y*Math.cos(pitch)-rz*Math.sin(pitch))*scale,y*Math.sin(pitch)+rz*Math.cos(pitch)];}
function paintPhoto(p,uv,image){
 const [u,v,q]=uv.map(t=>[t[0]*image.naturalWidth,t[1]*image.naturalHeight]);
 const det=u[0]*(v[1]-q[1])+v[0]*(q[1]-u[1])+q[0]*(u[1]-v[1]);if(Math.abs(det)<1e-6)return;
 const solve=i=>[(p[0][i]*(v[1]-q[1])+p[1][i]*(q[1]-u[1])+p[2][i]*(u[1]-v[1]))/det,(p[0][i]*(q[0]-v[0])+p[1][i]*(u[0]-q[0])+p[2][i]*(v[0]-u[0]))/det,(p[0][i]*(v[0]*q[1]-q[0]*v[1])+p[1][i]*(q[0]*u[1]-u[0]*q[1])+p[2][i]*(u[0]*v[1]-v[0]*u[1]))/det];
 const [a,c,e]=solve(0),[b,d,f]=solve(1);ctx.save();ctx.clip();ctx.transform(a,b,c,d,e,f);ctx.drawImage(image,0,0);ctx.restore();
}
function draw(){ctx.fillStyle='#edf2f4';ctx.fillRect(0,0,w,h);const faces=[];hit=[];
for(const o of objects){if(hidden.has(o.id))continue;const ps=o.positions.map(project);for(let index=0;index<o.faces.length;index++){const f=o.faces[index],p=f.map(i=>ps[i]);faces.push({p,o,uv:o.texture?.faceSet.has(index)?f.map(i=>o.texture.uv[i]):null,depth:p.reduce((a,b)=>a+b[2],0)/3});}}
faces.sort((a,b)=>a.depth-b.depth);hit=faces;
for(const {p,o,uv} of faces){ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);ctx.lineTo(p[1][0],p[1][1]);ctx.lineTo(p[2][0],p[2][1]);ctx.closePath();ctx.globalAlpha=transparent&&o.wall?.18:1;ctx.fillStyle=o.color;ctx.fill();const image=uv&&photoImages[o.texture.image];if(textures&&image?.complete&&image.naturalWidth)paintPhoto(p,uv,image);ctx.strokeStyle='#213a4938';ctx.lineWidth=.45;ctx.stroke();}ctx.globalAlpha=1;
if(labels){ctx.font='12px Arial';ctx.fillStyle='#153348';for(const o of objects){if(hidden.has(o.id)||!o.positions.length)continue;const p=project(o.positions[0]);ctx.fillText(o.label.slice(0,55),p[0]+4,p[1]-4);}}
}
function resize(){const r=mount.getBoundingClientRect();w=r.width;h=r.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=w*ratio;canvas.height=h*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);draw();}
const controls=document.getElementById('controls');
function button(text,fn){let b=document.createElement('button');b.textContent=text;b.onclick=fn;controls.append(b);}
const presets={Isometric:[.7,.45],Front:[0,0],Rear:[Math.PI,0],Plan:[0,Math.PI/2],Left:[-Math.PI/2,0],Right:[Math.PI/2,0]};
for(const [name,value]of Object.entries(presets))button(name,()=>{[yaw,pitch]=value;zoom=1;draw();});
button('Zoom +',()=>{zoom=Math.min(8,zoom*1.2);draw();});button('Zoom −',()=>{zoom=Math.max(.2,zoom/1.2);draw();});button('Labels',()=>{labels=!labels;draw();});button('Transparent walls',()=>{transparent=!transparent;draw();});
if(objects.some(o=>o.texture))button('Photo textures',()=>{textures=!textures;draw();});
button('Save image',()=>{const a=document.createElement('a');a.download='TradeSight-view.png';a.href=canvas.toDataURL();a.click();});
const groups=[['Roof',o=>o.roof],['Walls',o=>o.wall],['Services',o=>o.role==='service'||/service/i.test(o.group)]];
for(const [name,test]of groups){if(objects.some(test))button(name,()=>{const group=objects.filter(test),hide=group.some(o=>!hidden.has(o.id));for(const o of group)hide?hidden.add(o.id):hidden.delete(o.id);draw();});}
const layers=document.getElementById('layers');for(const o of objects){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!hidden.has(o.id);input.dataset.object=o.id;input.onchange=()=>{input.checked?hidden.delete(o.id):hidden.add(o.id);draw();};label.append(input,document.createTextNode(o.label));layers.append(label);}
canvas.style.touchAction='none';canvas.setAttribute('aria-label','Interactive FreeCAD model');
canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);start=[e.clientX,e.clientY];moved=false;lastDistance=0;};
canvas.onpointermove=e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)moved=true;if(pointers.size===2){moved=true;const [a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(lastDistance)zoom=Math.max(.2,Math.min(8,zoom*d/lastDistance));lastDistance=d;}else{yaw-=(e.clientX-old[0])*.008;pitch=Math.max(-1.55,Math.min(1.57,pitch+(e.clientY-old[1])*.008));}draw();};
canvas.onpointerup=e=>{pointers.delete(e.pointerId);lastDistance=0;if(moved)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;for(let i=hit.length-1;i>=0;i--){const f=hit[i],signs=f.p.map((a,j)=>{const b=f.p[(j+1)%3];return (x-b[0])*(a[1]-b[1])-(a[0]-b[0])*(y-b[1]);});if(!(signs.some(s=>s<0)&&signs.some(s=>s>0))){const o=f.o;document.getElementById('selection').textContent=`${o.label}\n${o.description||''}\nOverall XYZ size: ${o.bounds.map(n=>n.toFixed(1)).join(' × ')} mm\nDimension source: ${o.source}\nMaterial: ${o.material||'Unspecified'}`;break;}}};
canvas.onpointercancel=e=>{pointers.delete(e.pointerId);lastDistance=0;};canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.2,Math.min(8,zoom*Math.exp(-e.deltaY*.001)));draw();},{passive:false});new ResizeObserver(resize).observe(mount);resize();window.cadViewer={draw,project,getState:()=>({yaw,pitch,zoom,textures,loadedPhotos:Object.values(photoImages).filter(i=>i.complete&&i.naturalWidth).length,texturedComponents:objects.filter(o=>o.texture).length,hidden:[...hidden],faces:hit.length})};
})();
