// Colour matching adapted from Colour Vision Extreme's Freeze isolate.
// Source: https://github.com/mayhem82/Sound-visualiser-/blob/main/colorvision.js
export function rgbToLab(r,g,b) {
  const linear=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)};
  r=linear(r);g=linear(g);b=linear(b);
  const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
  const x=f((.4124564*r+.3575761*g+.1804375*b)/.95047);
  const y=f((.2126729*r+.7151522*g+.072175*b));
  const z=f((.0193339*r+.119192*g+.9503041*b)/1.08883);
  return [116*y-16,500*(x-y),200*(y-z)];
}
export function isolateColour(imageData, choice, sample=null, spread=15) {
  const bands={red:[345,15],orange:[15,40],yellow:[40,70],green:[70,165],blue:[165,255],purple:[255,345]};
  if(choice==='off')return imageData;
  const band=bands[choice];if(choice!=='sample'&&!band)throw new RangeError('Unknown colour');
  const data=imageData.data,width=imageData.width,height=imageData.height;
  const original=choice==='sample'?new Uint8ClampedArray(data):data;
  const target=choice==='sample'&&sample?rgbToLab(...sample):null;
  const limit=Number.isFinite(+spread)?Math.max(1,Math.min(40,+spread)):15;
  for(let i=0;i<data.length;i+=4){
    const r=original[i]/255,g=original[i+1]/255,b=original[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
    let hue=0;if(delta){if(max===r)hue=60*((g-b)/delta+(g<b?6:0));else if(max===g)hue=60*((b-r)/delta+2);else hue=60*((r-g)/delta+4);}
    const sat=max?delta/max:0;
    let inside=false;
    if(choice==='sample'&&target){
      const pixel=i/4,x=pixel%width,y=Math.floor(pixel/width);
      const neighbours=[pixel,y*width+Math.min(width-1,x+1),y*width+Math.max(0,x-1),Math.min(height-1,y+1)*width+x,Math.max(0,y-1)*width+x];
      let rr=0,gg=0,bb=0;for(const p of neighbours){rr+=original[p*4];gg+=original[p*4+1];bb+=original[p*4+2];}
      const lab=rgbToLab(rr/5,gg/5,bb/5),chroma=Math.hypot(target[1],target[2]);
      const weight=Math.min(1,chroma/20),lw=1-.65*weight,aw=2*weight;
      inside=Math.sqrt((lab[0]-target[0])**2*lw+((lab[1]-target[1])**2+(lab[2]-target[2])**2)*aw)<limit;
    }else if(band)inside=band[0]>band[1]?hue>=band[0]||hue<band[1]:hue>=band[0]&&hue<band[1];
    if(original[i+3]<240||max<.08||sat<.25||!inside){data[i]=0;data[i+1]=0;data[i+2]=0;}
    data[i+3]=255;
  }
  return imageData;
}
