// Optional online photo interpretation. No image is sent without the Send action.
export function validateEndpoint(value) {
  try { const u = new URL(value.trim()); return u.protocol === 'https:' && !u.username && !u.password && !u.hash && !u.search ? u.href : null; }
  catch { return null; }
}
export function validateAnalysis(result) {
  if (!result || typeof result !== 'object' || typeof result.provider !== 'string' || typeof result.model !== 'string' || !result.provider.trim() || !result.model.trim() || result.provider.length > 100 || result.model.length > 100) throw new Error('The service returned an invalid result.');
  for (const key of ['observations', 'interpretations', 'checks', 'unknowns']) {
    if (!Array.isArray(result[key]) || result[key].length > 12 || result[key].some(v => typeof v !== 'string' || !v.trim() || v.length > 1200)) throw new Error('The service returned an invalid result.');
  }
  return result;
}
export function onlineRequestActive(current, generation, signal) {
  if (current !== generation) return false;
  if (signal.aborted) throw new DOMException('Online scan cancelled or timed out.', 'AbortError');
  return true;
}
export async function encodeSelectedImage(frame, photo, photoCrop = null) {
  let bitmap = null;
  try {
    const source = photo ? (bitmap = await createImageBitmap(photo.blob)) : frame;
    const width = source.width, height = source.height;
    if (!width || !height || width * height > 48000000) throw new Error('Image dimensions are not supported.');
    const crop = photo && photoCrop ? photoCrop : {x:0,y:0,width:1,height:1};
    if (![crop.x,crop.y,crop.width,crop.height].every(Number.isFinite) || crop.x<0 || crop.y<0 || crop.width<=0 || crop.height<=0 || crop.x+crop.width>1.00000001 || crop.y+crop.height>1.00000001) throw new Error('Invalid photo focus bounds.');
    const cropWidth=width*crop.width, cropHeight=height*crop.height, scale=Math.min(1,2048/Math.max(cropWidth,cropHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(cropWidth * scale)); canvas.height = Math.max(1, Math.round(cropHeight * scale));
    const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(source, width*crop.x, height*crop.y, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .88));
    if (!blob || blob.size > 3 * 1024 * 1024) throw new Error('Image could not be prepared within the upload limit.');
    return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Image could not be prepared.')); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); });
  } finally { bitmap?.close(); }
}
export function setupOnlineAnalysis({getSource, freeze}) {
  const $=id=>document.getElementById(id), panel=$('onlinePanel'), status=$('onlineStatus'), result=$('onlineResult');
  let controller=null, generation=0, frame=null, sourcePhoto=null;
  function stop() { generation++; controller?.abort(); controller=null; $('onlineCancel').hidden=true; $('onlineSend').disabled=false; }
  function clear() { stop(); frame=null; sourcePhoto=null; result.replaceChildren(); panel.hidden=true; $('onlineCode').value=''; status.textContent=''; }
  function sync(displayed, photo, busy = false) {
    const next=displayed?.frame || null, nextPhoto=displayed?.context?.source === 'photo' ? photo : null;
    if (frame!==next || sourcePhoto!==nextPhoto) { stop(); result.replaceChildren(); status.textContent=''; frame=next; sourcePhoto=nextPhoto; }
    $('onlineOpen').disabled=!next || busy;
    $('onlineSend').disabled=busy || !!controller;
  }
  $('onlineOpen').onclick=()=>{ if (!frame) return; panel.hidden=false; status.textContent='Ready when an AI service has been configured.'; };
  $('onlineClose').onclick=()=>{ stop(); panel.hidden=true; $('onlineCode').value=''; };
  $('onlineCancel').onclick=()=>{ stop(); status.textContent='Stopped waiting. The service may already have received the image.'; };
  $('onlineSend').onclick=async()=>{
    const endpoint=validateEndpoint($('onlineEndpoint').value), code=$('onlineCode').value;
    if (!endpoint || !code) { status.textContent='Enter a secure HTTPS service address and its access code.'; return; }
    const source=getSource(); if (!source?.displayed?.frame) return;
    freeze(); const local=++generation, selectedFrame=source.displayed.frame, selectedPhoto=source.displayed.context.source==='photo' ? source.photo : null;
    controller=new AbortController(); const signal=controller.signal;
    $('onlineSend').disabled=true; $('onlineCancel').hidden=false; result.replaceChildren(); status.textContent='Preparing an image without photo metadata…';
    const requestController=controller, timeout=setTimeout(()=>requestController.abort(),90000);
    try {
      const image=await encodeSelectedImage(selectedFrame, selectedPhoto, source.displayed.context.photoCrop);
      if (!onlineRequestActive(local, generation, signal)) return;
      status.textContent='Sending the selected image for online analysis…';
      const response=await fetch(endpoint,{method:'POST',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json','Authorization':'Bearer '+code},body:JSON.stringify({image}),signal});
      if (!response.ok) throw new Error(response.status===401 ? 'Access was not accepted.' : response.status===429 ? 'The service usage limit was reached.' : 'The online service is unavailable (HTTP '+response.status+').');
      const analysis=validateAnalysis(await response.json()); if (!onlineRequestActive(local, generation, signal)) return;
      const title=document.createElement('p'); title.textContent='Analysis: '+analysis.provider+' / '+analysis.model+'. Geological identity and gold remain unconfirmed.'; result.append(title);
      for (const [key,label] of [['observations','Visible observations'],['interpretations','Possible interpretations'],['checks','Useful field checks'],['unknowns','What remains unknown']]) {
        const heading=document.createElement('strong'); heading.textContent=label; const list=document.createElement('ul');
        for (const entry of analysis[key]) { const item=document.createElement('li'); item.textContent=entry; list.append(item); }
        if (!analysis[key].length) { const item=document.createElement('li'); item.textContent='None provided.'; list.append(item); }
        result.append(heading,list);
      }
      status.textContent='Online analysis complete. Review the suggestions against field evidence.';
    } catch (error) { if (local===generation) status.textContent=error.name==='AbortError'?'Stopped waiting or timed out. The service may already have received the image.':error.message; }
    finally { clearTimeout(timeout); if (local===generation) { controller=null; $('onlineSend').disabled=false; $('onlineCancel').hidden=true; } }
  };
  return {sync,clear};
}
