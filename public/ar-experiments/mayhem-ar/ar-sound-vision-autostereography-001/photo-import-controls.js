import {decodePhoto,photoDepth} from './uploaded-photo.js';
import {generate} from './autostereogram.js';
const $=id=>document.getElementById(id);
export class PhotoImportControls{
 constructor({estimator,beforeEstimate=()=>{},onPlace=()=>{},onChange=()=>{},acceptPhoto=()=>{},decode=decodePhoto}){Object.assign(this,{estimator,beforeEstimate,onPlace,onChange,acceptPhoto,decode});this.revision=0;this.selection=0;this.photoSelection=-1;this.photo=null;this.result=null;this.phase='idle';this.selectedName='';this.view='pattern';
 $('upload-choose').onclick=()=>{$('upload-photo-file').value='';$('upload-photo-file').click();};
 $('upload-photo-file').onchange=()=>{const file=$('upload-photo-file').files[0];if(file)this.choose(file);};
 $('upload-clear').onclick=()=>this.clear();$('upload-retry').onclick=()=>this.estimate();
 $('upload-original').onclick=()=>{this.view='photo';this.draw();};$('upload-pattern').onclick=()=>{this.view='pattern';this.draw();};
 $('upload-mode').onchange=$('upload-period').oninput=()=>this.regenerate();
 $('upload-place').onclick=()=>{if(this.canUse)this.onPlace(this.result);};$('upload-save').onclick=()=>this.save();this.update();
 }
 get canUse(){return this.phase==='ready'&&!!this.result&&this.photoSelection===this.selection;}
 get busy(){return this.phase==='reading'||this.phase==='estimating';}
 options(){return {mode:$('upload-mode').value,percent:Number($('upload-period').value)};}
 pattern(depth){const opts=this.options(),period=Math.max(8,Math.round(depth.width*opts.percent/100));return generate(depth,{mode:opts.mode,period,strength:Math.max(1,Math.floor(period*.18)),seed:20261028});}
 say(text,error=false){$('upload-status').textContent=text;$('upload-status').dataset.error=String(error);}
 invalidate(){this.revision++;if(this.phase==='estimating')this.estimator.cancel();}
 async choose(file){this.invalidate();const token=this.revision;this.selection++;this.selectedName=file.name;this.phase='reading';this.say('Selected '+file.name+' — opening photo…');this.update();
 try{const photo=await this.decode(file);if(token!==this.revision)return;this.acceptPhoto(photo);this.photo=photo;this.photoSelection=this.selection;this.result=null;this.view='photo';this.draw();await this.estimate();}
 catch(e){if(token===this.revision){this.phase='error';this.say(e.message+(this.photo?' Previous photo kept.':''),true);this.update();}}
 }
 async estimate(){if(!this.photo||this.photoSelection!==this.selection)return;this.invalidate();const token=this.revision,photo=this.photo;this.beforeEstimate();this.phase='estimating';this.result=null;this.say(photo.name+' loaded — estimating depth on this device…');this.update();
 try{const result=await this.estimator.estimate(new Uint8Array(photo.rgba),photo.width,photo.height,stage=>{if(token===this.revision)this.say(photo.name+' — '+stage);});
 if(token!==this.revision||this.photo!==photo)return;
 const source={kind:'estimated',description:'MiDaS Small v2.1 estimated relative depth from uploaded photo (not measured)',input:'uploaded-photo',file:photo.name,coordinates:'uploaded-photo-top-left',encoding:'normalized-inverse-depth-nearness',model:'MiDaS Small v2.1',runtime:'ONNX Runtime Web 1.23.2 / WASM CPU / 1 thread',rawMin:result.rawMin,rawMax:result.rawMax,outputDims:result.outputDims,inferenceMs:result.inferenceMs,elapsedMs:result.elapsedMs};
 const depth=photoDepth(photo,{width:photo.width,height:photo.height,values:result.values},{source}),pattern=this.pattern(depth);this.result={photo,depth,pattern,options:this.options()};this.phase='ready';this.view='pattern';this.say('Ready: '+photo.name+' — '+photo.width+' × '+photo.height+' · '+this.result.options.mode+' autostereogram. No AR or camera capture was needed.');this.draw();this.update();
 }catch(e){if(token===this.revision){this.phase='error';this.view='photo';this.say(photo.name+' is loaded. Depth generation failed: '+e.message+'. Use Retry depth; your photo is kept.',true);this.draw();this.update();}}
 }
 regenerate(){if(this.canUse){try{this.result={...this.result,pattern:this.pattern(this.result.depth),options:this.options()};this.say('Ready: '+this.photo.name+' — '+this.result.options.mode+' autostereogram.');this.draw();}catch(e){this.say(e.message,true);}}this.update();}
 clear(){this.invalidate();this.phase='idle';this.selection++;this.photoSelection=-1;this.photo=null;this.result=null;this.selectedName='';$('upload-photo-file').value='';this.say('Choose a JPEG or PNG photo. Depth and the autostereogram are generated automatically.');this.draw();this.update();}
 update(){const matches=this.photo&&this.photoSelection===this.selection; $('upload-photo-name').textContent=this.selectedName||'No photo chosen';$('upload-preview-label').textContent=this.photo?this.photo.name+(matches?'':' — previous photo retained'):'';$('upload-period-value').textContent=$('upload-period').value+'%';
 $('upload-retry').disabled=!matches||this.busy;$('upload-place').disabled=$('upload-save').disabled=$('upload-pattern').disabled=!this.canUse;$('upload-original').disabled=!this.photo;$('upload-clear').disabled=!this.selectedName&&!this.photo;$('upload-card').setAttribute('aria-busy',String(this.busy));this.onChange();}
 draw(){const canvas=$('upload-preview'),data=this.view==='pattern'&&this.result?this.result.pattern:this.photo;canvas.hidden=!data;if(!data){canvas.width=canvas.height=1;return;}canvas.width=data.width;canvas.height=data.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data.rgba),data.width,data.height),0,0);$('upload-original').setAttribute('aria-pressed',String(this.view==='photo'));$('upload-pattern').setAttribute('aria-pressed',String(this.view==='pattern'));}
 async save(){const result=this.result;if(!this.canUse)return;const canvas=document.createElement('canvas');canvas.width=result.pattern.width;canvas.height=result.pattern.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(result.pattern.rgba),canvas.width,canvas.height),0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));canvas.width=canvas.height=0;if(!blob||this.result!==result)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=result.photo.name.replace(/\.[^.]*$/,'').replace(/[\\/:*?"<>|]/g,'_')+'-stereogram-'+result.options.mode+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
