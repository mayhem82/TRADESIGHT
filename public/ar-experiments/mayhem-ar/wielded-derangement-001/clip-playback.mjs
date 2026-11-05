export const CLIP_DURATION=145/24;
export const CLIPS=Object.freeze(['Mercury_Loom','Hydraulic_Bloom','Suspended_Foundry','Pressure_Skin']);
export function clipTime(time,slot=0){const t=Number.isFinite(time)?time:0;return ((t+slot*.137*CLIP_DURATION)%CLIP_DURATION+CLIP_DURATION)%CLIP_DURATION;}
export function clipIndex(time,panel=0){return ((Math.floor(Math.max(0,time)/12)+panel)%CLIPS.length);}
export function loopDistance(a,b,d=CLIP_DURATION){const delta=Math.abs(a-b)%d;return Math.min(delta,d-delta);}
// One controller per independent media source. Multiple panels can share it.
// Injectable media objects allow lifecycle tests without a browser or tracking.
export class ClipPlayback {
 constructor(video){this.video=video;this.index=-1;this.serial=0;this.uploadedSerial=-1;this.error='';this.pending=false;this.active=false;this.uploadTime=-1;this.uploadFrame=-1;this.buffering=false;video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='metadata';video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');for(const event of ['waiting','stalled'])video.addEventListener(event,()=>this.buffering=true);for(const event of ['playing','canplay'])video.addEventListener(event,()=>this.buffering=false);video.addEventListener('error',()=>{this.error='Clip could not decode or load';video.pause();});}
 update(index,time,slot,active,playing){
  const v=this.video;this.active=active;this.wantPlaying=active&&playing;
  if(!active){v.pause();return;}
  if(index!==this.index){this.index=index;this.serial++;this.uploadedSerial=-1;this.uploadTime=-1;this.uploadFrame=-1;this.buffering=false;this.error='';this.pending=false;v.pause();v.src='assets/clips/'+CLIPS[index]+'.mp4';v.load();}
  if(this.error||v.readyState<1)return;
  const wanted=clipTime(time,slot),tolerance=playing?.18:1/48;
  if(!v.seeking&&loopDistance(v.currentTime,wanted)>tolerance){try{v.currentTime=wanted;}catch{this.error='Clip seek unavailable';return;}}
  if(!playing){v.pause();return;}
  if(v.paused&&!this.pending){const serial=this.serial;this.pending=true;try{Promise.resolve(v.play()).then(()=>{if(this.serial===serial){this.pending=false;if(!this.wantPlaying)v.pause();}},e=>{if(this.serial===serial){this.pending=false;if(this.wantPlaying&&e?.name!=='AbortError')this.error='Video playback blocked; press Play to retry';v.pause();}});}catch{this.pending=false;this.error='Video playback unavailable';}}
 }
 retry(){if(this.error.includes('playback'))this.error='';}
 stop(){this.active=false;this.wantPlaying=false;this.video.pause();}
 get ready(){return this.active&&!this.error&&(!this.wantPlaying||!this.buffering)&&this.video.readyState>=2&&!this.video.seeking&&this.uploadedSerial===this.serial;}
 upload(gl,handle){const v=this.video;if(!this.active||this.error||(this.wantPlaying&&this.buffering)||v.readyState<2||v.seeking)return;if(this.uploadedSerial===this.serial&&this.uploadFrame===Math.floor(v.currentTime*24))return;try{gl.bindTexture(gl.TEXTURE_2D,handle);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,v);this.uploadedSerial=this.serial;this.uploadTime=v.currentTime;this.uploadFrame=Math.floor(v.currentTime*24);}catch{this.error='Video texture unavailable';}}
 get state(){return {clip:this.index<0?null:CLIPS[this.index],ready:this.ready,active:this.active,paused:this.video.paused,buffering:this.buffering,error:this.error||null};}
}
