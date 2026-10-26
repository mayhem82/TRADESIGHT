(() => {
 const loader=document.currentScript,status=document.querySelector('#startup-status');
 const show=message=>{status.hidden=false;status.textContent=message};
 const chrome=document.querySelector('#open-chrome');
 if(chrome){
  const target=new URL(location.href);target.hash='';
  chrome.href='intent://'+target.host+target.pathname+target.search+'#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(target.href)+';end;';
  chrome.hidden=!/Android/i.test(navigator.userAgent);
 }
 window.addEventListener('error',event=>{
  if(event.message)show('AR startup error: '+event.message);
 });
 window.addEventListener('unhandledrejection',event=>show('AR error: '+(event.reason?.message||String(event.reason))));
 window.addEventListener('reference-ready',()=>{
  if(!navigator.xr)show('This browser does not expose WebXR. Open this page in Chrome.');
  else status.hidden=true;
 },{once:true});
 const script=document.createElement('script');script.src=loader.dataset.entry;
 script.onerror=()=>show('AR code could not load. Reload this page or open it in Chrome.');
 document.head.append(script);
})();
