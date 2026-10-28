export class ARMenu {
  constructor() {
    this.button=document.querySelector('#ar-menu-toggle');
    this.panel=document.querySelector('#ar-settings-panel');
    this.button?.addEventListener('click',()=>this.setOpen(this.panel.hidden));
    this.setOpen(false);
  }
  setOpen(open) {
    if(!this.button||!this.panel)return;
    this.panel.hidden=!open;
    this.button.textContent=open?'Close menu':'Menu';
    this.button.setAttribute('aria-expanded',String(open));
  }
}
