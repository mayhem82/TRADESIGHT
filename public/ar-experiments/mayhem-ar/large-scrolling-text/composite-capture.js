// A local-only compositor. The caller must supply an actual camera ImageData
// or camera canvas and an aligned, transparent scene canvas from one XR frame.
// This helper never requests camera access or reads the XR framebuffer itself.
export class CompositeCapture {
 constructor({canvas, cameraCanvas, MediaRecorderClass=globalThis.MediaRecorder, onEnded=()=>{}}={}){
  if(!canvas||!cameraCanvas)throw new Error('Capture canvases are unavailable.');
  this.canvas=canvas;this.cameraCanvas=cameraCanvas;
  this.context=canvas.getContext('2d');this.cameraContext=cameraCanvas.getContext('2d');
  if(!this.context||!this.cameraContext)throw new Error('Image capture is unavailable.');
  this.MediaRecorderClass=MediaRecorderClass;this.onEnded=onEnded;
  this.hasFrame=false;this.recorder=null;this.stream=null;this.chunks=[];this.pending=null;
  this.disposed=false;this.failure=null;
 }
 assertOpen(){if(this.disposed)throw new Error('Capture has ended.');}
 failFrame(message){
  this.hasFrame=false;
  if(this.recorder&&this.recorder.state!=='inactive'){
   this.failure=message;
   try{this.recorder.stop();}catch{}
   this.onEnded();
  }
  throw new Error(message);
 }
 // Input coordinates, dimensions, orientation and alpha must already match.
 // Opaque alpha in the scene would obscure the camera; responsibility for
 // ensuring the scene is transparent belongs to the renderer integration.
 frame(cameraImage,sceneCanvas){
  this.assertOpen();
  this.hasFrame=false;
  const w=cameraImage?.width,h=cameraImage?.height;
  const imageData=ArrayBuffer.isView(cameraImage?.data)&&cameraImage.data.length===w*h*4;
  const imageCanvas=typeof cameraImage?.getContext==='function';
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||(!imageData&&!imageCanvas)||cameraImage===sceneCanvas)
   this.failFrame('A live camera frame is unavailable.');
  if(!sceneCanvas||sceneCanvas.width!==w||sceneCanvas.height!==h)
   this.failFrame('The virtual scene is unavailable or does not match the camera frame.');
  if(this.recorder&&(this.canvas.width!==w||this.canvas.height!==h))this.failFrame('Capture size changed during recording. Stop and start a new recording.');
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  if(this.cameraCanvas.width!==w||this.cameraCanvas.height!==h){this.cameraCanvas.width=w;this.cameraCanvas.height=h;}
  try{
   if(imageData)this.cameraContext.putImageData(cameraImage,0,0);
   this.context.clearRect(0,0,w,h);
   this.context.globalCompositeOperation='source-over';
   this.context.drawImage(imageData?this.cameraCanvas:cameraImage,0,0);
   this.context.drawImage(sceneCanvas,0,0);
  }catch{this.failFrame('The camera and virtual scene could not be combined.');}
  this.hasFrame=true;
 }
 snapshot(){
  this.assertOpen();
  if(!this.hasFrame)return Promise.reject(new Error('A live AR frame is not available to photograph.'));
  if(typeof this.canvas.toBlob!=='function')return Promise.reject(new Error('Photo capture is unavailable on this device.'));
  return new Promise((resolve,reject)=>{
   try{this.canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The photo could not be created.')),'image/png');}
   catch{reject(new Error('The photo could not be created.'));}
  });
 }
 startRecording({frameRate=30}={}){
  this.assertOpen();
  if(!this.hasFrame)throw new Error('A live AR frame is not available to record.');
  if(this.recorder)throw new Error('A recording is already in progress.');
  const Recorder=this.MediaRecorderClass;
  if(typeof this.canvas.captureStream!=='function'||typeof Recorder!=='function')throw new Error('Video recording is unavailable on this device.');
  if(!Number.isFinite(frameRate)||frameRate<1||frameRate>60)throw new Error('Invalid recording frame rate.');
  let stream,recorder;
  try{
   stream=this.canvas.captureStream(frameRate);
   if(!stream?.getVideoTracks?.().length)throw new Error('missing video track');
   const choices=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];
   const mime=typeof Recorder.isTypeSupported==='function'?choices.find(type=>Recorder.isTypeSupported(type)):undefined;
   recorder=mime?new Recorder(stream,{mimeType:mime}):new Recorder(stream);
  }catch{stream?.getTracks?.().forEach(track=>track.stop());throw new Error('Video recording could not start.');}
  this.stream=stream;this.recorder=recorder;this.chunks=[];this.failure=null;
  this.pending=new Promise((resolve,reject)=>{
   recorder.ondataavailable=e=>{if(e.data?.size)this.chunks.push(e.data);};
   recorder.onerror=()=>{this.failure='Video recording failed.';};
   recorder.onstop=()=>{
    const chunks=this.chunks;this.chunks=[];const failure=this.failure;
    this.stream?.getTracks?.().forEach(track=>track.stop());this.stream=null;this.recorder=null;this.pending=null;
    if(failure)reject(new Error(failure));
    else if(!chunks.length)reject(new Error('The recording did not contain video.'));
    else resolve(new Blob(chunks,{type:recorder.mimeType||chunks[0].type||'video/webm'}));
   };
  });
  // Suppress unhandled rejection if a track ends before the caller awaits stop.
  this.pending.catch(()=>{});
  stream.getVideoTracks()[0].onended=()=>{if(this.recorder===recorder&&recorder.state!=='inactive'){this.failure='The video source ended.';recorder.stop();this.onEnded();}};
  try{recorder.start(1000);}catch{
   recorder.onstop=null;stream.getTracks().forEach(track=>track.stop());this.stream=null;this.recorder=null;this.pending=null;this.chunks=[];
   throw new Error('Video recording could not start.');
  }
 }
 stopRecording(){
  this.assertOpen();
  if(!this.recorder||!this.pending)return Promise.reject(new Error('No recording is in progress.'));
  const done=this.pending;
  if(this.recorder.state!=='inactive')try{this.recorder.stop();}catch{return Promise.reject(new Error('Video recording could not stop.'));}
  return done;
 }
 async dispose(){
  if(this.disposed)return;
  if(this.recorder&&this.pending){try{await this.stopRecording();}catch{}}
  this.stream?.getTracks?.().forEach(track=>track.stop());this.stream=null;this.recorder=null;this.pending=null;this.chunks=[];
  this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
  this.cameraContext.clearRect(0,0,this.cameraCanvas.width,this.cameraCanvas.height);
  this.hasFrame=false;this.disposed=true;
 }
}
