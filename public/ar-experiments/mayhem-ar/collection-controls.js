// Bounded collection compatibility. Reuse existing nodes so input listeners survive.
(() => {
 const panel=document.querySelector('#panel'),overlay=document.querySelector('#overlay');
 if(panel&&overlay&&!document.querySelector('#ar-tools')){
  const actions=panel.querySelector('#exit')?.closest('.row');
  if(actions){
   const anchor=document.createComment('Existing action controls');actions.before(anchor);
   const dock=document.createElement('div');dock.id='collection-actions';dock.hidden=true;overlay.append(dock);
   const sync=()=>{if(panel.hidden){dock.append(actions);dock.hidden=false;}else{anchor.after(actions);dock.hidden=true;}};
   new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['hidden']});sync();
   dock.addEventListener('beforexrselect',e=>e.preventDefault());
  }
 }
 const motion=overlay?.querySelector(':scope > #motion-dock,:scope > #motion-controls');
 if(motion){
  const measure=()=>document.documentElement.style.setProperty('--collection-motion-height',motion.getBoundingClientRect().height+'px');
  new ResizeObserver(measure).observe(motion);window.addEventListener('resize',measure);measure();
 }
 const experiment=document.querySelector('#outline')||document.querySelector('#stage #video');
 const placement=/\/stone-room\/reference\/placement\.html$/.test(location.pathname);
 if(experiment||placement){
  document.body.classList.add('collection-simple-page');
  const toggle=document.createElement('button');toggle.id='collection-simple-menu';toggle.textContent='Hide menu';toggle.setAttribute('aria-expanded','true');document.body.append(toggle);
  toggle.onclick=()=>{const hidden=document.body.classList.toggle('collection-simple-hidden');toggle.textContent=hidden?'Show menu':'Hide menu';toggle.setAttribute('aria-expanded',String(!hidden));};
 }
 const walking=document.querySelector('#walking-overlay');
 if(walking){
  const info=walking.querySelector('.walking-info');
  if(info){
   const toggle=document.createElement('button');toggle.className='collection-menu';toggle.textContent='Hide menu';toggle.setAttribute('aria-expanded','true');
   info.id ||= 'collection-walking-info';toggle.setAttribute('aria-controls',info.id);walking.append(toggle);
   toggle.onclick=()=>{const hidden=walking.classList.toggle('collection-info-hidden');toggle.textContent=hidden?'Show menu':'Hide menu';toggle.setAttribute('aria-expanded',String(!hidden));};
   toggle.addEventListener('beforexrselect',e=>e.preventDefault());
  }
 }
 if(document.querySelector('#toolbar')&&document.querySelector('#ar-overlay')){
  const toggle=document.createElement('button');toggle.id='collection-room-menu';toggle.textContent='Hide menu';toggle.setAttribute('aria-expanded','true');
  const home=document.createComment('Room menu home');document.body.append(home,toggle);
  toggle.onclick=()=>{const hidden=document.body.classList.toggle('collection-room-hidden');toggle.textContent=hidden?'Show menu':'Hide menu';toggle.setAttribute('aria-expanded',String(!hidden));};
  toggle.addEventListener('beforexrselect',e=>e.preventDefault());
  const sync=()=>{if(document.body.classList.contains('in-ar'))document.querySelector('#ar-overlay').append(toggle);else home.after(toggle);};
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();
 }
})();
