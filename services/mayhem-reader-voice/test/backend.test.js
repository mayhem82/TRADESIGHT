import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
const worker=(await import(process.env.TEST_DIST==='1'?'../dist/server/index.js':'../worker/index.js')).default;

const ORIGIN='https://mayhem-reader-voice-backend.mayhem82.chatgpt.site';
function database(){
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE voice_quota(day TEXT PRIMARY KEY NOT NULL,requests INTEGER NOT NULL,characters INTEGER NOT NULL)');
 return {prepare(sql){return {bind(...args){return {async first(){return db.prepare(sql).get(...args)||null;}}}}}};
}
const env=()=>({DB:database(),ELEVENLABS_API_KEY:'test-not-a-real-key'});
function request(path,body,{owner=true,origin=ORIGIN,method='POST'}={}){
 const headers={'Origin':origin,'Content-Type':'application/json'};if(owner)headers['oai-authenticated-user-id']='test-owner';
 return new Request(ORIGIN+path,{method,headers,...(body===undefined?{}:{body:JSON.stringify(body)})});
}
test('requires authenticated owner and server-side configuration',async()=>{
 const e=env();assert.equal((await worker.fetch(request('/tts',{text:'Test'},{owner:false}),e)).status,401);
 assert.equal((await worker.fetch(request('/tts',{text:'Test'}),{DB:e.DB})).status,503);
 assert.equal((await worker.fetch(request('/tts',{text:'Test'},{origin:'https://evil.example'}),e)).status,403);
});
test('accepts the private Sites dispatcher identity by ID or email and rejects blank values',async()=>{
 const e=env();
 for(const [header,value,expected] of [['oai-authenticated-user-id','test-owner',200],['oai-authenticated-user-email','owner@example.test',200],['oai-authenticated-user-email','  ',401]]){
  const r=await worker.fetch(new Request(ORIGIN+'/',{headers:{[header]:value}}),e);assert.equal(r.status,expected);
 }
});
test('bridge is owner-private and constrains popup communication',async()=>{
 const denied=await worker.fetch(new Request(ORIGIN+'/'),env());assert.equal(denied.status,401);
 const ok=await worker.fetch(new Request(ORIGIN+'/',{headers:{'oai-authenticated-user-id':'test-owner'}}),env());assert.equal(ok.status,200);
 assert.match(ok.headers.get('content-security-policy'),/frame-ancestors 'none'/);const html=await ok.text();
 assert.match(html,/e\.origin!==origin/);assert.match(html,/e\.source!==window\.opener/);assert.match(html,/mayhem-voice-cancel/);assert.doesNotMatch(html,/test-not-a-real-key/);
});
test('preflight checks full-post quota without consuming it',async()=>{
 const e=env();for(let i=0;i<3;i++)assert.equal((await worker.fetch(request('/preflight',{characters:30000,requests:20}),e)).status,200);
 assert.equal((await worker.fetch(request('/preflight',{characters:30001,requests:1}),e)).status,429);
 assert.equal((await worker.fetch(request('/preflight',{characters:2,requests:1,extra:'bad'}),e)).status,400);
});
test('speech uses selected voice and keeps key and writing out of responses on failure',async()=>{
 const e=env(),prior=globalThis.fetch;let called=0;
 globalThis.fetch=async(url,options)=>{called++;assert.match(String(url),/J7IZPeXZZnf0YubmrB7u\/with-timestamps$/);assert.equal(options.redirect,'manual');assert.equal(new Headers(options.headers).get('xi-api-key'),'test-not-a-real-key');return new Response(JSON.stringify({audio_base64:'YWJj',alignment:{characters:['X'],character_start_times_seconds:[0],character_end_times_seconds:[1]}}),{headers:{'Content-Type':'application/json'}})};
 try{
  const result=await worker.fetch(request('/tts',{text:'X'}),e);assert.equal(result.status,200);assert.equal((await result.json()).audio_base64,'YWJj');assert.equal(called,1);
  globalThis.fetch=async()=>new Response('private upstream response',{status:401});const failed=await worker.fetch(request('/tts',{text:'private text'}),e);const text=await failed.text();assert.equal(failed.status,502);assert.doesNotMatch(text,/private|test-not-a-real-key/);
 }finally{globalThis.fetch=prior;}
});
test('atomically enforces daily request and character counts',async()=>{
 const e=env(),prior=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({audio_base64:'YQ==',alignment:{characters:['a'],character_start_times_seconds:[0],character_end_times_seconds:[1]}}));
 try{for(let i=0;i<20;i++)assert.equal((await worker.fetch(request('/tts',{text:'a'}),e)).status,200);assert.equal((await worker.fetch(request('/tts',{text:'a'}),e)).status,429);assert.equal((await worker.fetch(request('/preflight',{characters:1,requests:1}),e)).status,429);}finally{globalThis.fetch=prior;}
});
test('private diagnostic sends only a fixed neutral phrase and returns no audio or key',async()=>{
 const e=env(),prior=globalThis.fetch;let count=0;
 globalThis.fetch=async(url,options)=>{count++;assert.equal(JSON.parse(options.body).text,'This is a voice connection test.');return new Response(JSON.stringify({audio_base64:'YQ==',alignment:{characters:['a'],character_start_times_seconds:[0],character_end_times_seconds:[1]}}));};
 try{
  const make=(headers,body='{}',method='POST')=>new Request(ORIGIN+'/diagnostic',{method,headers,...(method==='POST'?{body}:{})});
  assert.equal((await worker.fetch(make({'Content-Type':'application/json',Origin:'https://evil.example'}),e)).status,403);
  assert.equal((await worker.fetch(make({'Content-Type':'application/json'},JSON.stringify({text:'private'})),e)).status,400);
  assert.equal((await worker.fetch(make({},undefined,'GET'),e)).status,405);
  const r=await worker.fetch(make({'Content-Type':'application/json'}),e);assert.equal(r.status,200);
  const raw=await r.text();assert.deepEqual(JSON.parse(raw),{ok:true,alignment:true});assert.doesNotMatch(raw,/YQ==|test-not-a-real-key/);assert.equal(count,1);
 }finally{globalThis.fetch=prior;}
});
test('SDK does not retry a billed 429 and returns a sanitized error',async()=>{
 const e=env(),prior=globalThis.fetch;let count=0;
 globalThis.fetch=async()=>{count++;return new Response('private response',{status:429});};
 try{const r=await worker.fetch(request('/tts',{text:'Test'}),e);assert.equal(r.status,429);assert.equal(count,1);assert.doesNotMatch(await r.text(),/private/);}finally{globalThis.fetch=prior;}
});
test('private diagnostic reports only a safe upstream HTTP status on provider failure',async()=>{
 const e=env(),prior=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({detail:'private diagnostic details'}),{status:401,headers:{'Content-Type':'application/json'}});
 try{const r=await worker.fetch(new Request(ORIGIN+'/diagnostic',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),e);assert.equal(r.status,502);const raw=await r.text();assert.equal(JSON.parse(raw).provider_status,401);assert.doesNotMatch(raw,/private diagnostic details|test-not-a-real-key/);}finally{globalThis.fetch=prior;}
});
test('private diagnostic classifies network failure without returning its raw message',async()=>{
 const e=env(),prior=globalThis.fetch,priorTimer=globalThis.setTimeout;
 // The SDK's own timeout remains scheduled after a rejected fetch. Unref it
 // in this test so the test runner needn't wait 90 seconds to exit.
 globalThis.setTimeout=(fn,ms,...args)=>{const timer=priorTimer(fn,ms,...args);if(ms>=90000)timer.unref();return timer;};
 globalThis.fetch=async()=>{throw new TypeError('DNS resolver failed; private diagnostic details');};
 try{const r=await worker.fetch(new Request(ORIGIN+'/diagnostic',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),e);assert.equal(r.status,502);const raw=await r.text(),body=JSON.parse(raw);assert.equal(body.provider_status,null);assert.equal(body.failure_stage,'network-failed');assert.deepEqual(body.network_failure,{name:'TypeError',kind:'dns'});assert.doesNotMatch(raw,/private diagnostic details|test-not-a-real-key/);}finally{globalThis.fetch=prior;globalThis.setTimeout=priorTimer;}
});
test('provider redirects are rejected and the secret is never forwarded',async()=>{
 const e=env(),prior=globalThis.fetch,priorTimer=globalThis.setTimeout;let count=0;
 globalThis.setTimeout=(fn,ms,...args)=>{const t=priorTimer(fn,ms,...args);if(ms>=90000)t.unref();return t;};
 globalThis.fetch=async(_url,options)=>{count++;assert.equal(options.redirect,'manual');return new Response(null,{status:302,headers:{Location:'https://attacker.example/'}});};
 try{const r=await worker.fetch(new Request(ORIGIN+'/diagnostic',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),e);assert.equal(r.status,502);const text=await r.text();assert.equal(JSON.parse(text).failure_stage,'redirect-blocked');assert.equal(count,1);assert.doesNotMatch(text,/attacker|test-not-a-real-key/);}finally{globalThis.fetch=prior;globalThis.setTimeout=priorTimer;}
});
