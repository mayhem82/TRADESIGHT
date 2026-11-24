import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Execute the actual bundled Worker in a Workers-like global scope without
// Node's process, Buffer or module loader. The SDK must not rely on them.
let calls=0;
const context=vm.createContext({TextEncoder,TextDecoder,URL,URLSearchParams,Request,Response,Headers,ReadableStream,AbortController,crypto,setTimeout,clearTimeout,console,
 fetch:async()=>{calls++;return new Response(JSON.stringify({audio_base64:'YQ==',alignment:{characters:['a'],character_start_times_seconds:[0],character_end_times_seconds:[1]}}));}});
const source=readFileSync('dist/server/index.js','utf8');
const m=new vm.SourceTextModule(source,{context});
await m.link(()=>{throw Error('Unexpected external import in Worker bundle.');});await m.evaluate();
const worker=m.namespace.default,db={prepare(){return {bind(){return {async first(){return {requests:1,characters:1};}}}}}};
const origin='https://backend.example',request=new Request(origin+'/tts',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','oai-authenticated-user-email':'owner@example.test'},body:JSON.stringify({text:'a'})});
const response=await worker.fetch(request,{DB:db,ELEVENLABS_API_KEY:'test-only-key'});
assert.equal(response.status,200);assert.equal(calls,1);assert.equal((await response.json()).audio_base64,'YQ==');
console.log('Bundled Worker passed in a Workers-like global scope.');
