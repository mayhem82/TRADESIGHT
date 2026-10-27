const $ = id => document.getElementById(id);
const original = $('original'), outline = $('outline'), video = $('video');
const ctx = original.getContext('2d', {willReadFrequently:true});
let cvReady, stream, timer, epoch = 0, mats, captureURL;
const status = text => $('status').textContent = text;
document.querySelector('details').addEventListener('toggle',event=>{document.querySelector('summary').textContent=event.target.open?'Hide controls & limits':'Show controls & limits';});
function loadCV() {
  if (cvReady) return cvReady;
  cvReady = new Promise((resolve,reject) => {
    const script = document.createElement('script');
    script.src = './vendor/opencv-4.13.0.js';
    script.onerror = () => reject(new Error('OpenCV could not load. Check local vendor files.'));
    script.onload = () => {
      // This official build is a legacy self-resolving thenable. Wrap it to
      // avoid Promise/await recursively assimilating the module forever.
      const ready = cv => {if (!cv.Mat) reject(new Error('OpenCV runtime unavailable')); else resolve({cv});};
      try {if(typeof window.cv?.then === 'function')window.cv.then(ready);else ready(window.cv);}
      catch(error) {reject(error);}
    };
    document.head.append(script);
  }).catch(error => {cvReady = null; throw error;});
  return cvReady;
}
function releaseMats() { if(mats) Object.values(mats).forEach(mat => mat.delete()); mats = null; }
function stop(message='Stopped. Camera released.') {
  epoch++; clearTimeout(timer); stream?.getTracks().forEach(track => track.stop());
  stream = null; video.pause(); video.srcObject = null; releaseMats();
  $('start').disabled = false; $('stop').disabled = true; $('sample').disabled = false; status(message);
}
function edges(cv) {
  if(!mats) mats = {rgba:new cv.Mat(original.height,original.width,cv.CV_8UC4), gray:new cv.Mat(), blur:new cv.Mat(), edges:new cv.Mat()};
  mats.rgba.data.set(ctx.getImageData(0,0,original.width,original.height).data);
  cv.cvtColor(mats.rgba,mats.gray,cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(mats.gray,mats.blur,new cv.Size(5,5),0,0,cv.BORDER_DEFAULT);
  const low = Number($('threshold').value);
  cv.Canny(mats.blur,mats.edges,low,low*2,3,false);
  cv.imshow(outline,mats.edges); $('capture').disabled = false;
}
$('start').onclick = async () => {
  stop('Loading OpenCV…'); const run = epoch;
  $('start').disabled = true; $('stop').disabled = false; $('sample').disabled = true;
  try {
    if(!isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('Camera requires HTTPS or localhost.');
    const {cv} = await loadCV(); if(run !== epoch) return;
    status('Waiting for camera permission…');
    const incoming = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:$('facing').value},width:{ideal:640},height:{ideal:480}}});
    if(run !== epoch) {incoming.getTracks().forEach(t=>t.stop()); return;}
    stream = incoming; video.srcObject = stream; await video.play(); if(run !== epoch) return;
    original.width = Math.min(480,video.videoWidth); original.height = Math.round(original.width*video.videoHeight/video.videoWidth);
    status('Live. Frames stay on this device.');
    const frame = () => { if(run !== epoch) return; try {ctx.drawImage(video,0,0,original.width,original.height); edges(cv); timer=setTimeout(frame,83);} catch(error){stop(error.message);} }; frame();
  } catch(error) {if(run === epoch) stop(`${error.name || 'Error'}: ${error.message}`);}
};
$('stop').onclick = () => stop();
$('sample').onclick = async () => {
  stop('Loading sample…'); const run=epoch; $('sample').disabled=true;
  try {const {cv}=await loadCV(); if(run!==epoch)return; original.width=480;original.height=360;
    ctx.fillStyle='#eee';ctx.fillRect(0,0,480,360);ctx.fillStyle='#172735';ctx.fillRect(50,55,150,150);ctx.beginPath();ctx.arc(330,180,75,0,Math.PI*2);ctx.fill();
    edges(cv);releaseMats();status('Sample processed. No camera was requested.');
  }catch(error){if(run===epoch)stop(error.message);} finally{if(run===epoch)$('sample').disabled=false;}
};
$('threshold').oninput = () => $('thresholdValue').value = $('threshold').value;
$('capture').onclick = () => {
  const canvas=document.createElement('canvas'); canvas.width=original.width*2;canvas.height=original.height;
  const context=canvas.getContext('2d'); context.drawImage(original,0,0);context.drawImage(outline,original.width,0,original.width,original.height);
  canvas.toBlob(blob=>{if(!blob)return;if(captureURL)URL.revokeObjectURL(captureURL);captureURL=URL.createObjectURL(blob);const link=$('download');link.href=captureURL;link.download='opencv-comparison.png';link.hidden=false;status('Capture ready. Tap Save captured PNG.');},'image/png');
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('Paused when hidden. Press Start to resume.');});
window.addEventListener('pagehide',()=>{stop();if(captureURL)URL.revokeObjectURL(captureURL);});
