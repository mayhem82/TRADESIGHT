import { analyseFrame } from './vision-core.mjs';
self.onmessage = ({ data }) => {
  try {
    const result = analyseFrame(data.frame, data.enabled);
    self.postMessage({ id: data.id, result }, [result.mask.buffer]);
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message });
  }
};
