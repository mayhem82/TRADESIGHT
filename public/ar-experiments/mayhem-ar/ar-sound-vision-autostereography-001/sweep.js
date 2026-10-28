import {coverage,MAX_VIEWS,MAX_BYTES} from './multi-view.js';
export function poseDelta(a,b){if(!a||!b)return {distance:Infinity,degrees:180};const distance=Math.hypot(a[12]-b[12],a[13]-b[13],a[14]-b[14]);let trace=0;for(const i of [0,1,2,4,5,6,8,9,10])trace+=a[i]*b[i];return {distance,degrees:Math.acos(Math.max(-1,Math.min(1,(trace-1)/2)))*180/Math.PI};}
export class Sweep {
 constructor(){this.active=false;this.message='Sweep idle';this.lastAttempt=-Infinity;this.stableSince=null;this.previous=null;}
 start(){this.active=true;this.previous=null;this.stableSince=null;this.lastAttempt=-Infinity;this.message='Sweep active — move slowly, then pause at useful viewpoints';}
 stop(reason='Stopped; retained photos kept'){this.active=false;this.previous=null;this.stableSince=null;this.message=reason;}
 evaluate({time,current,projection,viewInverse,model,radius,height,views,bytes,tracking=true,camera=true}){
  if(!this.active)return false;
  if(!tracking||!camera){this.stop(!tracking?'Stopped: tracking lost; retained photos kept':'Stopped: valid raw camera unavailable; retained photos kept');return false;}
  if(views.length>=MAX_VIEWS||bytes>=MAX_BYTES){this.stop('Stopped: capture limit reached; retained photos kept');return false;}
  const d=poseDelta(this.previous,current);
  if(d.distance>.015||d.degrees>2||this.stableSince===null){this.previous=new Float32Array(current);this.stableSince=time;this.message='Sweep active — pause briefly to retain a sharp viewpoint';return false;}
  if(time-this.stableSince<500||time-this.lastAttempt<1200)return false;
  const pv=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)pv[c*4+r]+=projection[k*4+r]*viewInverse[c*4+k];
  const before=coverage(views,model,radius,height),after=coverage([{capturePV:pv,world:current}],model,radius,height);
  const visible=after.reduce((n,s)=>n+s.recorded,0),gain=after.reduce((n,s,i)=>n+Math.max(0,s.recorded-before[i].recorded),0);
  const novel=views.every(s=>{const delta=poseDelta(s.world,current);return delta.distance>=.18||delta.degrees>=12;});
  if(!visible){this.message='Sweep active — aim at the placed wall';return false;}
  if(views.length&&gain<3&&!novel){this.message='Sweep active — this viewpoint is already recorded; move around the empty wall';return false;}
  this.lastAttempt=time;this.message='Sweep active — retaining a useful background frame';return true;
 }
 result(error,count){if(error){this.message='Sweep active — frame rejected: '+error;if(/limit|Six views/i.test(error))this.stop('Stopped: '+error);}else if(count>=MAX_VIEWS)this.stop('Stopped: six useful photos retained');else this.message='Sweep active — '+count+' photos retained; move, then pause';}
}
