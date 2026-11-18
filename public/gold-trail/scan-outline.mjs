// Sobel outline adapted from Colour Vision Extreme's cvEdgeStrength.
export function outlineImage(image, thickness=1, blend=.65) {
  const {width,height,data}=image,base=new Uint8ClampedArray(data),light=new Float32Array(width*height);
  thickness=Math.max(1,Math.min(4,Math.round(Number(thickness)||1)));
  blend=Math.max(0,Math.min(1,Number.isFinite(+blend)?+blend:.65));
  for(let p=0;p<light.length;p++)light[p]=(.2126*base[p*4]+.7152*base[p*4+1]+.0722*base[p*4+2])/255;
  const l=(x,y)=>light[Math.max(0,Math.min(height-1,y))*width+Math.max(0,Math.min(width-1,x))];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    let t=thickness,tl=l(x-t,y-t),tc=l(x,y-t),tr=l(x+t,y-t),ml=l(x-t,y),mr=l(x+t,y),bl=l(x-t,y+t),bc=l(x,y+t),br=l(x+t,y+t);
    let gx=-tl-2*ml-bl+tr+2*mr+br,gy=-tl-2*tc-tr+bl+2*bc+br,edge=Math.min(1,Math.hypot(gx,gy))*255,i=4*(y*width+x);
    data[i]=Math.round(base[i]*(1-blend)+edge*blend);
    data[i+1]=Math.round(base[i+1]*(1-blend)+edge*blend);
    data[i+2]=Math.round(base[i+2]*(1-blend)+edge*blend);
  }
  return image;
}
