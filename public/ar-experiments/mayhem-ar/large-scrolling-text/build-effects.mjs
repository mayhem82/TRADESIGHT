import fs from 'node:fs';
const base='public/ar-experiments/mayhem-ar/';
const original=base+'ar-colour-vision-001/';
const dest=base+'large-scrolling-text/';
let html=fs.readFileSync(original+'index.html','utf8');
html=html.replace('<head>','<head><base href="../ar-colour-vision-001/"><meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: blob:; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; connect-src \'none\'">');
html=html.replace('<script src="colorvision.js"></script>','<script src="../large-scrolling-text/effects-engine.js"></script>');
html=html.replace('<script type="module" src="ar.js"></script>','').replace('<script src="../collection-controls.js" defer></script>','');
html=html.replace('</head>','<style>#stage,#particleCanvas{pointer-events:none} #overlay,#photoBtn,#shareCaptureBtn,#recordFpsWrap,#recordBtn,#timelapseIntervalWrap,#timelapseFpsWrap,#timelapseBtn,#connectTabletBtn,#castBtn,#correctAnimatedBtn,#floatingPhotoBtn,#floatingRecordBtn,#floatingTimelapseBtn,#hud a{display:none!important}</style></head>');
html=html.replace('<script src="colour-math.js"></script>','<script>for(const id of ["beatScreenFlashCheckbox","beatTorchInvertedCheckbox"]){const el=document.getElementById(id);el.disabled=true;el.title="Not available in this AR reader";}const note=document.createElement("p");note.textContent="Beat screen flash and XR torch control are unavailable in this reader. Other effect controls are separate for Writing and Environment.";document.getElementById("hud").prepend(note);</script><script src="colour-math.js"></script>');
html=html.replace(/[ \t]+$/gm,'');
let js=fs.readFileSync(original+'colorvision.js','utf8');
const marker='  "use strict";';
if(!js.includes(marker))throw Error('Original engine marker missing');
js=js.replace(marker,marker+'\n  const localStorage = (()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};})();\n  const RTCPeerConnection = class { constructor(){throw new Error("Sharing is disabled in the reader");} };');
for(const name of ['takePhoto','startRecording','startTimelapseCapture']) {
  const signature='function '+name+'() {';
  if(!js.includes(signature))throw Error('Missing privacy guard: '+name);
  js=js.replace(signature,signature+' return;');
}
// Preserve the external frame aspect for pixel-space effects such as outlines.
// Both independent engines use their own source canvas dimensions.
for(const [oldText,newText] of [
 ['stage.width = externalFrame ? 512 : Math.round(window.innerWidth * dpr);','stage.width = externalFrame ? externalFrame.width : Math.round(window.innerWidth * dpr);'],
 ['stage.height = externalFrame ? 512 : Math.round(window.innerHeight * dpr);','stage.height = externalFrame ? externalFrame.height : Math.round(window.innerHeight * dpr);'],
 ['particleCanvas.width = Math.round(window.innerWidth * dpr);','particleCanvas.width = externalFrame ? stage.width : Math.round(window.innerWidth * dpr);'],
 ['particleCanvas.height = Math.round(window.innerHeight * dpr);','particleCanvas.height = externalFrame ? stage.height : Math.round(window.innerHeight * dpr);'],
 ['const minDim = Math.min(window.innerWidth, window.innerHeight);','const minDim = externalFrame ? Math.min(stage.width, stage.height) : Math.min(window.innerWidth, window.innerHeight);'],
 ['const dpr = w / window.innerWidth || 1;','const dpr = externalFrame ? 1 : (w / window.innerWidth || 1);'],
 ['render(){renderLoop();return stage;}','render(){if(externalFrame&&(stage.width!==externalFrame.width||stage.height!==externalFrame.height))resizeStage();renderLoop();return stage;}']
]){if(!js.includes(oldText))throw Error('Missing engine aspect marker: '+oldText);js=js.replace(oldText,newText);}
fs.writeFileSync(dest+'effects.html',html);
fs.writeFileSync(dest+'effects-engine.js',js);
// A writing-only copy preserves the alpha of the actual text render, extending
// it only where the original outline/cartoon edge algorithms emit a stroke.
// The unmodified environment engine remains fully independent.
const opaque='gl_FragColor = vec4(finalColor, 1.0);';
const sample='vec3 original = texture2D(uTex, vUv).rgb;';
const context='canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: true })';
for(const [name,part] of [['fragment output',opaque],['source sample',sample],['context',context]])if(!js.includes(part))throw Error('Missing writing engine '+name);
let writing=js.replace(context,'canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false })');
writing=writing.replace(sample,'vec4 writingSource = texture2D(uTex, vUv); vec3 original = writingSource.rgb;');
writing=writing.replace(opaque,`float writingAlpha = writingSource.a;
      if (uCartoonEnabled > 0.5) writingAlpha = max(writingAlpha, cvCartoonLine(vUv, uCartoonEdgeThickness, uCartoonEdgeStrength));
      if (uOutlineEnabled > 0.5) writingAlpha = max(writingAlpha, clamp(cvEdgeStrength(vUv, uOutlineThickness) * uOutlineOpacity * uOutlineBlend, 0.0, 1.0));
      gl_FragColor = vec4(finalColor, writingAlpha);`);
fs.writeFileSync(dest+'writing-effects-engine.js',writing);
fs.writeFileSync(dest+'writing-effects.html',html.replace('effects-engine.js','writing-effects-engine.js'));
