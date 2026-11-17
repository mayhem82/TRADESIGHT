export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
export class GrowthClock{
 constructor(duration=32){this.duration=duration;this.progress=0;this.speed=1;this.playing=false;}
 tick(dt){if(this.playing){this.progress=clamp(this.progress+Math.max(0,Math.min(.1,dt))*this.speed/this.duration);if(this.progress===1)this.playing=false;}return this.progress;}
 setSpeed(v){this.speed=clamp(Number(v)||1,.25,4);}
 seek(v){this.progress=clamp(Number(v)||0);}
 restart(){this.progress=0;this.playing=true;}
}
