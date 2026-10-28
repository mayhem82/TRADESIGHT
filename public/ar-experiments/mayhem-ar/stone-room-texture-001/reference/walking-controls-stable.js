import {mat4} from './js/render/math/gl-matrix.js';

export class ThumbJoystick {
  constructor(element) {
    this.element=element;this.knob=element.querySelector('.joystick-knob');this.x=0;this.y=0;this.pointer=null;
    element.addEventListener('pointerdown',event=>{
      if(this.pointer!==null||event.button>0)return;
      this.onEngage?.();this.pointer=event.pointerId;element.setPointerCapture(event.pointerId);this.move(event);event.preventDefault();
    });
    element.addEventListener('pointermove',event=>{if(event.pointerId===this.pointer){this.move(event);event.preventDefault();}});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,event=>{if(event.pointerId===this.pointer)this.stop();});
    window.addEventListener('blur',()=>this.stop());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();});
  }
  move(event) {
    const rect=this.element.getBoundingClientRect(),radius=rect.width*.32;
    let dx=(event.clientX-rect.left-rect.width/2)/radius,dy=(event.clientY-rect.top-rect.height/2)/radius;
    const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}
    const strength=Math.max(0,(Math.min(length,1)-.12)/.88),normal=Math.hypot(dx,dy)||1;
    this.x=dx/normal*strength;this.y=-dy/normal*strength;
    this.knob.style.transform=`translate(${dx*radius}px,${dy*radius}px)`;
    this.element.setAttribute('aria-valuetext',strength>0?'Walking':'Stopped');
  }
  stop() {
    const pointer=this.pointer;this.pointer=null;this.x=0;this.y=0;
    this.knob.style.transform='translate(0px,0px)';this.element.setAttribute('aria-valuetext','Stopped');
    if(pointer!==null&&this.element.hasPointerCapture(pointer))this.element.releasePointerCapture(pointer);
  }
}

export class WalkingControls {
  constructor() {
    this.overlay=document.querySelector('#walking-overlay');this.status=document.querySelector('#walking-status');
    this.joystick=new ThumbJoystick(document.querySelector('#walking-joystick'));this.node=null;this.placing=true;this.speed=.75;this.lastTime=null;this.forward=[0,-1];this.active=false;this.moving=false;this.motionRatio=0;
    for(const element of this.overlay.querySelectorAll('[data-xr-control]'))element.addEventListener('beforexrselect',event=>event.preventDefault());
    document.querySelector('#walk-stop').addEventListener('click',()=>this.stop());
    document.querySelector('#walk-reposition').addEventListener('click',()=>{this.stop();this.placing=true;this.status.textContent='Aim at the ground and tap the circle to reposition.';});
    document.querySelector('#walk-speed').addEventListener('change',event=>{this.speed=Number(event.target.value);this.stop();});
    document.querySelector('#walk-exit').addEventListener('click',()=>{this.stop();this.session?.end();});
  }
  begin(session) {
    this.session=session;this.active=true;this.lastTime=null;this.placing=true;this.overlay.hidden=false;
    this.status.textContent='Move the phone to find the circle. Tap to place your companion.';
    session.addEventListener('visibilitychange',()=>{if(session.visibilityState!=='visible')this.stop();});
  }
  attach(node) {this.node=node;this.placing=false;this.stop();this.status.textContent='Drag the joystick to walk. Release to stop.';}
  stop() {this.moving=false;this.motionRatio=0;this.joystick.stop();if(this.node&&!this.placing)this.status.textContent='Stopped. Drag the joystick to walk.';}
  end() {this.stop();this.active=false;this.moving=false;this.motionRatio=0;this.node=null;this.session=null;this.placing=true;this.lastTime=null;this.overlay.hidden=true;}
  update(time,pose) {
    this.moving=false;this.motionRatio=0;
    const dt=this.lastTime===null?0:Math.max(0,Math.min((time-this.lastTime)/1000,.05));this.lastTime=time;
    if(!this.active)return;
    if(!pose){this.stop();if(this.node)this.node.visible=false;this.status.textContent='Tracking paused. Move the phone slowly.';return;}
    if(!this.node)return;
    this.node.visible=true;
    if(this.placing)return;
    let camera=pose.transform?.matrix;
    if(!camera&&pose.views?.[0]?.transform?.inverse?.matrix){camera=mat4.create();mat4.invert(camera,pose.views[0].transform.inverse.matrix);}
    if(camera){const length=Math.hypot(camera[8],camera[10]);if(length>.1)this.forward=[-camera[8]/length,-camera[10]/length];}
    const x=this.joystick.x,y=this.joystick.y;if(Math.hypot(x,y)<.001)return;
    this.moving=true;this.motionRatio=Math.hypot(x,y)*this.speed/.75;
    const [fx,fz]=this.forward,vx=-fz*x+fx*y,vz=fx*x+fz*y;
    const previous=this.node.matrix,position=[previous[12]+vx*this.speed*dt,previous[13],previous[14]+vz*this.speed*dt];
    const matrix=mat4.create();mat4.fromYRotation(matrix,Math.atan2(vx,vz));matrix[12]=position[0];matrix[13]=position[1];matrix[14]=position[2];this.node.matrix=matrix;
    this.status.textContent='Walking. Release the joystick to stop.';
  }
}
