import {mat4} from './vendor/js/render/math/gl-matrix.js';
// Adapter boundary for the accepted surface-circle flow: copy its current hit pose.
// Select records intent; only an animation frame with fresh hit AND viewer pose commits it.
export class Placement {
  constructor(){this.reset();}
  reset(){this.worldMatrix=null;this.matrix=null;this.pending=false;this.scanning=false;this.repositioning=false;this.generation=(this.generation||0)+1;}
  beginReposition(){if(!this.worldMatrix)return false;this.repositioning=true;this.scanning=true;this.pending=false;return true;}
  cancelReposition(){this.repositioning=false;this.scanning=false;this.pending=false;}
  request(){if(!this.worldMatrix||this.repositioning)this.pending=true;}
  cancelPending(){this.pending=false;}
  resolve(hit,viewer){
    const intent=this.pending;this.pending=false;
    if(!intent||(this.worldMatrix&&!this.repositioning)||!hit||!viewer||hit.length!==16||!Array.from(hit).every(Number.isFinite))return false;
    const point=[hit[12],hit[13],hit[14]];
    if(![viewer.x,viewer.y,viewer.z].every(Number.isFinite))return false;
    this.worldMatrix=new Float32Array(hit); // Same copy boundary as accepted newFlower.matrix = reticle.matrix.
    const m=mat4.create(),yaw=Math.atan2(viewer.x-point[0],viewer.z-point[2])+Math.PI; // Open front (+local Z) faces away; closed back faces placement viewer.
    mat4.fromYRotation(m,yaw);m[12]=point[0];m[13]=point[1]+.7;m[14]=point[2];
    this.matrix=m;this.scanning=false;this.repositioning=false;return true;
  }
}
