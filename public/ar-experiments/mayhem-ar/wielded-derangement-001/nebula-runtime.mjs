import {NebulaAudio,NebulaTriggers,triggerSettings} from './nebula-audio.mjs?v=nebula-camera-014';
import {NebulaParticles,particleSettings} from './nebula-particles.mjs?v=nebula-camera-014';
import {NebulaHardware} from './nebula-hardware.mjs?v=nebula-camera-014';
import {installNebulaControls} from './nebula-controls.mjs?v=nebula-camera-014';
import {CameraReadback} from './camera-readback.mjs?v=nebula-camera-014';
import {installCalibration} from './nebula-calibration.mjs?v=nebula-camera-014';
import {installCapture} from './nebula-capture.mjs?v=nebula-camera-014';
import {installSharing} from './nebula-sharing.mjs?v=nebula-camera-014';
export function hslRgb(h,s,l){h=((h%360)+360)%360/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return [f(0),f(8),f(4)];}
export class NebulaRuntime {
 constructor({song,effects,panel,cameraUI,getMode,getTrack}){this.song=song;this.effects=effects;this.cameraUI=cameraUI;this.getMode=getMode;this.getTrack=getTrack;this.audio=new NebulaAudio(song);this.triggers=new NebulaTriggers();this.hardware=new NebulaHardware();this.field=new NebulaParticles(document.createElement('canvas'));this.particles=particleSettings();this.triggerConfig=triggerSettings();this.source='song';this.micMode='voice';this.screenFlash=false;this.colourFlash=false;this.blackout=false;this.dim=false;this.inverted=false;this.paused=false;this.flash=null;this.levels={bass:0,mid:0,treble:0,volume:0,smoothed:{volume:0}};this.ui=installNebulaControls(panel,this);this.readback=new CameraReadback(effects);this.calibration=installCalibration(panel,effects,this.readback,this);this.capture=installCapture(panel,this.readback,this);this.sharing=installSharing(panel,this.readback,this);}
 enableCamera(){if(!this.effects.settings.enabled){this.effects.setSettings({...this.effects.settings,enabled:true});this.cameraUI.refresh?.();}}
 async startAudio(){const result=await this.audio.start(this.source,this.micMode);this.triggers.reset();return result;}
 stopAudio(){this.audio.stop();this.triggers.reset();}
 restart(){this.field.seed(this.particles.bands);this.triggers.reset();this.flash=null;this.audio.smooth={bass:0,mid:0,treble:0,volume:0};}
 pause(value){this.paused=value;this.triggers.reset();this.flash=null;if(value)this.hardware.stop();}
 testFlash(){this.enableCamera();this.fire({at:performance.now(),duration:120,strength:.6,source:'test'},false);}
 fire(event,hardware=true){const levels=this.levels,total=levels.bass+levels.mid+levels.treble||1,hue=this.particles.bands.reduce((sum,b)=>sum+b.hue*(levels[b.key]||0),0)/total;this.flash={...event,color:hslRgb(hue,(90-45*event.strength)/100,(65+27*event.strength)/100),black:event.strength>=.65};if(hardware){if(this.hardware.vibrationEnabled)this.hardware.pulseHaptics(event.strength);if(this.hardware.torchEnabled)this.hardware.pulseTorch(event.duration,{dim:this.dim,inverted:this.inverted});}if(this.colourFlash&&this.effects.points.count)this.onPointFlash?.(event);}
 update(now,width,height){this.hardware.attach(this.getTrack(),this.getMode());if(!this.paused){this.levels=this.audio.sample(now,this.particles.bands);if(this.screenFlash||this.colourFlash||this.hardware.torchEnabled||this.hardware.vibrationEnabled)for(const event of this.triggers.update(now,this.levels,this.triggerConfig,this.particles.bands.map(b=>b.hue)))this.fire(event);if(this.effects.settings.enabled)this.field.render(now,this.levels,this.particles,this.effects.settings,width,height);}
  let flashAlpha=0;if(!this.paused&&this.flash&&(this.screenFlash||this.flash.source==='test')){const u=Math.max(0,Math.min(1,(now-this.flash.at)/(this.flash.duration+60)));flashAlpha=(.45+.4*this.flash.strength)*(1-u)**2;}
  this.calibration.update(now);this.capture.update();this.sharing.update();this.effects.setRuntime({particleCanvas:this.field.canvas,particleRevision:this.field.revision,particlesEnabled:this.effects.settings.enabled&&this.particles.enabled,flashColor:this.flash?.color||[1,1,1],flashAlpha,flashBlack:!!this.flash?.black,blackout:this.blackout});this.ui.update();
 }
 suspend(){this.capture.stop();this.sharing.stop();this.readback.cancel();this.calibration.stop();this.stopAudio();this.hardware.stop();this.flash=null;this.triggers.reset();this.effects.setRuntime({});this.ui.update();}
 get state(){return {captureStatus:this.capture.capture.status,sharingStatus:this.sharing.sharing.status,readbackStatus:this.readback.status,audioActive:this.audio.active,audioSource:this.source,micMode:this.micMode,audioStatus:this.audio.status,particlesEnabled:this.particles.enabled,particleCount:this.field.particles.length,paused:this.paused,hardwareStatus:this.hardware.status,torchArmed:this.hardware.torchEnabled,hapticsArmed:this.hardware.vibrationEnabled,levels:{bass:this.levels.bass,mid:this.levels.mid,treble:this.levels.treble,volume:this.levels.volume}};}
}
