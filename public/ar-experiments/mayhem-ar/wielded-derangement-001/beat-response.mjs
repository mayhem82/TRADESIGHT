import {stateAt} from './timeline.mjs';
export function beatAt(features,seconds){
 const a=features?.response;if(!a?.length||!Number.isFinite(seconds)||seconds<0)return 0;
 const index=seconds/features.secondsPerSample,i=Math.floor(index),u=index-i;
 if(i>=a.length)return 0;return Math.max(0,Math.min(1,a[i]*(1-u)+(a[i+1]??a[i])*u));
}
export function reactiveState(seconds,energy,features){
 const state=stateAt(seconds,energy),beat=beatAt(features,seconds);
 // Same geometry and slow song structure; brief bounded mechanical recoil.
 return {...state,beat,pulse:state.pulse+beat*.22,radius:state.radius*(1+beat*.1)};
}
export function beatEmission(original,beat){return [original[0]+.28*beat,original[1]+.095*beat,original[2]+.022*beat];}
