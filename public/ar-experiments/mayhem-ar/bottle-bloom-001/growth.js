export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
// Hand-authored 3D staging informed by the time-lapse frames listed in references.html.
// Values compress separate biological stages into one controllable creative sequence.
export const STAGES=[
 [0,0,0,0,0], [.08,.035,0,0,0], [.18,.16,.08,0,0],
 [.30,.31,.22,0,0], [.44,.51,.44,0,0], [.58,.75,.70,0,0],
 [.72,.96,.90,.08,0], [.82,1,1,.80,0], [.88,1,1,1,.16],
 [.94,1,1,1,.61], [1,1,1,1,1],
];
export function sampleGrowth(p){
 p=clamp(p);let i=1;while(i<STAGES.length-1&&p>STAGES[i][0])i++;
 const a=STAGES[i-1],b=STAGES[i],t=smooth(a[0],b[0],p);
 const v=a.map((x,k)=>x+(b[k]-x)*t);
 return {progress:p,stem:v[1],leaf:v[2],bud:v[3],bloom:v[4],stage:p<.10?'Waking up':p<.40?'Growing inside the glass':p<.70?'Stem and leaves':p<.84?'Forming buds':p<1?'Opening flowers':'In bloom'};
}
export class GrowthClock{
 constructor(duration=32){this.duration=duration;this.progress=0;this.speed=1;this.playing=false;}
 tick(dt){if(this.playing){this.progress=clamp(this.progress+Math.max(0,Math.min(.1,dt))*this.speed/this.duration);if(this.progress===1)this.playing=false;}return this.progress;}
 setSpeed(v){this.speed=clamp(Number(v)||1,.25,4);}
 seek(v){this.progress=clamp(Number(v)||0);}
 restart(){this.progress=0;this.playing=true;}
}
export function intersectHeight(origin,direction,height){
 if(!origin||!direction||direction[1]>=-.025)return null;
 const t=(height-origin[1])/direction[1];
 if(!Number.isFinite(t)||t<.08||t>3.5)return null;
 return [origin[0]+direction[0]*t,height,origin[2]+direction[2]*t];
}
