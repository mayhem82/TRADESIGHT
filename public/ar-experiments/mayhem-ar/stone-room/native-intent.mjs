export function sceneViewerIntent(base,model='companion',assetUrl=null){
 const root=new URL('./',base);
 if(root.protocol!=='https:')throw Error('Android AR needs an HTTPS model address.');
 const file=assetUrl?new URL(assetUrl):new URL(model==='room'?'assets/stone-room.glb':'assets/photo-guided-npc.glb',root);
 if(file.protocol!=='https:')throw Error('Android AR needs an HTTPS model address.');
 const fallback=new URL('android.html?unavailable=1',root);
 const params=new URLSearchParams({file:file.href,mode:'ar_only',resizable:'false',title:model==='room'?'Stone Room':'Stone Room companion'});
 return `intent://arvr.google.com/scene-viewer/1.0?${params}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(fallback.href)};end;`;
}
