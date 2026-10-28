// Single worker/session; no network endpoint receives photos. All URLs are local.
export class DepthEstimator {
 constructor(){this.worker=null;this.pending=null;this.sequence=0;}
 cancel(){this.worker?.terminate();this.worker=null;if(this.pending)this.pending.reject(Error('Depth estimation cancelled'));this.pending=null;}
 estimate(pixels,width,height,onProgress){if(this.pending)this.cancel();if(!this.worker){this.worker=new Worker(new URL('./midas-worker.js',document.baseURI),{type:'module'});this.worker.onmessage=({data})=>{const job=this.pending;if(!job||job.id!==data.id)return;if(data.stage){job.onProgress(data.stage);return;}this.pending=null;if(data.error)job.reject(Error(data.error));else job.resolve(data);};this.worker.onerror=e=>{this.pending?.reject(Error('Depth worker failed: '+e.message));this.pending=null;this.worker?.terminate();this.worker=null;};}return new Promise((resolve,reject)=>{const id=++this.sequence;this.pending={id,resolve,reject,onProgress};this.worker.postMessage({id,pixels,width,height},[pixels.buffer]);});}
}
