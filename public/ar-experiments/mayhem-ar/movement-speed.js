// Translation only. Existing frame-time clamps, input ownership and yaw stay intact.
export function multiplierFromExponent(value){
 const exponent=Number(value);
 return 2**Math.max(-3,Math.min(5,Number.isFinite(exponent)?exponent:0));
}
export function installMovementSpeed(){
 let exponent=0,installed=false;
 const multiplier=()=>multiplierFromExponent(exponent);
 window.ARTravelSpeed=Object.freeze({get multiplier(){return multiplier();}});
 function attach(){
  if(installed)return true;
  const colour=document.querySelector('#ar-sticks');
  const wall=document.querySelector('#motion-controls');
  const tv=document.querySelector('#joystick-dock .sticks');
  const walking=document.querySelector('#walking-overlay .walking-pad');
  const room=document.querySelector('#joystick');
  const parent=colour||wall||tv||walking||room?.parentElement;
  if(!parent)return false;
  const root=document.createElement('div');root.className='travel-speed';
  root.innerHTML='<label for="travel-speed">Move speed</label><output id="travel-speed-value" for="travel-speed"></output><input id="travel-speed" type="range" min="-3" max="5" step="0.125" value="0" aria-label="Movement speed"><button type="button" aria-label="Reset movement speed to normal">1×</button>';
  const input=root.querySelector('input'),output=root.querySelector('output');
  const normal=()=>colour||wall?0.45:tv?0.25:walking?Number(document.querySelector('#walk-speed').value):Number(document.querySelector('#speed').value);
  const format=n=>Number(n.toPrecision(3)).toString();
  const sync=()=>{const factor=multiplier(),speed=normal()*factor;output.textContent=format(factor)+'×';const metric=document.createElement('span');metric.textContent=format(speed)+' m/s';metric.title='Ground travel at full stick';output.append(metric);input.setAttribute('aria-valuetext',format(factor)+' times normal; ground travel '+format(speed)+' metres per second at full stick');};
  input.addEventListener('input',()=>{exponent=Number(input.value);sync();});
  root.querySelector('button').onclick=e=>{e.preventDefault();input.value='0';exponent=0;sync();};
  // Do not prevent native range gestures, cancel an existing stick, or capture its pointer.
  for(const type of ['pointerdown','pointermove','pointerup','click'])root.addEventListener(type,e=>e.stopPropagation());
  root.addEventListener('beforexrselect',e=>e.preventDefault());
  if(colour||wall||tv){parent.insertBefore(root,parent.children[1]);parent.classList.add('has-travel-speed');}
  else if(walking){root.querySelector('label').textContent='Manual speed';root.title='Manual joystick movement; automatic routes keep their existing speed.';walking.append(root);walking.classList.add('has-travel-speed');document.querySelector('#walk-speed').addEventListener('change',sync);}
  else{root.classList.add('room-travel-speed');parent.append(root);document.querySelector('#speed').addEventListener('input',sync);}
  sync();installed=true;return true;
 }
 if(!attach()&&/\/ar-colour-vision-001\//.test(location.pathname)){
  const observer=new MutationObserver(()=>{if(attach())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});
 }
}
