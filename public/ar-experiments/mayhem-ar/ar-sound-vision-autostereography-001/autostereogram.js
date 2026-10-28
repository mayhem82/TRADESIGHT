// Original deterministic random-dot encoder. No image assets or model weights.
// Input is explicit normalized NEARNESS (0 far, 1 near), never photo luminance.
export function separation(near, period, strength, mode) {
  if (!['parallel','crossed'].includes(mode)) throw Error('Choose parallel or crossed viewing');
  return Math.round(period + (mode === 'crossed' ? 1 : -1) * near * strength);
}
export function validateDepth({width,height,values,source}) {
  if (!Number.isInteger(width)||!Number.isInteger(height)||width<16||height<16||width>1536||height>1536||values?.length!==width*height) throw Error('Depth dimensions must be 16–1536 and match the data');
  if (!source||!['supplied','estimated','measured'].includes(source.kind)||!source.description) throw Error('Depth provenance required');
  for (const n of values) if (!Number.isFinite(n)||n<0||n>1) throw Error('Depth must contain finite nearness values in [0,1]');
}
export function generate(depth,{mode='crossed',period=Math.round(depth.width/9),strength=Math.round(period*.18),seed=20261028}={}) {
  validateDepth(depth);separation(0,period,strength,mode);
  if (!Number.isInteger(period)||period<8||period>depth.width/3||!Number.isInteger(strength)||strength<1||strength>period*.3) throw Error('Invalid pattern period/strength');
  const {width:w,height:h,values}=depth,rgba=new Uint8ClampedArray(w*h*4);
  let random=seed>>>0;const next=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random;};
  const palette=[[20,43,59],[41,95,113],[91,165,162],[183,219,186],[232,212,162],[142,103,125]];
  for(let y=0;y<h;y++) {
    const parent=Int32Array.from({length:w},(_,i)=>i),left=new Int32Array(w).fill(-1),right=new Int32Array(w).fill(-1),priority=new Float32Array(w).fill(-1);
    const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
    // Near constraints win shared endpoint conflicts. Crossing constraints are
    // rejected when an intervening nearer sample would occlude their ray.
    for(let x=0;x<w;x++) {
      const z=values[y*w+x],s=separation(z,period,strength,mode),a=x-Math.floor(s/2),b=a+s;
      if(a<0||b>=w)continue;
      let visible=true;
      for(let k=1;k<Math.ceil(strength/2);k++)if((values[y*w+Math.max(0,x-k)]>z+k/strength*.5)||(values[y*w+Math.min(w-1,x+k)]>z+k/strength*.5)){visible=false;break;}
      if(!visible||priority[a]>z||priority[b]>z)continue;
      if(right[a]>=0)left[right[a]]=-1;
      if(left[b]>=0)right[left[b]]=-1;
      right[a]=b;left[b]=a;priority[a]=priority[b]=z;
    }
    for(let a=0;a<w;a++)if(right[a]>=0&&left[right[a]]===a)parent[root(right[a])]=root(a);
    const colors=new Map();
    for(let x=0;x<w;x++){const r=root(x);if(!colors.has(r))colors.set(r,palette[next()%palette.length]);const i=(y*w+x)*4;rgba.set([...colors.get(r),255],i);}
  }
  return {width:w,height:h,rgba,mode,period,strength,seed,source:{...depth.source}};
}
