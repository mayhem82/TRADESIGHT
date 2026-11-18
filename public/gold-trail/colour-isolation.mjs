// Colour isolation preserves selected source pixels; all others become opaque black.
export function isolateColour(imageData, choice) {
  const bands={red:[345,15],orange:[15,40],yellow:[40,70],green:[70,165],blue:[165,255],purple:[255,345]};
  if(choice==='off')return imageData;
  const band=bands[choice];if(!band)throw new RangeError('Unknown colour');
  const data=imageData.data;
  for(let i=0;i<data.length;i+=4){
    const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
    let hue=0;
    if(delta){if(max===r)hue=60*((g-b)/delta+(g<b?6:0));else if(max===g)hue=60*((b-r)/delta+2);else hue=60*((r-g)/delta+4);}
    const sat=max?delta/max:0,inside=band[0]>band[1]?hue>=band[0]||hue<band[1]:hue>=band[0]&&hue<band[1];
    if(data[i+3]<240||max<.08||sat<.25||!inside){data[i]=0;data[i+1]=0;data[i+2]=0;}
    data[i+3]=255;
  }
  return imageData;
}
