import {freshFloorHit} from './grounding.mjs';

const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const finiteMatrix=m=>m?.length===16&&Array.from(m).every(Number.isFinite);
export const TRACKING_BUILD='world-003';
export function positionalPose(pose,visibility='visible'){
 if(visibility!=='visible')return {usable:false,reason:'visibility-suspended'};
 if(!pose)return {usable:false,reason:'tracking-lost'};
 if(pose.emulatedPosition===true)return {usable:false,reason:'position-emulated'};
 if(pose.emulatedPosition!==false)return {usable:false,reason:'position-unverified'};
 if(!finiteMatrix(pose.transform?.matrix)||!pose.views?.length||!pose.views.every(v=>finiteMatrix(v.projectionMatrix)&&finiteMatrix(v.transform?.inverse?.matrix)))return {usable:false,reason:'invalid-pose'};
 return {usable:true,reason:'tracking'};
}
export function nativeSessionOptions(root){return {requiredFeatures:['local','hit-test'],optionalFeatures:['dom-overlay','anchors'],domOverlay:{root}};}
export async function acquireTrackedSession(xr,root,current){
 const requested=await xr.requestSession('immersive-ar',nativeSessionOptions(root));
 if(!current()){await requested.end();return null;}
 if(!requested.domOverlayState){await requested.end();throw Error('This browser did not grant the AR controls overlay. Tracked AR was ended; the separate camera overlay is untracked.');}
 return requested;
}
export class WorldTracking {
 constructor(anchor){this.anchor=anchor;this.serial=0;this.end();}
 releaseAnchor(){++this.serial;try{this.nativeAnchor?.delete();}catch{}this.nativeAnchor=null;this.anchorKind='none';this.anchorError=null;}
 begin(session){this.end();this.session=session;this.reason='waiting-for-tracking';}
 observe(pose,visibility,session){
  if(!this.session||session!==this.session)return {usable:false,reason:'inactive-session'};
  const result=positionalPose(pose,visibility);this.tracked=result.usable;this.pose=result.usable?pose:null;this.reason=result.reason;return result;
 }
 place(matrix,hitTime,now){
  if(!this.tracked||!this.pose||!freshFloorHit(matrix,this.pose.transform.matrix[13],hitTime,now))return false;
  this.releaseAnchor();this.anchor.set(matrix);this.placed=true;this.anchorKind='session-local';return true;
 }
 attachNative(hitResult){
  if(!this.placed||typeof hitResult?.createAnchor!=='function')return Promise.resolve(false);
  const serial=this.serial,session=this.session;this.anchorKind='native-pending';let promise;
  // Invoke inside the active XR frame, not later in an input-event callback.
  try{promise=hitResult.createAnchor();}catch(e){this.anchorKind='session-local';this.anchorError=e.name;return Promise.resolve(false);}
  return Promise.resolve(promise).then(anchor=>{
   if(this.serial!==serial||this.session!==session||!this.placed){try{anchor.delete();}catch{}return false;}
   this.nativeAnchor=anchor;this.anchorKind='native-anchor';return true;
  }).catch(e=>{if(this.serial===serial&&this.session===session){this.anchorKind='session-local';this.anchorError=e.name;}return false;});
 }
 refreshAnchor(frame,referenceSpace){
  if(!this.nativeAnchor)return true;
  try{const pose=frame.getPose(this.nativeAnchor.anchorSpace,referenceSpace);if(!pose||pose.emulatedPosition!==false||!finiteMatrix(pose.transform?.matrix)){this.suspend('anchor-lost');return false;}this.anchor.set(pose.transform.matrix);return true;}
  catch{this.suspend('anchor-lost');return false;}
 }
 suspend(reason='tracking-lost'){this.tracked=false;this.pose=null;this.reason=reason;}
 resetOrigin(){this.releaseAnchor();this.anchor.set(identity());this.placed=false;this.suspend('origin-reset');}
 reposition(){this.releaseAnchor();this.placed=false;}
 end(){this.releaseAnchor();this.session=null;this.placed=false;this.tracked=false;this.pose=null;this.reason='inactive';this.anchor.set(identity());}
 get visible(){return this.tracked&&this.placed;}
 get state(){return {active:!!this.session,tracked:this.tracked,placed:this.placed,reason:this.reason,emulatedPosition:this.pose?.emulatedPosition??null,referenceSpace:'local',anchorKind:this.anchorKind,anchorError:this.anchorError,anchor:Array.from(this.anchor)};}
}
