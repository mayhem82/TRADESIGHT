const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=__dirname;
async function main(){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'vendor-manifest.json'),'utf8').replace(/^\uFEFF/,''));
  for(const asset of manifest){const bytes=fs.readFileSync(path.join(root,asset.path));assert.equal(bytes.length,asset.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
  console.log(`PASS: ${manifest.length} downloaded asset sizes and SHA-256 hashes`);
  const cv=await new Promise(resolve=>require('./opencv-outline/vendor/opencv-4.13.0.js').then(cv=>resolve({cv}))).then(x=>x.cv && x);
  const c=cv.cv, image=c.Mat.zeros(80,80,c.CV_8UC1),edges=new c.Mat();
  c.rectangle(image,new c.Point(20,20),new c.Point(60,60),new c.Scalar(255),-1);c.Canny(image,edges,60,120);
  assert.equal(c.countNonZero(edges),160);image.delete();edges.delete();
  assert.match(c.getBuildInformation(),/OpenCV 4\.13\.0/);console.log('PASS: official OpenCV 4.13.0 runtime, synthetic square yields 160 edge pixels');
  let requests=0,stops=0,resolveCamera;
  const elements=new Map(),ctx={getImageData:()=>({data:new Uint8Array(16)}),drawImage(){}};
  const element=id=>{if(!elements.has(id))elements.set(id,{disabled:false,value:id==='threshold'?'60':'environment',hidden:false,width:2,height:2,getContext:()=>ctx,pause(){},play:async()=>{}});return elements.get(id);};
  const fakeCV={Mat:function(){this.data=new Uint8Array(16);this.delete=()=>{};},Size:function(){},cvtColor(){},GaussianBlur(){},Canny(){},imshow(){}};
  const context={document:{getElementById:element,querySelector:()=>({addEventListener(){}}),createElement:()=>({}),head:{append(script){context.window.cv={then:callback=>callback(fakeCV)};script.onload();}},addEventListener(){}},window:{addEventListener(){}},navigator:{mediaDevices:{getUserMedia(){requests++;return new Promise(resolve=>resolveCamera=resolve);}}},isSecureContext:true,setTimeout,clearTimeout,URL};
  vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'opencv-outline/app.js'),'utf8'),context);
  assert.equal(requests,0);const start=element('start').onclick();await new Promise(resolve=>setImmediate(resolve));assert.equal(requests,1);
  element('stop').onclick();resolveCamera({getTracks:()=>[{stop(){stops++;}}]});await start;assert.equal(stops,1);assert.equal(element('start').disabled,false);
  console.log('PASS: OpenCV requests no camera on load; Start requests once; Stop cancels and releases a late permission result; legacy thenable loader completes');
  const ar=fs.readFileSync(path.join(root,'ar-marker/app.js'),'utf8');
  const arContext={document:{getElementById:element,querySelector:()=>({addEventListener(){}}),addEventListener(){}},window:{addEventListener(){}},cancelAnimationFrame(){},requestAnimationFrame(){},navigator:context.navigator,isSecureContext:true,setTimeout,clearTimeout};
  vm.createContext(arContext);vm.runInContext(ar,arContext);assert.equal(requests,1);element('stop').onclick();assert.equal(requests,1);
  console.log('PASS: AR page setup and Stop do not request camera (tracking rendering remains untested)');
  process.env.PORT='0';const server=require('./serve.cjs');if(!server.listening)await new Promise(resolve=>server.once('listening',resolve));
  try{const base=`http://127.0.0.1:${server.address().port}`;for(const file of ['/', '/opencv-outline/','/ar-marker/','/ar-marker/print-marker.html',...manifest.map(x=>'/'+x.path)]){const response=await fetch(base+file);assert.equal(response.status,200,file);await response.arrayBuffer();if(/\.(js|mjs)$/.test(file))assert.match(response.headers.get('content-type'),/javascript/);}
  console.log('PASS: localhost HTTP routes, all vendor files and JavaScript module MIME types');}finally{server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
