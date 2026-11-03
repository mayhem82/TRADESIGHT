let deferredInstall=null;
const installButton=document.getElementById('installApp');
const installStatus=document.getElementById('installStatus');
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;installButton.hidden=false;installStatus.textContent='Tap Install Gold Trail, then confirm in Chrome.';});
installButton.addEventListener('click',async()=>{if(!deferredInstall)return;const prompt=deferredInstall;deferredInstall=null;installButton.hidden=true;try{await prompt.prompt();const choice=await prompt.userChoice;installStatus.textContent=choice?.outcome==='accepted'?'Installation requested. Follow Chrome’s instructions.':'Install was not completed. Use Chrome’s menu to try again.';}catch{installStatus.textContent='Install prompt unavailable. Use Chrome’s menu to try again.';}});
window.addEventListener('appinstalled',()=>{deferredInstall=null;installButton.hidden=true;installStatus.textContent='Gold Trail installed.';});
