import {photoDepth} from './uploaded-photo.js';
import {generate} from './autostereogram.js';
import {rectify} from './depth-contract.js';
import {DepthEstimator} from './depth-estimator.js';
const $=s=>document.querySelector(s);
export function photoPixels(wall,shot){const g=wall.gl,bottom=new Uint8Array(shot.width*shot.pixelHeight*4),top=new Uint8ClampedArray(bottom.length);wall.renderer.withState(()=>{g.bindFramebuffer(g.FRAMEBUFFER,shot.framebuffer);g.readPixels(0,0,shot.width,shot.pixelHeight,g.RGBA,g.UNSIGNED_BYTE,bottom);if(g.getError())throw Error('Original photo readback failed');});const stride=shot.width*4;for(let y=0;y<shot.pixelHeight;y++)top.set(bottom.subarray((shot.pixelHeight-1-y)*stride,(shot.pixelHeight-y)*stride),y*stride);return top;}
export class StereoControls {
 constructor({getWall,stop}){this.getWall=getWall;this.stop=stop;this.pending={mode:'crossed',percent:11};this.ticket=0;this.message='';this.lastWall=null;this.lastShot=null;this.estimator=new DepthEstimator();this.estimationTicket=0;
  $('#estimate-depth').onclick=()=>this.estimateLatest();
  $('#auto-depth').onchange=()=>{if(!$('#auto-depth').checked)this.cancelEstimation();};
  for(const [id,surface] of [['surface-photo','photo'],['surface-pattern','pattern'],['surface-capture','capture']])$('#'+id).onclick=()=>{stop();const w=getWall()?.active;if(!w)return this.say('Place a wall first',true);if(surface!=='capture'&&!w.stereo)return this.say('Supply an aligned depth map first. The original photo is kept.',true);w.surface=surface;this.message='';this.update();};
  $('#stereo-mode').onchange=()=>this.optionsChanged();$('#stereo-period').oninput=()=>this.optionsChanged();
  $('#depth-file').onchange=()=>{const file=$('#depth-file').files[0];if(file)this.importMap(file);$('#apply-depth').disabled=!file||!getWall()?.views.length;};
  $('#apply-depth').onclick=()=>{const file=$('#depth-file').files[0];if(file)this.importMap(file);};
  $('#export-photo').onclick=()=>{stop();try{const wall=getWall(),shot=wall?.views.at(-1);if(!shot)throw Error('Capture a photo first');const pixels=photoPixels(wall,shot),canvas=document.createElement('canvas');canvas.width=shot.width;canvas.height=shot.pixelHeight;canvas.getContext('2d').putImageData(new ImageData(pixels,shot.width,shot.pixelHeight),0,0);canvas.toBlob(blob=>{if(!blob)return this.say('PNG export failed',true);const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ar-sound-vision-wall-'+wall.activeId+'-photo-'+shot.id+'-'+shot.width+'x'+shot.pixelHeight+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');this.say('Original photo '+shot.id+' exported: '+shot.width+' × '+shot.pixelHeight+'. Supply a matching depth map.');}catch(e){this.say(e.message,true);}};
 }
 cancelEstimation(){this.estimationTicket++;this.estimator.cancel();this.estimating=null;this.message='';}
 captured(shot){if($('#auto-depth').checked)this.estimateLatest(shot);}
 async estimateLatest(requestedShot){this.stop();const wall=this.getWall(),w=wall?.active,shot=requestedShot||w?.views.at(-1),ticket=++this.estimationTicket;
  try{if(!shot)throw Error('Capture a photo first');this.estimating={w,shot};const photo=photoPixels(wall,shot),pixels=new Uint8Array(photo);this.say('Loading local depth estimator…');
   const result=await this.estimator.estimate(pixels,shot.width,shot.pixelHeight,stage=>{if(ticket===this.estimationTicket)this.say(stage);});
   if(ticket!==this.estimationTicket||!wall.items.includes(w)||!w.views.includes(shot))return;
   const source={kind:'estimated',description:'MiDaS Small v2.1 estimated relative depth (not measured)',model:'Intel ISL MiDaS v2_1/model-small.onnx',runtime:'Microsoft ONNX Runtime Web 1.23.2 / WASM CPU / 1 thread',photoId:shot.id,wallId:w.id,coordinates:'full-camera-top-left',encoding:'normalized-inverse-depth-nearness',captureWidth:shot.width,captureHeight:shot.pixelHeight,elapsedMs:result.elapsedMs,inferenceMs:result.inferenceMs,rawMin:result.rawMin,rawMax:result.rawMax,outputDims:result.outputDims,inputNames:result.inputNames,outputNames:result.outputNames};
   const depth=shot.sourceKind==='uploaded'?photoDepth({width:shot.width,height:shot.pixelHeight,rgba:photo},{width:shot.width,height:shot.pixelHeight,values:result.values},{source:{...source,input:'uploaded-photo',coordinates:'uploaded-photo-top-left'}}):rectify(shot,photo,{width:shot.width,height:shot.pixelHeight,values:result.values},{source}),surface=w.stereo?w.surface:"pattern";wall.setStereo(depth,generate(depth,this.patternOptions(depth,this.options(w))),shot,w);w.surface=surface;this.estimating=null;this.message='';this.update();
  }catch(e){if(ticket===this.estimationTicket){this.estimating=null;this.say('Automatic depth failed: '+e.message+'. Original photo and existing surface kept; retry or supply depth.',true);}}
 }
 options(w=this.getWall()?.active){if(!w)return this.pending;return w.stereoOptions??=( {...this.pending});}
 patternOptions(depth,opts){const period=Math.max(8,Math.round(depth.width*opts.percent/100));return {mode:opts.mode,period,strength:Math.max(1,Math.floor(period*.18)),seed:20261028};}
 optionsChanged(){this.stop();const w=this.getWall()?.active,opts={mode:$('#stereo-mode').value,percent:Number($('#stereo-period').value)};if(w)w.stereoOptions=opts;else this.pending=opts;
  try{if(w?.stereo){const {depth,shot}=w.stereo,surface=w.surface;this.getWall().setStereo(depth,generate(depth,this.patternOptions(depth,opts)),shot);w.surface=surface;}this.message='';this.update();}catch(e){this.say(e.message,true);}
 }
 say(message,error=false){this.message=message;$('#stereo-status').textContent=message;$('#stereo-status').dataset.error=String(error);}
 async importMap(file){this.stop();this.cancelEstimation();const wall=this.getWall(),w=wall?.active,shot=w?.views.at(-1),ticket=++this.ticket;
  try{if(!shot)throw Error('Capture a photo first');if(!$('#depth-confirm').checked)throw Error('Confirm that this depth map matches the latest exported photo');if(file.type!=='image/png'||file.size>16*1024*1024)throw Error('Choose a PNG depth map of at most 16 MiB');
   this.say('Reading supplied depth map for Wall '+w.id+', photo '+shot.id+'…');const image=await createImageBitmap(file);
   try{if(image.width!==shot.width||image.height!==shot.pixelHeight)throw Error('Map dimensions must match photo '+shot.id+': '+shot.width+' × '+shot.pixelHeight);const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const map=ctx.getImageData(0,0,image.width,image.height);
    if(ticket!==this.ticket||wall.active!==w||!w.views.includes(shot)||w.views.at(-1)!==shot)throw Error('Wall/photo selection changed while loading; import the map again for the selected photo');
    const source={kind:'supplied',description:'User-supplied depth map (not measured or inferred here)',file:file.name,photoId:shot.id,wallId:w.id,coordinates:'full-camera-top-left',encoding:'white-near-black-far',captureWidth:shot.width,captureHeight:shot.pixelHeight};
    const photo=photoPixels(wall,shot),depth=shot.sourceKind==='uploaded'?photoDepth({width:shot.width,height:shot.pixelHeight,rgba:photo},map,{source:{...source,coordinates:'uploaded-photo-top-left'}}):rectify(shot,photo,map,{source}),pattern=generate(depth,this.patternOptions(depth,this.options(w)));
    wall.setStereo(depth,pattern,shot);this.message='';this.update();
   }finally{image.close();}
  }catch(e){this.say(e.message+'. Existing wall data kept.',true);}
 }
 update(){const wall=this.getWall(),w=wall?.active,shot=w?.views.at(-1),opts=this.options(w);
  if(w!==this.lastWall||shot!==this.lastShot){$('#depth-confirm').checked=false;this.message='';$('#stereo-status').dataset.error='false';this.lastWall=w;this.lastShot=shot;}
  $('#stereo-mode').value=opts.mode;$('#stereo-period').value=opts.percent;$('#stereo-period-value').textContent=opts.percent+'% wall width';
  for(const [id,surface] of [['surface-photo','photo'],['surface-pattern','pattern'],['surface-capture','capture']]){$('#'+id).setAttribute('aria-pressed',String((w?.surface||'capture')===surface));$('#'+id).disabled=!w||(surface!=='capture'&&!w.stereo);}
  $('#depth-file').disabled=$('#depth-confirm').disabled=!shot;$('#apply-depth').disabled=!shot||!$('#depth-file').files.length;$('#surface-capture').textContent=shot?.sourceKind==='uploaded'?'Uploaded original':'Capture baseline';
  $('#export-photo').disabled=!shot;
  $('#estimate-depth').disabled=!shot||!!this.estimating;
  if(!this.message)$('#stereo-status').textContent=this.estimating?'Estimating photo '+this.estimating.shot.id+' on this device…':w?.stereo?'Wall '+w.id+': '+w.surface+' · '+w.stereo.pattern.mode+' · '+w.stereo.depth.source.kind+' depth for photo '+w.stereo.shot.id+'. Frozen through movement and rotation.':shot?'Photo '+shot.id+' stored ('+shot.width+' × '+shot.pixelHeight+'). Estimate depth or supply its matching depth PNG.':'Capture a photo to estimate depth locally, or supply its aligned depth map.';
 }
}
export class NearControl {
 constructor(){this.value=0;this.pointer=null;this.node=null;for(const [id,value] of [['wall-nearer',1],['wall-farther',-1]]){const node=$('#'+id);node.addEventListener('pointerdown',e=>{if(this.pointer!==null)return;e.preventDefault();e.stopPropagation();this.pointer=e.pointerId;this.node=node;this.value=value;node.setPointerCapture(e.pointerId);});for(const type of ['pointerup','pointercancel','lostpointercapture'])node.addEventListener(type,e=>{if(e.pointerId===this.pointer){e.preventDefault();this.stop();}});node.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();this.value=value;}});node.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();this.stop();}});node.addEventListener('blur',()=>this.stop());node.addEventListener('beforexrselect',e=>e.preventDefault());}window.addEventListener('blur',()=>this.stop());document.addEventListener('visibilitychange',()=>this.stop());}
 stop(){const node=this.node,id=this.pointer;this.value=0;this.pointer=null;this.node=null;if(node&&id!==null&&node.hasPointerCapture(id))try{node.releasePointerCapture(id);}catch{}}
}
