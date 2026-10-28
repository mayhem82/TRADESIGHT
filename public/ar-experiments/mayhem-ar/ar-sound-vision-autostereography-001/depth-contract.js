// Full camera PNG / top-left coordinates -> frozen physical wall UVs.
// Both the photo and supplied depth use exactly the same projection samples.
export function sampleUV(shot,u,v) {
  const m=shot.model,p=shot.capturePV,local=[(u-.5)*shot.radius,(.5-v)*shot.height,-shot.radius,1],world=[0,0,0,0],clip=[0,0,0,0];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)world[r]+=m[c*4+r]*local[c];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)clip[r]+=p[c*4+r]*world[c];
  if(clip[3]<=0)return null;
  const x=clip[0]/clip[3],y=clip[1]/clip[3],z=clip[2]/clip[3];
  if([x,y,z].some(n=>!Number.isFinite(n)||n< -1||n>1))return null;
  return [(x+1)/2,(1-y)/2];
}
export function rectify(shot,photo,map,{edge=768,source}={}) {
  if(map.width!==shot.width||map.height!==shot.pixelHeight)throw Error('Depth map must exactly match the exported full camera photo dimensions');
  if(photo.length!==map.width*map.height*4||(map.values?map.values.length!==map.width*map.height:map.data?.length!==photo.length))throw Error('Pixel dimensions differ');
  const aspect=shot.radius/shot.height,width=Math.max(32,Math.round(edge*Math.min(1,aspect))),height=Math.max(32,Math.round(edge*Math.min(1,1/aspect))),values=new Float32Array(width*height),rgba=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const uv=sampleUV(shot,(x+.5)/width,(y+.5)/height);
    if(!uv)throw Error('Captured photo does not cover the whole wall. Keep existing photos; add a full face-on photo before importing depth');
    const sx=Math.min(map.width-1,Math.floor(uv[0]*map.width)),sy=Math.min(map.height-1,Math.floor(uv[1]*map.height)),i=(sy*map.width+sx)*4,j=y*width+x;
    if(map.values){const z=map.values[sy*map.width+sx];if(!Number.isFinite(z)||z<0||z>1)throw Error('Invalid estimated nearness');values[j]=z;}
    else {if(map.data[i+3]!==255||Math.abs(map.data[i]-map.data[i+1])>1||Math.abs(map.data[i]-map.data[i+2])>1)throw Error('Supply an opaque grayscale depth map: white near, black far');values[j]=map.data[i]/255;}
    rgba.set(photo.subarray(i,i+4),j*4);
  }
  return {width,height,values,rgba,source};
}
