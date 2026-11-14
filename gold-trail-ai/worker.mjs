// Optional Gold Trail analysis service. No image or credential logging.
const MAX_BODY=4_300_000, MAX_IMAGE=3*1024*1024;
const keys=['observations','interpretations','checks','unknowns'];
const systemPrompt='You are assisting a field geologist. Describe only visible evidence; separate tentative alternatives from observations. Provide discriminating field checks and unresolved questions. Do not assert mineral identity, gold content, ore grade, access permission or confidence percentages from a photograph. Recognize landscaping or man-made materials when plausible. Do not infer location, drainage or unseen geology. Be specific and concise.';
function headers(origin){return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin','Cache-Control':'no-store','Content-Type':'application/json','X-Content-Type-Options':'nosniff'};}
function reply(status,message,origin){return new Response(JSON.stringify({error:message}),{status,headers:headers(origin)});}
async function sameSecret(a,b){const enc=new TextEncoder();const x=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(a))),y=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(b)));let d=0;for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0;}
async function readLimited(request){const length=Number(request.headers.get('content-length'));if(Number.isFinite(length)&&length>MAX_BODY)throw Error('large');if(!request.body)throw Error('body');const reader=request.body.getReader();const chunks=[];let total=0;while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BODY){await reader.cancel();throw Error('large');}chunks.push(value);}const bytes=new Uint8Array(total);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
function validImage(image){if(typeof image!=='string'||!image.startsWith('data:image/jpeg;base64,'))return false;const b64=image.slice(23);if(!b64||b64.length>Math.ceil(MAX_IMAGE/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(b64))return false;try{const b=atob(b64);return b.length<=MAX_IMAGE&&b.length>=4&&b.charCodeAt(0)===255&&b.charCodeAt(1)===216&&b.charCodeAt(b.length-2)===255&&b.charCodeAt(b.length-1)===217;}catch{return false;}}
function validAnalysis(value){return value&&typeof value==='object'&&keys.every(k=>Array.isArray(value[k])&&value[k].length<=12&&value[k].every(x=>typeof x==='string'&&x.trim()&&x.length<=1200))&&Object.keys(value).length===keys.length;}
const schema={type:'object',additionalProperties:false,required:keys,properties:Object.fromEntries(keys.map(k=>[k,{type:'array',items:{type:'string'}}]))};
export class PhotoQuota {
  constructor(state,env){this.state=state;this.env=env;}
  async fetch(request){if(request.method!=='POST')return new Response(null,{status:405});const limit=Number(this.env.DAILY_LIMIT);if(!Number.isInteger(limit)||limit<1||limit>1000)return new Response(null,{status:503});return this.state.blockConcurrencyWhile(async()=>{const today=new Date().toISOString().slice(0,10);const record=await this.state.storage.get('daily');const count=record?.day===today?record.count:0;if(count>=limit)return new Response(null,{status:429});await this.state.storage.put('daily',{day:today,count:count+1});return new Response(null,{status:204});});}
}
export default { async fetch(request,env) {
  let allowed;try{const u=new URL(env.ALLOWED_ORIGIN);if(u.protocol!=='https:'||u.origin!==env.ALLOWED_ORIGIN)throw Error();allowed=u.origin;}catch{return reply(503,'Service is not configured.','null');}
  const origin=request.headers.get('Origin');if(origin!==allowed)return reply(403,'Origin not allowed.','null');
  const url=new URL(request.url);if(url.pathname!=='/api/photo-analysis')return reply(404,'Not found.',allowed);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:headers(allowed)});
  if(request.method!=='POST')return reply(405,'Method not allowed.',allowed);
  if(typeof env.ACCESS_CODE!=='string'||env.ACCESS_CODE.length<32||typeof env.OPENAI_API_KEY!=='string'||!env.OPENAI_API_KEY||typeof env.OPENAI_MODEL!=='string'||!env.OPENAI_MODEL||!env.PHOTO_QUOTA)return reply(503,'Service is not configured.',allowed);
  const auth=request.headers.get('Authorization')||'';if(!auth.startsWith('Bearer ')||!await sameSecret(auth.slice(7),env.ACCESS_CODE))return reply(401,'Access denied.',allowed);
  if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return reply(415,'JSON required.',allowed);
  let payload;try{payload=JSON.parse(await readLimited(request));}catch{return reply(400,'Invalid or oversized request.',allowed);}
  if(!payload||Array.isArray(payload)||Object.keys(payload).length!==1||!validImage(payload.image))return reply(400,'A valid JPEG image is required.',allowed);
  try{const quota=env.PHOTO_QUOTA.get(env.PHOTO_QUOTA.idFromName('global'));const reserve=await quota.fetch('https://quota.internal/reserve',{method:'POST'});if(!reserve.ok)return reply(reserve.status===429?429:503,reserve.status===429?'Usage limit reached.':'Service unavailable.',allowed);}catch{return reply(503,'Service unavailable.',allowed);}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
  try{
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({model:env.OPENAI_MODEL,store:false,max_output_tokens:1800,instructions:systemPrompt,input:[{role:'user',content:[{type:'input_text',text:'Review this field photograph using the required evidence categories.'},{type:'input_image',image_url:payload.image,detail:'high'}]}],text:{format:{type:'json_schema',name:'geology_photo_review',strict:true,schema}}})});
    if(!response.ok)return reply(502,'AI provider unavailable.',allowed);const data=await response.json();if(data.status!=='completed')return reply(502,'AI provider returned an incomplete result.',allowed);
    const content=(data.output||[]).flatMap(item=>item.content||[]).find(item=>item.type==='output_text');let result;try{result=JSON.parse(content?.text);}catch{return reply(502,'AI provider returned an invalid result.',allowed);}
    if(!validAnalysis(result))return reply(502,'AI provider returned an invalid result.',allowed);
    return new Response(JSON.stringify({provider:'OpenAI',model:env.OPENAI_MODEL,...result}),{status:200,headers:headers(allowed)});
  }catch{return reply(502,'AI provider unavailable.',allowed);}finally{clearTimeout(timer);}
} };
