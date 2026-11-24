import {TextToSpeechClient} from '@elevenlabs/elevenlabs-js/api/resources/textToSpeech/client/Client.js';
// Owner-private Sites backend for the GitHub MAYHEM reader.
// No post, generated audio, API credential, or OAuth token is persisted here.
const READER_ORIGIN='https://mayhem82.github.io';
const VOICE='J7IZPeXZZnf0YubmrB7u';
const DAY_REQUESTS=20,DAY_CHARACTERS=30000,MAX_CHARS=5000,MAX_BODY=32000,MAX_RESPONSE=20000000;
const noStore={'Cache-Control':'no-store, private','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{...noStore,'Content-Type':'application/json; charset=utf-8'}});
const goodInt=n=>Number.isSafeInteger(n)&&n>0;
async function readJson(request,limit){
 const declared=request.headers.get('Content-Length');
 if(declared&&(!/^\d+$/.test(declared)||Number(declared)>limit))throw new RangeError('body');
 const reader=request.body?.getReader();if(!reader)throw new TypeError('body');
 const chunks=[];let total=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel().catch(()=>{});throw new RangeError('body');}chunks.push(value);}}finally{reader.releaseLock();}
 const data=new Uint8Array(total);let pos=0;for(const part of chunks){data.set(part,pos);pos+=part.byteLength;}
 return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));
}
function validAlignment(a){
 const c=a?.characters,s=a?.character_start_times_seconds,e=a?.character_end_times_seconds;
 return Array.isArray(c)&&c.length>0&&Array.isArray(s)&&Array.isArray(e)&&c.length===s.length&&c.length===e.length&&c.every(x=>typeof x==='string')&&s.every((x,i)=>Number.isFinite(x)&&x>=0&&(!i||x>=s[i-1]))&&e.every((x,i)=>Number.isFinite(x)&&x>=s[i]);
}
function wireAlignment(a){return a?{characters:a.characters,character_start_times_seconds:a.characterStartTimesSeconds,character_end_times_seconds:a.characterEndTimesSeconds}:null;}
function networkFailure(error){
 const allowed=['TypeError','AbortError','TimeoutError','NetworkError','Error'];
 const name=allowed.includes(error?.name)?error.name:'Other';
 const message=typeof error?.message==='string'?error.message:'';
 const kind=/\b(dns|resolve|resolver|enotfound)\b/i.test(message)?'dns':
  /\b(tls|ssl|certificate|cert)\b/i.test(message)?'tls':
  /\b(subrequests|rate.?limit|too many)\b/i.test(message)?'limit':
  /\b(denied|disallowed|blocked|prohibited|restrict(?:ed|ion)?)\b/i.test(message)?'blocked':
  /\b(invalid|unsupported|not supported)\b/i.test(message)?'invalid-request':
  /\b(reset|refused|unreachable|network|connect(?:ion)?)\b/i.test(message)?'connection':
  /\b(timeout|timed out)\b/i.test(message)?'timeout':'other';
 return {name,kind};
}
// Bound the SDK response while it is read; don't first buffer an unbounded
// upstream body. ElevenLabs errors are sanitised by the caller below.
async function boundedFetch(url,init,trace){
 trace.stage='network-pending';let response;
 // Workers does not implement Fetch's `redirect: error`; manual plus explicit
 // rejection prevents forwarding the API key to any redirected destination.
 try{response=await fetch(url,{...init,redirect:'manual'});}catch(e){trace.stage='network-failed';trace.networkFailure=networkFailure(e);throw e;}
 trace.stage='http-response';trace.providerStatus=response.status;
 if(response.status>=300&&response.status<400){trace.stage='redirect-blocked';await response.body?.cancel().catch(()=>{});throw new Error('Redirect blocked.');}
 const size=response.headers.get('Content-Length');
 if(size&&(!/^\d+$/.test(size)||Number(size)>MAX_RESPONSE)){trace.stage='response-too-large';await response.body?.cancel().catch(()=>{});throw new Error('Response too large.');}
 if(!response.body)return response;
 const reader=response.body.getReader();let total=0;
 const bounded=new ReadableStream({async pull(controller){try{const {done,value}=await reader.read();if(done){controller.close();return;}total+=value.byteLength;if(total>MAX_RESPONSE){await reader.cancel().catch(()=>{});controller.error(new Error('Response too large.'));return;}controller.enqueue(value);}catch(e){controller.error(e);}},cancel(){return reader.cancel();}});
 return new Response(bounded,{status:response.status,statusText:response.statusText,headers:response.headers});
}
async function checkQuota(db,characters,requests,consume=false){
 const day=new Date().toISOString().slice(0,10);
 if(!consume){
  if(requests>DAY_REQUESTS||characters>DAY_CHARACTERS)return false;
  const q=await db.prepare('SELECT requests, characters FROM voice_quota WHERE day = ?').bind(day).first();
  return !q||(q.requests+requests<=DAY_REQUESTS&&q.characters+characters<=DAY_CHARACTERS);
 }
 // A single atomic statement is the authoritative quota check, including
 // concurrent requests. Only counts are stored; no writing or audio.
 const q=await db.prepare('INSERT INTO voice_quota (day, requests, characters) VALUES (?, 1, ?) ON CONFLICT(day) DO UPDATE SET requests = requests + 1, characters = characters + excluded.characters WHERE requests + 1 <= ? AND characters + excluded.characters <= ? RETURNING requests').bind(day,characters,DAY_REQUESTS,DAY_CHARACTERS).first();
 return !!q;
}
function bridgePage(){
 const nonce=crypto.randomUUID();
 const script=`(()=>{'use strict';const origin=${JSON.stringify(READER_ORIGIN)};let active=null;const seen=new Set();
 const out=(id,result)=>{if(window.opener)window.opener.postMessage({type:'mayhem-voice-response',id,...result},origin)};
 const ready=()=>{if(window.opener)window.opener.postMessage({type:'mayhem-voice-ready'},origin)};
 const status=document.getElementById('status');if(!window.opener){status.textContent='Open this connection from your MAYHEM reader.';return;}
 ready();const readyTimer=setInterval(ready,1000);
 window.addEventListener('message',async e=>{
  const d=e.data;if(e.origin!==origin||e.source!==window.opener||!d||typeof d.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(d.id))return;
  if(d.type==='mayhem-voice-cancel'){if(active?.id===d.id)active.controller.abort();return;}
  if(d.type!=='mayhem-voice-request'||!['preflight','tts'].includes(d.action)||seen.has(d.id))return;
  clearInterval(readyTimer);seen.add(d.id);if(seen.size>128)seen.delete(seen.values().next().value);
  if(active){out(d.id,{ok:false,status:429,error:'Voice service is busy.'});return;}
  let payload;try{payload=JSON.stringify(d.body);}catch{out(d.id,{ok:false,status:400,error:'Invalid request.'});return;}
  const b=d.body,valid=b&&typeof b==='object'&&!Array.isArray(b)&&payload.length<=32000&&
   (d.action==='preflight'?Object.keys(b).length===2&&Number.isSafeInteger(b.characters)&&b.characters>0&&Number.isSafeInteger(b.requests)&&b.requests>0:
   Object.keys(b).length===1&&typeof b.text==='string'&&b.text.trim()&&[...b.text].length<=5000);
  if(!valid){out(d.id,{ok:false,status:400,error:'Invalid request.'});return;}
  const controller=new AbortController();active={id:d.id,controller};
  try{const r=await fetch('/'+d.action,{method:'POST',headers:{'Content-Type':'application/json'},body:payload,cache:'no-store',credentials:'same-origin',signal:controller.signal});let body;try{body=await r.json()}catch{throw Error('invalid response')}
   out(d.id,r.ok?{ok:true,status:r.status,body}:{ok:false,status:r.status,error:typeof body?.error==='string'?body.error:'Voice request failed.'});
  }catch{out(d.id,{ok:false,status:controller.signal.aborted?499:502,error:controller.signal.aborted?'Voice request cancelled.':'Voice request failed.'})}finally{active=null;}
 });window.addEventListener('pagehide',()=>{clearInterval(readyTimer);active?.controller.abort()});})();`;
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAYHEM voice connection</title><style>body{font:18px/1.5 system-ui;max-width:36rem;margin:3rem auto;padding:0 1rem;background:#10242b;color:#f5fff9}h1{font-size:1.7rem}</style></head><body><h1>MAYHEM voice connection</h1><p id="status">Voice connection is open. Return to the reader and leave this window open while preparing speech.</p><script nonce="'+nonce+'">'+script+'</script></body></html>';
 return new Response(html,{headers:{...noStore,'Content-Type':'text/html; charset=utf-8','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; script-src 'nonce-"+nonce+"'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}});
}
async function makeSpeech(text,env,signal,trace){
 trace.stage='sdk-init';
 const client=new TextToSpeechClient({apiKey:env.ELEVENLABS_API_KEY,fetch:(url,init)=>boundedFetch(url,init,trace),maxRetries:0,timeoutInSeconds:90});
 trace.stage='sdk-call';
 const data=await client.convertWithTimestamps(VOICE,{text,modelId:'eleven_multilingual_v2'},{abortSignal:signal,maxRetries:0,timeoutInSeconds:90});
 trace.stage='sdk-response-parsed';
 const alignment=wireAlignment(data.alignment),normalized=wireAlignment(data.normalizedAlignment);
 if(typeof data.audioBase64!=='string'||!data.audioBase64||data.audioBase64.length>18000000||!validAlignment(alignment))return null;
 return {audio_base64:data.audioBase64,alignment,normalized_alignment:validAlignment(normalized)?normalized:null};
}
export default {async fetch(request,env){
 // Sites dispatch owns sign-in. Service-bypass tokens do not carry user
 // identity and must not be enough to spend the owner's ElevenLabs credits.
 const url=new URL(request.url);
 // /diagnostic is a fixed-phrase, server-to-server check. It deliberately
 // relies on Sites' verified owner-private dispatch boundary because the
 // supported service-bypass credential is consumed before reaching Worker.
 // It must never be deployed on a public Site. Browser-origin calls fail.
 const diagnostic=url.pathname==='/diagnostic';
 // Sites' owner-private dispatcher is the access boundary and injects the
 // authenticated identity. Some signed-in sessions expose the email field
 // without the per-Site ID, so accept either trusted, non-empty field.
 const owner=request.headers.get('oai-authenticated-user-id')?.trim()||request.headers.get('oai-authenticated-user-email')?.trim();
 if(!owner&&!diagnostic)return json(401,{error:'Sign in to the private voice connection.'});
 if(request.method==='GET'&&url.pathname==='/')return bridgePage();
 if(!['/tts','/preflight','/diagnostic'].includes(url.pathname))return json(404,{error:'Not found.'});
 if(request.method!=='POST')return json(405,{error:'Method not allowed.'});
 if(diagnostic?request.headers.has('Origin'):(request.headers.get('Origin')!==url.origin||!['same-origin',null].includes(request.headers.get('Sec-Fetch-Site'))))return json(403,{error:'Origin not allowed.'});
 if(!env.DB||typeof env.ELEVENLABS_API_KEY!=='string'||!env.ELEVENLABS_API_KEY)return json(503,{error:'Voice service is not configured.'});
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type')||''))return json(415,{error:'Expected JSON.'});
 let body;try{body=await readJson(request,MAX_BODY);}catch(e){return json(e instanceof RangeError?413:400,{error:'Invalid request.'});}
 if(!body||Array.isArray(body)||typeof body!=='object')return json(400,{error:'Invalid request.'});
 if(diagnostic&&Object.keys(body).length)return json(400,{error:'Invalid request.'});
 if(url.pathname==='/preflight'){
  if(Object.keys(body).some(k=>!['characters','requests'].includes(k))||!goodInt(body.characters)||!goodInt(body.requests))return json(400,{error:'Invalid narration size.'});
  try{return await checkQuota(env.DB,body.characters,body.requests)?json(200,{available:true}):json(429,{error:'Daily voice quota exceeded.'});}catch{return json(503,{error:'Voice quota is unavailable.'});}
 }
 if(!diagnostic&&(Object.keys(body).some(k=>k!=='text')||typeof body.text!=='string'||!body.text.trim()||[...body.text].length>MAX_CHARS))return json(400,{error:'Provide non-empty text within the request limit.'});
 const text=diagnostic?'This is a voice connection test.':body.text;
 try{if(!await checkQuota(env.DB,[...text].length,1,true))return json(429,{error:'Daily voice quota exceeded.'});}catch{return json(503,{error:'Voice quota is unavailable.'});}
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),90000),cancel=()=>abort.abort(),trace={stage:'before-sdk',providerStatus:null,networkFailure:null};request.signal?.addEventListener('abort',cancel,{once:true});
 try{
  const data=await makeSpeech(text,env,abort.signal,trace);
  if(!data)return json(502,diagnostic?{error:'Voice response is incomplete.',provider_status:trace.providerStatus,failure_stage:trace.stage}:{error:'Voice response is incomplete.'});
  return diagnostic?json(200,{ok:true,alignment:true}):json(200,data);
 }catch(e){
  const providerStatus=[200,400,401,403,404,405,409,413,422,429,500,502,503,504].includes(e?.statusCode)?e.statusCode:[200,400,401,403,404,405,409,413,422,429,500,502,503,504].includes(trace.providerStatus)?trace.providerStatus:null;
  const result={error:abort.signal.aborted?'Voice service unavailable.':providerStatus===429?'Voice service rate limit reached.':'Voice service request failed.'};
  // Only the owner-private, fixed-text diagnostic reveals the numeric status;
  // provider body, text, key and raw error details are never returned.
  if(diagnostic){result.provider_status=providerStatus;result.failure_stage=trace.stage;if(trace.networkFailure)result.network_failure=trace.networkFailure;}
  return json(abort.signal.aborted?504:providerStatus===429?429:502,result);
 }finally{clearTimeout(timer);request.signal?.removeEventListener('abort',cancel);}
}};
