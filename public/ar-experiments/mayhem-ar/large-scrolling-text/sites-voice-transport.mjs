// The voice service is an owner-only Site. A top-level popup lets Sites
// authenticate its owner without exposing the ElevenLabs credential to the
// GitHub Pages reader or relying on third-party cookies.
export const VOICE_SITE_ORIGIN='https://mayhem-reader-voice-backend.mayhem82.chatgpt.site';
export function createSitesVoiceTransport({windowObj=globalThis.window,cryptoObj=globalThis.crypto,siteOrigin=VOICE_SITE_ORIGIN,
  readyTimeout=180000,requestTimeout=100000,pollInterval=500}={}) {
 if(!windowObj||!cryptoObj?.randomUUID||siteOrigin!==VOICE_SITE_ORIGIN)throw new Error('Secure voice connection is unavailable.');
 let popup=null,ready=false,connecting=null,disposed=false,poller=null,connectionTimer=null;
 const requests=new Map();
 const cleanConnect=()=>{if(poller!==null)clearInterval(poller);if(connectionTimer!==null)clearTimeout(connectionTimer);poller=null;connectionTimer=null;};
 function rejectAll(error){for(const [id,pending] of requests){clearTimeout(pending.timer);pending.signal?.removeEventListener('abort',pending.onAbort);pending.reject(error);requests.delete(id);}}
 function failConnection(error){ready=false;cleanConnect();if(connecting){const pending=connecting;connecting=null;pending.reject(error);}rejectAll(error);}
 function onMessage(event){
  if(disposed||event.origin!==siteOrigin||!popup||event.source!==popup)return;
  const data=event.data;if(!data||typeof data!=='object'||Array.isArray(data))return;
  if(data.type==='mayhem-voice-ready'){
   ready=true;if(connectionTimer!==null)clearTimeout(connectionTimer);connectionTimer=null;if(connecting){const pending=connecting;connecting=null;pending.resolve();}return;
  }
  if(data.type!=='mayhem-voice-response'||typeof data.id!=='string')return;
  const pending=requests.get(data.id);if(!pending)return;
  requests.delete(data.id);clearTimeout(pending.timer);pending.signal?.removeEventListener('abort',pending.onAbort);
  if(!Number.isInteger(data.status)||data.status<200||data.status>599||typeof data.ok!=='boolean'||data.ok!==(data.status<300)){
   pending.reject(new Error('The voice service returned an invalid response.'));return;
  }
  try{
   const body=data.ok?data.body:{error:typeof data.error==='string'?data.error.slice(0,300):'Voice request failed.'};
   const serialized=JSON.stringify(body);if(typeof serialized!=='string'||serialized.length>20000000)throw Error('Invalid response.');
   pending.resolve(new Response(serialized,{status:data.status,headers:{'Content-Type':'application/json'}}));
  }catch{pending.reject(new Error('The voice service returned an invalid response.'));}
 }
 windowObj.addEventListener('message',onMessage);
 function connect(){
  if(disposed)return Promise.reject(new Error('The voice connection is closed.'));
  if(ready&&popup&&!popup.closed)return Promise.resolve();
  if(connecting)return connecting.promise;
  ready=false;
  // Must be called directly within a user click, before any await.
  popup=windowObj.open(siteOrigin+'/', 'mayhem-reader-voice', 'popup,width=480,height=680');
  if(!popup)return Promise.reject(new Error('Allow the voice sign-in window, then try again.'));
  let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});connecting={promise,resolve,reject};
  poller=setInterval(()=>{if(popup?.closed)failConnection(new Error('The voice sign-in window was closed.'));},pollInterval);
  connectionTimer=setTimeout(()=>failConnection(new Error('Voice sign-in timed out. Please try again.')),readyTimeout);
  return promise;
 }
 async function request(url,options={}){
  if(disposed||!ready||!popup||popup.closed)throw new Error('Connect the voice service first.');
  const target=new URL(url),expected=new URL(siteOrigin);
  if(target.origin!==expected.origin||!['/tts','/preflight'].includes(target.pathname)||target.search||target.hash||options.method!=='POST')throw new Error('Invalid voice request.');
  if(typeof options.body!=='string'||new TextEncoder().encode(options.body).length>32000)throw new Error('Voice request is too large.');
  let body;try{body=JSON.parse(options.body);}catch{throw new Error('Invalid voice request.');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Invalid voice request.');
  const signal=options.signal;if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  const id=cryptoObj.randomUUID(),action=target.pathname.slice(1);
  return new Promise((resolve,reject)=>{
   const finishAbort=()=>{const pending=requests.get(id);if(!pending)return;requests.delete(id);clearTimeout(pending.timer);signal?.removeEventListener('abort',finishAbort);try{popup?.postMessage({type:'mayhem-voice-cancel',id},siteOrigin);}catch{}reject(new DOMException('Cancelled','AbortError'));};
   const timer=setTimeout(()=>{const pending=requests.get(id);if(!pending)return;requests.delete(id);signal?.removeEventListener('abort',finishAbort);try{popup?.postMessage({type:'mayhem-voice-cancel',id},siteOrigin);}catch{}reject(new Error('The voice service timed out.'));},requestTimeout);
   requests.set(id,{resolve,reject,timer,signal,onAbort:finishAbort});signal?.addEventListener('abort',finishAbort,{once:true});
   try{popup.postMessage({type:'mayhem-voice-request',id,action,body},siteOrigin);}catch{clearTimeout(timer);requests.delete(id);signal?.removeEventListener('abort',finishAbort);reject(new Error('Could not reach the voice service.'));}
  });
 }
 function close(){if(disposed)return;disposed=true;failConnection(new Error('The voice connection is closed.'));windowObj.removeEventListener('message',onMessage);try{popup?.close();}catch{}popup=null;}
 return {connect,request,close};
}
