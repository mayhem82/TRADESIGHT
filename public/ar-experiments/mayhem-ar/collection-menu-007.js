// UI-only repair shared by every linked model. AR/capture bundles stay unchanged.
(()=>{
 const panel=document.querySelector('#panel'),overlay=document.querySelector('#overlay');if(!panel||!overlay)return;
 let toggle=document.querySelector('#menu-toggle');if(!toggle){toggle=document.createElement('button');toggle.id='menu-toggle';overlay.prepend(toggle);}
 toggle.type='button';toggle.setAttribute('aria-controls','panel');
 function sync(){toggle.textContent=panel.hidden?'Show menu':'Hide menu';toggle.setAttribute('aria-expanded',String(!panel.hidden));}
 toggle.onclick=()=>{panel.hidden=!panel.hidden;sync();};
 toggle.addEventListener('beforexrselect',event=>event.preventDefault());
 let nav=panel.querySelector('#collection-nav');if(!nav){nav=document.createElement('nav');nav.id='collection-nav';const link=document.createElement('a');link.href=new URL('models/index.html',document.querySelector('script[src*="collection-menu-007.js"]').src).href;link.textContent='Models';nav.append(link);panel.prepend(nav);}
 panel.addEventListener('beforexrselect',event=>event.preventDefault());
 let wasXR=document.body.classList.contains('xr');new MutationObserver(()=>{const isXR=document.body.classList.contains('xr');if(isXR!==wasXR){panel.hidden=false;wasXR=isXR;window.scrollTo(0,0);}sync();}).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['hidden']});
 window.addEventListener('pageshow',()=>{panel.hidden=false;sync();});sync();
})();
