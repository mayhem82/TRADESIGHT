export const IMAGE_MAX=100,DISTANCE_MAX=1000,XR_NEAR=.05,XR_FAR=2000;
export function imageSize(width,height,aspect=null){
 if(!Number.isFinite(width)||width<.1||width>IMAGE_MAX)throw Error('Image width must be 0.1–100 m');
 if(aspect!==null){if(!Number.isFinite(aspect)||aspect<=0)throw Error('Invalid image aspect ratio');height=width/aspect;}
 if(!Number.isFinite(height)||height<.01||height>1000)throw Error('Image height must be 0.01–1000 m');
 return {width,height};
}
export function surfaceCentre(w){const m=w.model;return [m[12]-m[8]*w.radius,m[13]-m[9]*w.radius,m[14]-m[10]*w.radius];}
export function surfaceDistance(w,viewer){const c=surfaceCentre(w);return Math.hypot(c[0]-viewer[12],c[2]-viewer[14]);}
export function distanceStep(w,viewer,distance){
 if(!viewer||!Array.from(viewer).every(Number.isFinite))throw Error('Wait for current AR tracking');
 if(!Number.isFinite(distance)||distance<.75||distance>DISTANCE_MAX)throw Error('Distance must be 0.75–1000 m');
 const c=surfaceCentre(w);let dx=c[0]-viewer[12],dz=c[2]-viewer[14],length=Math.hypot(dx,dz);
 if(length<.0001){dx=-viewer[8];dz=-viewer[10];length=Math.hypot(dx,dz);if(length<.0001)throw Error('Aim horizontally before setting distance');}
 return [viewer[12]+dx/length*distance-c[0],viewer[14]+dz/length*distance-c[2]];
}
// Standard WebXR perspective projection; preserve device FOV and asymmetric eye offsets.
export function projectionFar(p){return Math.abs(p[10]+1)<1e-8?Infinity:p[14]/(p[10]+1);}
