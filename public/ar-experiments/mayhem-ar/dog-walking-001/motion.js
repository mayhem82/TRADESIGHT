import {mat4} from '../ar-colour-vision-001/vendor/js/render/math/gl-matrix.js';
function primitivesIn(node) {
  const result=[];
  const visit=part=>{for(const primitive of part.renderPrimitives||[])result.push(primitive);for(const child of part.children||[])visit(child);};visit(node);return result;
}
export class DogMotion {
  static async load(renderer,model,base='assets/',compressed=false) {
    const metadataResponse=await fetch(base+'motion.json');if(!metadataResponse.ok)throw Error('Walk animation metadata could not load');
    const metadata=await metadataResponse.json();let binary;
    if(compressed&&typeof DecompressionStream==='function'){
      const response=await fetch(base+'motion.bin.gz');if(!response.ok)throw Error('Walk animation could not load');
      binary=await new Response(response.headers.get('Content-Encoding')==='gzip'?response.body:response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    } else {
      const response=await fetch(base+'motion.bin');if(!response.ok)throw Error('Walk animation could not load');binary=await response.arrayBuffer();
    }
    return new DogMotion(renderer,model,metadata,binary);
  }
  constructor(renderer,model,metadata,binary) {
    this.renderer=renderer;this.metadata=metadata;this.phase=0;this.clip='Idle';this.lastTime=null;this.lastSkin=-Infinity;
    this.headYaw=0;this.headPitch=0;
    this.palette=new Float32Array(metadata.jointCount*16);this.clips={};
    for(const [name,clip] of Object.entries(metadata.clips))this.clips[name]={...clip,data:new Float32Array(binary,clip.offset,clip.frames*metadata.jointCount*16)};
    const primitives=primitivesIn(model);if(primitives.length!==metadata.primitives.length)throw Error('Animation mesh count mismatch');
    this.streams=metadata.primitives.map((part,index)=>{
      const streams=primitives[index].vertexStreams;
      if(!streams||streams.POSITION.count!==part.count||streams.POSITION.stride||streams.NORMAL.stride)throw Error('Animation vertex layout mismatch');
      streams.POSITION.buffer._usage=renderer.gl.DYNAMIC_DRAW;streams.NORMAL.buffer._usage=renderer.gl.DYNAMIC_DRAW;
      return {count:part.count,positions:new Float32Array(binary,part.positions,part.count*3),normals:new Float32Array(binary,part.normals,part.count*3),joints:new Uint8Array(binary,part.joints,part.count*4),weights:new Float32Array(binary,part.weights,part.count*4),outputPositions:new Float32Array(part.count*3),outputNormals:new Float32Array(part.count*3),positionStream:streams.POSITION,normalStream:streams.NORMAL};
    });
    this.applyPose('Idle',0);
  }
  setHead(yaw=0,pitch=0) {
    this.headYaw=Math.max(-35,Math.min(35,Number(yaw)||0));
    this.headPitch=Math.max(-25,Math.min(25,Number(pitch)||0));
    this.applyPose(this.renderedClip??this.clip,this.renderedTime??this.phase);
  }
  stop() {this.clip='Idle';this.phase=0;this.lastTime=null;this.applyPose('Idle',0);}
  update(time,moving=false,ratio=1,travel=null) {
    const dt=this.lastTime===null?0:Math.max(0,Math.min((time-this.lastTime)/1000,.1));this.lastTime=time;
    if(travel)moving=travel.distance>0.000001;
    const clip=moving?'Walk':'Idle',changed=clip!==this.clip;
    if(changed){this.clip=clip;this.phase=0;}
    // A distance-driven walk uses metres per complete left/right cycle.
    // Size scales stride length; idle remains time driven.
    const advance=moving&&travel
      ? travel.distance/(travel.cycleDistance*travel.scale)*this.clips.Walk.duration
      : dt*(moving?Math.max(.15,ratio):1);
    this.phase=(this.phase+advance)%this.clips[clip].duration;
    if(!moving&&!changed)return;
    if(!changed&&time-this.lastSkin<1000/30)return;
    this.lastSkin=time;this.applyPose(clip,this.phase);
  }
  applyPose(name,time) {
    this.renderedClip=name;this.renderedTime=time;
    const clip=this.clips[name],stride=this.palette.length,phase=(time%clip.duration)*this.metadata.fps,first=Math.floor(phase)%clip.frames,second=(first+1)%clip.frames,alpha=phase-Math.floor(phase);
    for(let i=0;i<stride;i++)this.palette[i]=clip.data[first*stride+i]*(1-alpha)+clip.data[second*stride+i]*alpha;
    if(this.headYaw||this.headPitch) {
      const head=this.metadata.headJoint*16,pivotMatrix=mat4.create();
      mat4.multiply(pivotMatrix,this.palette.subarray(head,head+16),this.metadata.headRest);
      const x=pivotMatrix[12],y=pivotMatrix[13],z=pivotMatrix[14],delta=mat4.create(),adjusted=mat4.create();
      mat4.translate(delta,delta,[x,y,z]);
      mat4.rotate(delta,delta,this.headYaw*Math.PI/180,this.metadata.headUpAxis);
      mat4.rotate(delta,delta,-this.headPitch*Math.PI/180,this.metadata.headRightAxis);
      mat4.translate(delta,delta,[-x,-y,-z]);
      for(const joint of this.metadata.headJoints) {
        const at=joint*16;mat4.multiply(adjusted,delta,this.palette.subarray(at,at+16));this.palette.set(adjusted,at);
      }
    }
    const m=this.palette;
    for(const stream of this.streams){
      const p=stream.positions,n=stream.normals,joints=stream.joints,weights=stream.weights,out=stream.outputPositions,nout=stream.outputNormals;
      for(let v=0;v<stream.count;v++){
        const p0=v*3,j0=v*4,x=p[p0],y=p[p0+1],z=p[p0+2],nx=n[p0],ny=n[p0+1],nz=n[p0+2];let ox=0,oy=0,oz=0,onx=0,ony=0,onz=0;
        for(let k=0;k<4;k++){
          const weight=weights[j0+k];if(weight===0)continue;const b=joints[j0+k]*16;
          ox+=(m[b]*x+m[b+4]*y+m[b+8]*z+m[b+12])*weight;oy+=(m[b+1]*x+m[b+5]*y+m[b+9]*z+m[b+13])*weight;oz+=(m[b+2]*x+m[b+6]*y+m[b+10]*z+m[b+14])*weight;
          onx+=(m[b]*nx+m[b+4]*ny+m[b+8]*nz)*weight;ony+=(m[b+1]*nx+m[b+5]*ny+m[b+9]*nz)*weight;onz+=(m[b+2]*nx+m[b+6]*ny+m[b+10]*nz)*weight;
        }
        out[p0]=ox;out[p0+1]=oy;out[p0+2]=oz;const length=Math.hypot(onx,ony,onz)||1;nout[p0]=onx/length;nout[p0+1]=ony/length;nout[p0+2]=onz/length;
      }
      this.renderer.updateRenderBuffer(stream.positionStream.buffer,out,stream.positionStream.byteOffset);
      this.renderer.updateRenderBuffer(stream.normalStream.buffer,nout,stream.normalStream.byteOffset);
    }
  }
}
