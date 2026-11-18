import { analyseFrame } from './vision-core.mjs';
import { GeologicalIndicatorScanner } from './indicator-scanner.mjs';
const indicators = new GeologicalIndicatorScanner({ sampleStep: 3 });
self.onmessage = ({ data }) => {
  try {
    const result = analyseFrame(data.frame, data.enabled);
    const extra = indicators.scanFrame(data.frame);
    for (let i=0;i<extra.mask.length;i+=4) if(extra.mask[i+3]) result.mask.set(extra.mask.subarray(i,i+4),i);
    result.cues.push(...extra.cues.map((cue,index)=>({...cue,id:result.cues.length+index+1})));
    result.glareWarning=extra.glareWarning;
    self.postMessage({ id: data.id, result }, [result.mask.buffer]);
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message });
  }
};
