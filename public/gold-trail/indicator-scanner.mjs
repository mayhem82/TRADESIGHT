// Optical indicator cues derived from the user's proposed HSV and texture scanner.
// These thresholds flag image appearance, not measured mineralogy or physical density.
export const INDICATOR_TYPES = {
  'indicator-pale': {label:'Pale edged surface · possible vein',color:[220,245,255],explanation:'A bright, low-colour edge. It may be a vein or another pale boundary; inspect the host and material.'},
  'indicator-rust': {label:'Rust-coloured surface · possible staining',color:[255,110,40],explanation:'A red or ochre area. Iron staining is one possibility; soil, plants, paint and lighting can look similar.'},
  'indicator-dark': {label:'Dark textured area · possible concentrate',color:[130,145,255],explanation:'A dark textured area. Sand, shadows, wet rock and other materials can look similar; density is not measured.'},
  'indicator-yellow': {label:'Yellow area · inspect for metallic grains',color:[255,215,0],explanation:'A yellow-coloured area. Metal, leaves, sand, paint and lighting can look similar; colour alone does not establish metal or gold.'},
  'indicator-texture': {label:'High-contrast texture · inspect ground',color:[60,230,150],explanation:'A strongly textured area. It could be gravel, fractures, vegetation or other surfaces; trap geometry is not established.'}
};
export class GeologicalIndicatorScanner {
  constructor(options={}) { this.sampleStep=Number.isInteger(options.sampleStep)&&options.sampleStep>0?options.sampleStep:3; }
  scanFrame(imageData) {
    const {width,height,data}=imageData, step=this.sampleStep;
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>640||height>640||!data||data.length!==width*height*4) throw new RangeError('Invalid RGBA frame');
    const cols=16,rows=12,cells=Array.from({length:cols*rows},()=>({samples:0,edge:0,counts:[0,0,0,0],pixels:[[],[],[],[]]}));
    let clipped=0,sampled=0;
    for(let y=step;y<height-step;y+=step) for(let x=step;x<width-step;x+=step) {
      const i=4*(y*width+x); if(data[i+3]<240) continue;
      const r=data[i],g=data[i+1],b=data[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,s=max?d/max:0,v=max/255;
      let h=0;if(d){if(max===r)h=((g-b)/d+(g<b?6:0))*60;else if(max===g)h=((b-r)/d+2)*60;else h=((r-g)/d+4)*60;}
      const lum=j=>.299*data[j]+.587*data[j+1]+.114*data[j+2];
      const edge=Math.abs(lum(i)-lum(i+step*4))+Math.abs(lum(i)-lum(i+width*step*4));
      const cell=cells[Math.min(rows-1,Math.floor(y*rows/height))*cols+Math.min(cols-1,Math.floor(x*cols/width))];
      cell.samples++;cell.edge+=edge;sampled++;
      if(r>248&&g>248&&b>248){clipped++;continue;}
      let k=-1;
      if(h>=36&&h<=56&&s>=.42&&v>=.45)k=3;
      else if(((h>=5&&h<=35)||h>=345)&&s>=.35&&v>=.22&&v<=.88)k=1;
      else if(v>=.78&&s<=.18&&edge>=28)k=0;
      else if(v<=.18&&s<=.28&&edge>=12)k=2;
      if(k>=0){cell.counts[k]++;cell.pixels[k].push(x,y);}
    }
    const types=['indicator-pale','indicator-rust','indicator-dark','indicator-yellow','indicator-texture'], candidates=[];
    cells.forEach((cell,n)=>{if(!cell.samples)return;const x=n%cols,y=Math.floor(n/cols);
      for(let k=0;k<4;k++){const count=cell.counts[k],ratio=count/cell.samples;
        if((k===3&&count>=3)||(k===0&&ratio>.25)||(k===1&&ratio>.35)||(k===2&&ratio>.35))
          candidates.push({kind:types[k],count,box:{x:x/cols,y:y/rows,width:1/cols,height:1/rows},pixels:cell.pixels[k]});
      }
      if(cell.edge/cell.samples>38)candidates.push({kind:types[4],count:cell.samples,box:{x:x/cols,y:y/rows,width:1/cols,height:1/rows},pixels:[]});
    });
    candidates.sort((a,b)=>b.count-a.count);
    const picked=[],seen=new Set();
    for(const c of candidates)if(!seen.has(c.kind)){picked.push(c);seen.add(c.kind);}
    for(const c of candidates)if(picked.length<12&&!picked.includes(c))picked.push(c);
    const mask=new Uint8ClampedArray(width*height*4);
    const cues=picked.map((c,i)=>{const color=INDICATOR_TYPES[c.kind].color;
      for(let p=0;p<c.pixels.length;p+=2){const x=c.pixels[p],y=c.pixels[p+1];
        for(let dy=0;dy<step&&y+dy<height;dy++)for(let dx=0;dx<step&&x+dx<width;dx++) mask.set([...color,100],4*((y+dy)*width+x+dx));}
      return {id:i+1,kind:c.kind,label:INDICATOR_TYPES[c.kind].label,box:c.box,pixelCount:c.count,status:'unconfirmed visual cue'};
    });
    return {cues,mask,glareWarning:sampled>0&&clipped/sampled>.15};
  }
}
