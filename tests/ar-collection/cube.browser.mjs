const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const baseURL=process.env.AR_BASE_URL||'http://localhost:8765';
const outputDir=process.env.AR_OUTPUT_DIR||'/tmp/ar-validation';
await mkdir(outputDir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.AR_BROWSER||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
const page=await browser.newPage({viewport:{width:915,height:412}});
await page.goto(baseURL+'/ar-experiments/mayhem-ar/ar-colour-vision-001/index.html');
await page.waitForFunction(()=>window.ARColourApp);await page.click('#ar-preview');
assert.equal(await page.evaluate(()=>ARColourApp.state.items[0].kind),'cube');
const result=await page.evaluate(async()=>{
 const {ModelRenderer}=await import('./model.js');const {mat4}=await import('./vendor/js/render/math/gl-matrix.js');
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const gl=canvas.getContext('webgl2',{preserveDrawingBuffer:true});const renderer=new ModelRenderer(gl);
 const projection=mat4.create(),view=mat4.create(),model=mat4.create();mat4.perspective(projection,Math.PI/3,1,.05,100);mat4.lookAt(view,[3,3,4],[0,1,0],[0,1,0]);
 const source=document.createElement('canvas');source.width=source.height=2;const ctx=source.getContext('2d');
 const draw=(kind,colour)=>{ctx.fillStyle=colour;ctx.fillRect(0,0,2,2);renderer.upload(source);gl.viewport(0,0,128,128);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);renderer.draw(projection,view,[{kind,matrix:model}]);const pixels=new Uint8Array(128*128*4);gl.readPixels(0,0,128,128,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
 const red=draw('cube','red'),blue=draw('cube','blue'),oldRed=draw('gallery','red'),oldBlue=draw('gallery','blue');
 const diff=(a,b)=>a.reduce((sum,x,i)=>sum+(x!==b[i]),0);
 mat4.lookAt(view,[0,1,0],[0,1,-1],[0,1,0]);const interior=draw('cube','red');
 mat4.lookAt(view,[0,1,-4],[0,1,0],[0,1,0]);const exterior=draw('cube','red');
 const count=pixels=>pixels.filter((v,i)=>i%4===3&&v>0).length;
 return {interiorPixels:count(interior),exteriorPixels:count(exterior),cubeTextureDifference:diff(red,blue),galleryTextureDifference:diff(oldRed,oldBlue),drawnPixels:red.filter((v,i)=>i%4===3&&v>0).length,glError:gl.getError()};
});
assert.ok(result.interiorPixels>100);assert.ok(result.exteriorPixels>100);assert.equal(result.cubeTextureDifference,0);assert.ok(result.galleryTextureDifference>0);assert.ok(result.drawnPixels>100);assert.equal(result.glError,0);
await page.click('#ar-menu');await page.screenshot({path:outputDir+'/cube-landscape-hidden.png'});
console.log(JSON.stringify(result,null,2));

} finally { await browser.close(); }
