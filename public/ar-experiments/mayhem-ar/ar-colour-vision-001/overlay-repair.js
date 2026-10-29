// Geometry only: retain control order, labels, text sizes and horizontal anchors.
const GAP=10;
export function intersects(a,b,gap=0){return a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;}
export function overlayLayout({width,height,left=0,top=0,safe={top:0,right:0,bottom:0,left:0},xr=false,menu={width:110,height:44},stickHeight=154,toolsHeight=1000,utilities=[],hudVisible=true,toolsVisible=true}){
 const wide=width>=800,small=width<800||height<600;
 const edge={left:left+Math.max(10,safe.left+10),right:left+width-Math.max(10,safe.right+10),top:top+Math.max(safe.top,small?24:0)+10,bottom:top+height-Math.max(12,safe.bottom+12)};
 const sticksTop=edge.bottom-stickHeight;
 const menuRect={x:edge.right-menu.width,y:edge.top,width:menu.width,height:menu.height};
 const dock=[];
 for(const item of utilities){const w=Math.min(item.width,edge.right-edge.left),x=Math.min(edge.right-w,Math.max(edge.left,item.x)),h=item.height;let y=sticksTop-GAP-h;while(dock.some(r=>intersects({x,y,width:w,height:h},r,GAP)))y=Math.min(...dock.filter(r=>intersects({x,y,width:w,height:h},r,GAP)).map(r=>r.y))-GAP-h;dock.push({id:item.id,x,y,width:w,height:h});}
 const contentBottom=(dock.length?Math.min(...dock.map(r=>r.y)):sticksTop)-GAP,available=Math.max(0,contentBottom-edge.top);
 const hudWidth=wide?Math.min(650,width*.45):edge.right-edge.left;
 const toolsWidth=wide?Math.min(470,edge.right-edge.left-hudWidth-GAP):Math.min(470,edge.right-edge.left);
 const targetTools=Math.min(toolsHeight,height*(wide?.55:.4));
 const toolHeight=wide||!hudVisible?Math.max(44,Math.min(targetTools,available)):Math.max(44,Math.min(targetTools,available-54));
 const tools={x:edge.left,y:edge.top,width:toolsWidth,height:toolHeight,visible:toolsVisible};
 const hudTop=wide?Math.max(edge.top,menuRect.y+menuRect.height+GAP):tools.y+tools.height+GAP;
 const hud={x:wide?edge.right-hudWidth:edge.left,y:hudTop,width:hudWidth,height:Math.max(44,contentBottom-hudTop),visible:hudVisible};
 return {edge,menu:menuRect,sticksTop,dock,tools,hud,popupBottom:top+height-contentBottom,popupHeight:Math.max(44,contentBottom-edge.top),headerReserve:intersects({...tools,height:menu.height+24},menuRect)?menu.width+GAP:0};
}
export function sourceMessage({mode,xr=false,tracking=true,cameraAvailable=false,cameraStatus='',current=false,mediaReady=false,regularCamera=false}){
 if(regularCamera)return 'Regular camera effects mode. Camera permission and interruption messages report the current camera state.';
 const inactive=xr&&cameraAvailable?' XR camera access is available but is not the selected content source.':'';
 if(mode==='media')return (mediaReady?'Content: My image / video. Loaded local media feeds the model.':'Content: My image / video. Load an image or video first.')+inactive;
 if(mode==='snapshot')return 'Content: Captured content. The frozen source image feeds the model; it is not live.'+inactive;
 if(mode!=='camera')return 'Content: Architectural colour study. The generated study feeds the model.'+inactive;
 if(!xr)return 'Content: Live XR camera on model. Enter AR to use this source; no regular camera stream is opened.';
 if(!tracking)return 'Content: Live XR camera on model. Tracking is paused; no current live image is submitted.';
 if(!cameraAvailable)return 'Content: Live XR camera on model is unavailable: '+cameraStatus+'. Choose other model content, or exit AR for regular camera effects.';
 if(!current)return 'Content: Live XR camera on model. Access is available; waiting for a current camera image.';
 return 'Content: Live XR camera on model. The current XR camera image feeds the model; immersive surroundings remain the system camera.';
}
export function installOverlaySpacing({tools,menu,sticks,hud,onLayout=()=>{}}){
 const root=document.documentElement,body=document.body,probe=document.createElement('i');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';body.appendChild(probe);
 let pending=false,frameRequest=null;const variables=(node,values)=>{for(const [key,value] of Object.entries(values)){const v=Math.round(value*10)/10+'px';if(node.style.getPropertyValue(key)!==v)node.style.setProperty(key,v);}};
 const visible=e=>e&&!e.hidden&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden';
 function layout(){pending=false;const v=window.visualViewport,s=getComputedStyle(probe),w=v?.width||innerWidth,h=v?.height||innerHeight,l=v?.offsetLeft||0,t=v?.offsetTop||0,xr=body.classList.contains('xr');const utilityNodes=['fullscreenBtn','zoomControl','floatingCaptureBar','histogramCanvas','palettePanel'].map(id=>document.getElementById(id)).filter(visible);
  const utilities=utilityNodes.map(e=>{const r=e.getBoundingClientRect();return {id:e.id,x:r.x,width:r.width,height:r.height};});const mr=menu.getBoundingClientRect(),sr=sticks.getBoundingClientRect();
  const result=overlayLayout({width:w,height:h,left:l,top:t,safe:{top:parseFloat(s.paddingTop)||0,right:parseFloat(s.paddingRight)||0,bottom:parseFloat(s.paddingBottom)||0,left:parseFloat(s.paddingLeft)||0},xr,menu:{width:mr.width,height:mr.height},stickHeight:sr.height||154,toolsHeight:tools.scrollHeight+2,utilities,hudVisible:visible(hud),toolsVisible:visible(tools)});
  variables(root,{'--ar-safe-left':result.edge.left,'--ar-safe-right':innerWidth-result.edge.right,'--ar-safe-top':result.edge.top,'--ar-stick-bottom':innerHeight-result.edge.bottom,'--ar-tools-width':result.tools.width,'--ar-tools-height':result.tools.height,'--ar-tools-top':result.tools.y,'--ar-hud-top':result.hud.y,'--ar-hud-height':result.hud.height,'--ar-hud-left':result.hud.x,'--ar-hud-width':result.hud.width,'--ar-header-reserve':result.headerReserve,'--ar-header-height':result.headerReserve?mr.height:0,'--ar-menu-height':mr.height,'--ar-popup-bottom':innerHeight-(t+h-result.popupBottom),'--ar-popup-height':result.popupHeight});
  for(const r of result.dock){const e=document.getElementById(r.id);variables(e,{'--ar-utility-bottom':innerHeight-r.y-r.height});if(e.id==='floatingCaptureBar'&&e.style.top&&!e.classList.contains('dragging')){const box=e.getBoundingClientRect();if(box.bottom>result.sticksTop-GAP||box.top<result.edge.top){e.style.top=r.y+'px';e.style.left=r.x+'px';}}}
  onLayout(result);
 }
 // Window RAF may pause while an immersive XR session owns frame delivery.
 function schedule(){if(body.classList.contains('xr')){if(frameRequest!==null){cancelAnimationFrame(frameRequest);frameRequest=null;pending=false;}if(!pending){pending=true;queueMicrotask(layout);}}else if(!pending){pending=true;frameRequest=requestAnimationFrame(()=>{frameRequest=null;layout();});}}
 const resize=new ResizeObserver(schedule);for(const e of [tools,menu,sticks,hud,...['fullscreenBtn','zoomControl','floatingCaptureBar','histogramCanvas','palettePanel'].map(id=>document.getElementById(id)).filter(Boolean)])resize.observe(e);
 const changes=new MutationObserver(schedule);changes.observe(body,{attributes:true,attributeFilter:['class','hidden'],childList:true,subtree:true});window.addEventListener('resize',schedule);window.addEventListener('pointerup',schedule,true);for(const event of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(event,schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);document.fonts?.ready.then(schedule);schedule();return {refresh:schedule,disconnect(){resize.disconnect();changes.disconnect();probe.remove();}};
}
