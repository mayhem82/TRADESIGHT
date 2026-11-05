import {beatAt} from './beat-response.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
export const WAVE_SECTION_DELAY=.07;
export function motionBeatAt(beats,time){const weights=[1,2,3,2,1];return weights.reduce((sum,w,i)=>sum+w*beatAt(beats,time-i*.02),0)/9;}
export function bandAt(score,band,time){const a=score?.bands?.[band];if(!a?.length||!Number.isFinite(time)||time<0)return 0;const i=time/score.secondsPerSample,k=Math.floor(i),u=i-k;if(k>=a.length)return 0;return clamp(a[k]*(1-u)+(a[k+1]??a[k])*u,0,1);}
export function cueEnvelope(time,event){const t=time-event.time;if(t<0)return smooth((t+1.1)/1.1);if(t<=.55)return 1;return 1-smooth((t-.55)/6);}
export function wallScoreAt(score,beats,time,section,count=20){
 if(!score||!Number.isFinite(time)||time<0||time>score.duration)return {height:1,wave:0,heat:0,kick:0,cue:null};
 const delay=section*WAVE_SECTION_DELAY,beat=beatAt(beats,time-delay),motion=motionBeatAt(beats,time-delay),tail=motionBeatAt(beats,time-delay-.16),high=bandAt(score,'high',time-section*.035),angle=section/count*Math.PI*2;
 let height=1+.34*motion-.10*tail+.025*high,heat=beat*.65,kick=.18*motion,cue=null,maxEnvelope=0;
 for(const event of score.events||[]){
  const envelope=cueEnvelope(time-section*.025,event);if(envelope<=0)continue;
  const phase=(time-event.time)/6*Math.PI*2;
  let change=0;
  if(event.mode==='compression')change=-.30+.10*Math.cos(angle);
  else if(event.mode==='crown')change=.42+.13*Math.cos(angle-phase);
  else if(event.mode==='counterwave')change=.28*Math.sin(angle*2-phase);
  else if(event.mode==='surge')change=.48-.08*Math.cos(angle-phase);
  else if(event.mode==='cascade')change=.16+.36*Math.sin(angle-phase*1.5);
  height+=change*envelope;heat+=envelope*.22;kick+=envelope*.16*Math.sin(angle-phase);
  if(envelope>maxEnvelope){maxEnvelope=envelope;cue=event.mode;}
 }
 const gate=smooth(time/.35)*smooth((score.duration-time)/1.1);
 return {height:1+(clamp(height,.55,1.7)-1)*gate,wave:beat*gate,heat:clamp(heat,0,1)*gate,kick:kick*gate,cue:gate>0?cue:null};
}
export function wallGlow(original,heat){return [original[0]+heat*.42,original[1]+heat*.15,original[2]+heat*.035];}
