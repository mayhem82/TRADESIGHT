(() => {
  const button=document.querySelector('#ar-menu-toggle');
  const panel=document.querySelector('#ar-settings-panel');
  if(!button||!panel)return;
  button.addEventListener('beforexrselect',event=>event.preventDefault());
  button.addEventListener('click',()=>{
    const closed=panel.classList.toggle('menu-collapsed');
    button.textContent=closed?'Menu':'Close menu';
    button.setAttribute('aria-expanded',String(!closed));
    if(closed)panel.scrollTop=0;
  });
})();
