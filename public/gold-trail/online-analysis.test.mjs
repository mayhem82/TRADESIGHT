import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateEndpoint,validateAnalysis,onlineRequestActive} from './online-analysis.mjs';
test('online endpoint requires a plain HTTPS service URL',()=>{assert.equal(validateEndpoint('https://example.org/api/photo-analysis'),'https://example.org/api/photo-analysis');for(const u of ['http://example.org/','https://u:p@example.org/','https://example.org/?token=secret','https://example.org/#x','not a url'])assert.equal(validateEndpoint(u),null)});
test('online result requires bounded text in each evidence category',()=>{const r={provider:'OpenAI',model:'test',observations:['Grey surface'],interpretations:['Possible rock'],checks:['Inspect texture'],unknowns:['Mineral identity']};assert.equal(validateAnalysis(r),r);assert.throws(()=>validateAnalysis({...r,checks:[{html:'bad'}]}));assert.throws(()=>validateAnalysis({...r,unknowns:undefined}));assert.throws(()=>validateAnalysis({...r,observations:['x'.repeat(1201)]}));});

test('stale results are ignored and timed-out requests are reported',()=>{const c=new AbortController();assert.equal(onlineRequestActive(1,2,c.signal),false);assert.equal(onlineRequestActive(1,1,c.signal),true);c.abort();assert.throws(()=>onlineRequestActive(1,1,c.signal),{name:'AbortError'});assert.equal(onlineRequestActive(1,2,c.signal),false)});
