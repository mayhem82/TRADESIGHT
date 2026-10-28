export function groundSample(matrix,time=0) {
  if(!matrix||matrix.length!==16||!Array.from(matrix).every(Number.isFinite))return null;
  const length=Math.hypot(matrix[4],matrix[5],matrix[6]);if(length<.001)return null;
  const nx=matrix[4]/length,ny=matrix[5]/length,nz=matrix[6]/length;
  if(ny<Math.cos(Math.PI/4))return null;
  return {x:matrix[12],y:matrix[13],z:matrix[14],nx,ny,nz,time};
}
export function heightOnGround(sample,x,z) {return sample.y-(sample.nx*(x-sample.x)+sample.nz*(z-sample.z))/sample.ny;}
export class GroundFollower {
  constructor() {
    this.enabled=true;this.samples=[];this.scanMap=new Map();this.routeHint=null;this.now=0;this.epoch=0;this.source=null;this.pending=false;this.session=null;this.space=null;this.actor=null;this.want=null;this.lastRequest=-Infinity;this.sourcePoint=null;this.error='';
    try{this.enabled=localStorage.getItem('yowie-follow-slopes')!=='false';}catch{}
    for(const input of document.querySelectorAll('[data-follow-slopes]')){input.checked=this.enabled;input.addEventListener('change',()=>{
      this.enabled=input.checked;if(!this.enabled){this.epoch++;this.cancel(this.source);this.source=null;this.pending=false;}this.lastRequest=-Infinity;for(const other of document.querySelectorAll('[data-follow-slopes]'))other.checked=this.enabled;
      try{localStorage.setItem('yowie-follow-slopes',String(this.enabled));}catch{}
    });}
  }
  cancel(source) {try{source?.cancel();}catch{}}
  start(session,space) {this.end();this.session=session;this.space=space;this.error='';}
  place(actor,matrix) {this.actor=actor;this.want=null;this.samples=[];const sample=groundSample(matrix,this.now);if(sample){this.samples.push(sample);this.remember(sample);}}
  end() {this.epoch++;this.cancel(this.source);this.source=null;this.pending=false;this.session=null;this.space=null;this.actor=null;this.want=null;this.samples=[];this.lastRequest=-Infinity;this.sourcePoint=null;this.scanMap.clear();this.routeHint=null;}
  add(matrix) {
    const sample=groundSample(matrix,this.now);if(!sample)return false;
    this.samples=this.samples.filter(s=>this.now-s.time<1600&&Math.hypot(s.x-sample.x,s.z-sample.z)>.025);this.samples.push(sample);this.remember(sample);if(this.samples.length>24)this.samples.shift();return true;
  }
  remember(sample) {
    const key=Math.floor(sample.x/.2)+','+Math.floor(sample.z/.2)+','+Math.round(sample.y/.25);
    const fresh=!this.scanMap.has(key);this.scanMap.set(key,sample);
    if(this.scanMap.size>1500)this.scanMap.delete(this.scanMap.keys().next().value);
    return fresh;
  }
  recordScan(matrix) {const sample=groundSample(matrix,this.now);return sample?{sample,fresh:this.remember(sample)}:null;}
  update(frame,time,viewerMatrix,tracking=true) {
    this.now=time;if(!this.enabled||!this.actor||!tracking||!this.session)return;
    const position=this.actor.matrix,target=this.want||{x:position[12],y:position[13],z:position[14]};
    if(viewerMatrix&&Math.hypot(viewerMatrix[12]-target.x,viewerMatrix[14]-target.z)<.35)this.add(viewerMatrix);
    if(this.source){try{for(const hit of frame.getHitTestResults(this.source)){
      const pose=hit.getPose(this.space);if(!pose)continue;const m=pose.transform.matrix;
      if(this.sourcePoint&&Math.hypot(m[12]-this.sourcePoint.x,m[14]-this.sourcePoint.z)<.12&&this.add(m))break;
    }}catch{this.cancel(this.source);this.source=null;}}
    const moved=!this.sourcePoint||Math.hypot(target.x-this.sourcePoint.x,target.z-this.sourcePoint.z)>.06;
    if(!this.pending&&time-this.lastRequest>(this.error?1500:150)&&(moved||time-this.lastRequest>750))this.request(target);
  }
  request(target) {
    this.lastRequest=this.now;
    if(typeof XRRay!=='function'){this.error='Ground probing is unavailable. Turn off Follow slopes for flat walking.';return;}
    const point={x:target.x,y:target.y,z:target.z},epoch=this.epoch;this.pending=true;
    try{
      Promise.resolve(this.session.requestHitTestSource({space:this.space,offsetRay:new XRRay({x:point.x,y:point.y+1.2,z:point.z,w:1},{x:0,y:-1,z:0,w:0})})).then(source=>{
        if(epoch!==this.epoch){this.cancel(source);return;}this.cancel(this.source);this.source=source;this.sourcePoint=point;this.pending=false;this.error='';
      }).catch(()=>{if(epoch===this.epoch){this.pending=false;this.error='Scan the ground ahead. Ground probing is not ready.';}});
    }catch{this.pending=false;this.error='Scan the ground ahead. Ground probing is not ready.';}
  }
  resolve(x,z,currentY,travel) {
    if(!this.enabled)return {ok:true,y:currentY};
    const candidates=this.samples.filter(s=>this.now-s.time<1600&&Math.hypot(s.x-x,s.z-z)<.5).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z));
    if(!candidates.length){
      candidates.push(...[...this.scanMap.values()].filter(s=>Math.hypot(s.x-x,s.z-z)<.65).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)));
      if(!candidates.length&&this.routeHint){
        const {a,b}=this.routeHint,dx=b.x-a.x,dz=b.z-a.z,length=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(length||1)));
        if(Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<.2){const y=a.y+(b.y-a.y)*t;if(Math.abs(y-currentY)<=Math.max(.15,travel+.06))return {ok:true,y,interpolated:true};}
      }
      if(!candidates.length)return {ok:false,reason:this.error||'Scan the ground ahead to update height.'};
    }
    const sample=candidates[0],height=heightOnGround(sample,x,z);
    if(Math.abs(height-currentY)>Math.max(.15,travel+ .06))return {ok:false,reason:'Ground level changes sharply here. Scan or reposition.'};
    return {ok:true,y:height,angle:Math.acos(sample.ny)*180/Math.PI};
  }
}
