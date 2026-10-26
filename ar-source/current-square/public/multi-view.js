import {surface,squareGuides} from './square-geometry.js';
export const MAX_VIEWS=6,MAX_BYTES=16*1024*1024,MAX_EDGE=1024,SECTORS=3;
function worldPoint(model,radius,height,t,fraction){const point=surface(t).p,x=radius*point[0],y=(fraction-.5)*height,z=radius*point[2];return [model[0]*x+model[4]*y+model[8]*z+model[12],model[1]*x+model[5]*y+model[9]*z+model[13],model[2]*x+model[6]*y+model[10]*z+model[14]];}
export function inCapture(pv,p){const v=[0,0,0,0];for(let r=0;r<4;r++)v[r]=pv[r]*p[0]+pv[4+r]*p[1]+pv[8+r]*p[2]+pv[12+r];return v[3]>1e-6&&v.slice(0,3).every(n=>Number.isFinite(n)&&n>=-v[3]&&n<=v[3]);}
export function sameSurfaceSide(shot,current,model,t,p){const n=surface(t).n,nx=model[0]*n[0]+model[8]*n[2],ny=model[1]*n[0]+model[9]*n[2],nz=model[2]*n[0]+model[10]*n[2];const side=w=>(w[12]-p[0])*nx+(w[13]-p[1])*ny+(w[14]-p[2])*nz;return side(shot)>.001&&side(current)>.001;}
export function viewScore(shot,current){const distance=Math.hypot(shot.world[12]-current[12],shot.world[13]-current[13],shot.world[14]-current[14]);const dot=shot.world[8]*current[8]+shot.world[9]*current[9]+shot.world[10]*current[10];return distance+.2*Math.acos(Math.max(-1,Math.min(1,dot)));}
export function coverage(shots,model,radius,height,current=null){return Array.from({length:SECTORS},(_,sector)=>{let recorded=0,usable=0,total=0;for(const frac of [.15,.5,.85])for(const f of [.15,.5,.85]){const t=-Math.PI/2+(sector+f)*Math.PI/SECTORS,p=worldPoint(model,radius,height,t,frac);total++;const candidates=shots.filter(s=>inCapture(s.capturePV,p)&&sameSurfaceSide(s.world,s.world,model,t,p));if(candidates.length)recorded++;if(candidates.some(s=>!current||sameSurfaceSide(s.world,current,model,t,p)))usable++;}return {sector,recorded,usable,total,covered:recorded===total,currentUsable:usable===total};});}
export function selectViews(shots,current,model,radius,height,previousId=null,wallVersion=null){
  const valid=shots.filter(s=>(wallVersion===null||s.wallVersion===wallVersion)&&s.world&&s.capturePV),rows=coverage(valid,model,radius,height,current);
  const candidates=valid.map(s=>{const c=coverage([s],model,radius,height,current);const fraction=c.reduce((n,r)=>n+r.usable,0)/(SECTORS*9);return {shot:s,fraction,score:viewScore(s,current)+.25*(1-fraction)};}).filter(s=>s.fraction>0).sort((a,b)=>a.score-b.score||a.shot.id-b.shot.id);
  const previous=candidates.find(c=>c.shot.id===previousId);if(previous&&candidates[0]&&previous.score-candidates[0].score<.1){candidates.splice(candidates.indexOf(previous),1);candidates.unshift(previous);}
  return {primary:candidates[0]?.shot||null,order:candidates.slice().reverse().map(c=>c.shot),coverage:rows,recordedSectors:rows.filter(c=>c.covered).length,usableSectors:rows.filter(c=>c.currentUsable).length,scores:candidates.map(c=>({id:c.shot.id,score:c.score,coverage:c.fraction}))};
}
export const guideMesh=squareGuides;

export function wallExterior(current,model,radius,height,index){const t=-Math.PI/2+(index+.5)*Math.PI/SECTORS,p=worldPoint(model,radius,height,t,.5);return sameSurfaceSide(current,current,model,t,p);}
