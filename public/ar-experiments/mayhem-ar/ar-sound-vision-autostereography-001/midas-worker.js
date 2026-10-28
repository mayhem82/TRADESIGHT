import * as ort from './vendor/ort/ort.wasm.min.mjs';
import {preprocess,normalizeInverseDepth} from './midas-preprocess.js';
ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;ort.env.wasm.wasmPaths=new URL('./vendor/ort/',import.meta.url).href;
let session=null;
self.onmessage=async({data})=>{const {id,width,height,pixels}=data;let input=null,outputs=null;const started=performance.now();
 try{self.postMessage({id,stage:'Loading local MiDaS Small model (63.7 MiB); first use may take time'});session??=await ort.InferenceSession.create(new URL('./models/midas-small-v2_1.onnx',import.meta.url).href,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  self.postMessage({id,stage:'Estimating relative depth on this device (WASM CPU)'});input=new ort.Tensor('float32',preprocess(pixels,width,height),[1,3,256,256]);const runStart=performance.now();outputs=await session.run({[session.inputNames[0]]:input});const inferenceMs=performance.now()-runStart;const raw=outputs[session.outputNames[0]];if(raw.data.length!==256*256)throw Error('Unexpected MiDaS output shape: '+raw.dims);
  const normalized=normalizeInverseDepth(raw.data,width,height),elapsedMs=performance.now()-started;
  self.postMessage({id,values:normalized.values,width,height,rawMin:normalized.rawMin,rawMax:normalized.rawMax,elapsedMs,inferenceMs,inputNames:session.inputNames,outputNames:session.outputNames,outputDims:raw.dims},[normalized.values.buffer]);
 }catch(e){self.postMessage({id,error:e.message||String(e)});}finally{input?.dispose();if(outputs)for(const value of Object.values(outputs))value.dispose();}
};
