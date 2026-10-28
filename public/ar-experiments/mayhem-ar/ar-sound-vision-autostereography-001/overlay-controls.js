export class OverlayControls {
 constructor({onHide=()=>{}}={}){this.onHide=onHide;this.panel=document.querySelector('#panel');this.toggle=document.querySelector('#menu-toggle');let lastPointer=-Infinity;
  const activate=e=>{e.preventDefault();e.stopPropagation();this.show(this.panel.hidden);};
  this.toggle.onclick=e=>{if(e.detail!==0&&performance.now()-lastPointer<650){e.preventDefault();return;}activate(e);};this.toggle.onpointerup=e=>{if(e.isPrimary&&e.button===0){lastPointer=performance.now();activate(e);}};
  for(const control of document.querySelectorAll('#overlay button,#overlay a,#overlay input,#overlay summary')){control.dataset.xrControl='';control.addEventListener('beforexrselect',e=>e.preventDefault());}
  document.querySelector('#panel').addEventListener('beforexrselect',e=>e.preventDefault());
  this.toggle.setAttribute('aria-controls','panel');this.show(true);
 }
 show(visible){if(!visible)this.onHide();this.panel.hidden=!visible;this.panel.setAttribute('aria-hidden',String(!visible));this.toggle.textContent=visible?'Hide menu':'Show menu';this.toggle.setAttribute('aria-expanded',String(visible));}
}
