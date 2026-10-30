import {MAX_BYTES,MAX_EDGE} from './multi-view.js';
export async function decodePhoto(file,{decode=createImageBitmap}={}){
 if(!file||!file.size||file.size>MAX_BYTES)throw Error('Choose a JPEG or PNG photo of at most 16 MiB');
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(!png&&!jpeg)throw Error('Choose an ordinary JPEG or PNG photo, not a depth-map requirement');
 let image;try{image=await decode(file,{imageOrientation:'from-image'});if(image.width<16||image.height<16||image.width*image.height>32*1024*1024)throw Error('Photo must be at least 16 × 16 and no larger than 32 megapixels');
 const scale=Math.min(1,MAX_EDGE/Math.max(image.width,image.height)),width=Math.round(image.width*scale),height=Math.round(image.height*scale);if(width<16||height<16)throw Error('Photo is too panoramic to retain its aspect ratio at the image limit');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0,width,height);const rgba=ctx.getImageData(0,0,width,height).data;canvas.width=canvas.height=0;
 return {token:Symbol('uploaded-photo'),name:file.name,width,height,rgba,bytes:rgba.byteLength,originalWidth:image.width,originalHeight:image.height};
 }catch(e){throw Error('Could not open '+file.name+': '+e.message);}finally{image?.close();}
}
// Full uploaded-image coordinates: no invented camera pose and no brightness-derived depth.
export function photoDepth(photo,map,{edge=768,source}={}){
 const {width:sw,height:sh,rgba}=photo;if(map.width!==sw||map.height!==sh||rgba.length!==sw*sh*4)throw Error('Depth dimensions must match the selected photo');
 if(map.values?map.values.length!==sw*sh:map.data?.length!==sw*sh*4)throw Error('Depth pixel dimensions differ');
 const scale=Math.min(1,Math.max(edge/Math.max(sw,sh),16/Math.min(sw,sh))),width=Math.max(16,Math.round(sw*scale)),height=Math.max(16,Math.round(sh*scale)),values=new Float32Array(width*height),out=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const sx=Math.min(sw-1,Math.floor((x+.5)*sw/width)),sy=Math.min(sh-1,Math.floor((y+.5)*sh/height)),i=sy*sw+sx,j=y*width+x;let value;
 if(map.values)value=map.values[i];else{const p=i*4;if(map.data[p+3]!==255||Math.abs(map.data[p]-map.data[p+1])>1||Math.abs(map.data[p]-map.data[p+2])>1)throw Error('Supply an opaque grayscale depth map: white near, black far');value=map.data[p]/255;}
 if(!Number.isFinite(value)||value<0||value>1)throw Error('Invalid estimated nearness');values[j]=value;out.set(rgba.subarray(i*4,i*4+4),j*4);}
 return {width,height,values,rgba:out,source};
}
export function fitPhoto(imageAspect,wallAspect){return imageAspect>wallAspect?[1,wallAspect/imageAspect]:[imageAspect/wallAspect,1];}
export function uploadWallSize(width,height){const ratio=Math.max(.1,Math.min(5,width/height));let w=1.2,h=w/ratio;if(h>3){h=3;w=h*ratio;}if(h<.5){h=.5;w=h*ratio;}return {radius:w,height:h};}
