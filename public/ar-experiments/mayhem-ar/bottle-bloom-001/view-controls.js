export class ViewControls{
 constructor(options){
  this.o=options;this.clean=false;this.revealed=false;this.ownsFullscreen=false;this.revision=0;this.timer=null;this.wasPlaying=false;
  this.root=document.documentElement;this.overlay=document.getElementById('overlay');this.panel=document.getElementById('panel');
  const $=id=>document.getElementById(id);
  $('view-play').onclick=()=>{options.onPlayback();this.reveal();};
  $('view-stop').onclick=()=>{if(this.clean)options.onRestart();else options.onStop();this.reveal();};
  $('view-target').onclick=()=>options.onToggleTarget();
  $('view-fullscreen').onclick=()=>{if(this.clean)this.hide();else this.enter();};
  $('view-menu').onclick=()=>this.showPanel(true);
  $('view-exit').onclick=()=>{if(options.isImmersive())options.onExitAR();else this.showPanel(true);};
  $('grow-fullscreen').onclick=()=>this.enter(true);
  $('view-actions').addEventListener('pointerdown',()=>this.reveal());
  document.addEventListener('fullscreenchange',()=>{
   if(this.ownsFullscreen&&document.fullscreenElement!==this.overlay){this.ownsFullscreen=false;this.clean=false;this.panel.hidden=false;this.clearTimer();this.changed();}
  });
 }
 clearTimer(){clearTimeout(this.timer);this.timer=null;}
 changed(){this.sync();this.o.onViewChange();}
 sync(){
  const $=id=>document.getElementById(id),active=this.o.isImmersive(),playing=this.o.isPlaying(),progress=this.o.progress();
  if(this.clean&&this.wasPlaying&&!playing){this.revealed=true;this.clearTimer();}
  this.wasPlaying=playing;
  this.root.classList.toggle('controls-hidden',this.panel.hidden);
  this.root.classList.toggle('clean-view',this.clean);
  this.root.classList.toggle('view-revealed',this.revealed);
  $('toggle-panel').textContent=this.panel.hidden?'Show controls':'Hide controls';$('toggle-panel').setAttribute('aria-expanded',String(!this.panel.hidden));
  $('view-actions').hidden=this.clean?!this.revealed:!active||!this.panel.hidden;
  $('view-play').textContent=playing?'Pause':progress>=1?'Grow again':progress>0?'Resume':'Grow';
  $('view-play').disabled=!this.o.canGrow();$('view-stop').disabled=!this.o.canGrow();$('view-target').disabled=!this.o.canGrow();$('view-fullscreen').disabled=!this.o.canGrow();$('grow-fullscreen').disabled=!this.o.canGrow();
  $('view-stop').textContent=this.clean?'↺':'Stop';$('view-stop').setAttribute('aria-label',this.clean?'Restart growth':'Stop movement');
  $('view-target').textContent=this.o.targetLabel?.()||(this.o.target()==='flower'?'Flower':'Both');$('view-target').setAttribute('aria-label','Move '+(this.o.targetDescription?.()||(this.o.target()==='flower'?'flower only':'glass and flower'))+'; tap to switch');
  $('view-fullscreen').textContent=this.clean?'Hide buttons':'Full screen';$('view-exit').textContent=active?'Exit AR':'Exit view';
 }
 showPanel(visible){
  if(visible)this.leave();
  this.panel.hidden=!visible;this.o.onStop();this.changed();
 }
 async enter(grow=false){
  if(!this.o.canGrow())return false;
  const token=++this.revision;
  // Immersive AR already owns the screen. Changing its fullscreen root can end
  // the AR session: https://immersive-web.github.io/dom-overlays/#fullscreen-api-integration
  if(!this.o.isImmersive()&&document.fullscreenElement!==this.overlay){
   try{
    if(!this.overlay.requestFullscreen)throw new Error('Fullscreen is unavailable');
    await this.overlay.requestFullscreen({navigationUI:'hide'});
    if(token!==this.revision)return false;
    this.ownsFullscreen=true;
   }catch{this.o.onNotice('Fullscreen is unavailable in this browser. Hide controls is still available in AR.');return false;}
  }
  if(token!==this.revision)return false;
  this.o.onEnter();this.clean=true;this.panel.hidden=true;this.revealed=true;
  if(grow)this.o.onGrow();
  this.changed();this.reveal();return true;
 }
 reveal(){
  if(!this.clean)return;
  this.revealed=true;this.clearTimer();this.changed();
  if(this.o.isPlaying())this.timer=setTimeout(()=>{if(this.clean&&this.o.isPlaying())this.hide();},2800);
 }
 hide(){this.revealed=false;this.clearTimer();this.changed();}
 leave(){
  ++this.revision;this.clean=false;this.revealed=false;this.clearTimer();
  if(this.ownsFullscreen){this.ownsFullscreen=false;if(document.fullscreenElement===this.overlay)document.exitFullscreen().catch(()=>{});}
 }
 reset(){this.leave();this.panel.hidden=false;this.changed();}
}
