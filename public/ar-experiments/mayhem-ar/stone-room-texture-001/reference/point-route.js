import {Node} from './js/render/core/node.js';
import {mat4} from './js/render/math/gl-matrix.js';
export class PointRoute {
  constructor(scene,reticle,ground,walking,walls){
    this.scene=scene;this.reticle=reticle;this.ground=ground;this.walking=walking;this.walls=walls;this.points=[];this.markers=[];this.scanMarkers=[];this.active=false;this.scanning=false;this.marking=false;this.cursor=0;this.visits=0;this.finished=false;this.segmentStart=null;this.lastScan=-Infinity;this.lastUI=-Infinity;this.loop=false;this.actor=null;
    this.info=document.querySelector('#route-status');this.scanButton=document.querySelector('#ground-scan');this.addButton=document.querySelector('#route-add');this.playButton=document.querySelector('#route-play');
    this.scanButton?.addEventListener('click',()=>{this.scanning=!this.scanning;if(this.scanning){this.pause();this.marking=false;this.walls.cancelBuild();}this.sync();});
    this.addButton?.addEventListener('click',()=>{this.marking=!this.marking;if(this.marking){this.pause();this.scanning=false;this.walls.cancelBuild();}this.sync();});
    this.playButton?.addEventListener('click',()=>this.active?this.pause():this.play());
    document.querySelector('#route-clear')?.addEventListener('click',()=>this.clear());
    document.querySelector('#route-loop')?.addEventListener('change',event=>{this.loop=event.target.checked;});
    document.querySelector('#route-markers')?.addEventListener('change',()=>this.sync());
    document.querySelector('#walk-stop')?.addEventListener('click',()=>this.pause());
    for(const id of ['walk-reposition','wall-add'])document.querySelector('#'+id)?.addEventListener('click',()=>{this.pause();this.marking=false;this.scanning=false;this.sync();});
    this.walking.joystick.onEngage=()=>this.pause();
    window.addEventListener('blur',()=>this.pause());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();});
    this.sync();
  }
  begin(session){this.end();session.addEventListener('visibilitychange',()=>{if(session.visibilityState!=='visible')this.pause();});this.sync();}
  attach(actor){this.actor=actor;this.sync();}
  drop(marker){marker.visible=false;this.scene.removeNode(marker);setTimeout(()=>{const visit=n=>{for(const child of n.children)visit(child);n.clearRenderPrimitives();};visit(marker);},0);}
  marker(matrix,scale){const root=new Node(),ring=this.reticle.clone();ring.matrix=mat4.create();ring.scale=new Float32Array([scale,scale,scale]);ring.visible=true;const m=new Float32Array(matrix);m[13]+=.012;root.matrix=m;root.addNode(ring);this.scene.addNode(root);return root;}
  observe(time,pose,matrix){
    if(time-this.lastUI>500){this.lastUI=time;this.sync();}
    if(!this.scanning||!pose||!matrix||time-this.lastScan<100)return;
    this.lastScan=time;const result=this.ground.recordScan(matrix);if(!result)return;
    if(result.fresh){this.scanMarkers.push(this.marker(matrix,.18));if(this.scanMarkers.length>48)this.drop(this.scanMarkers.shift());}
    this.sync();
  }
  addStop(matrix){
    if(this.points.length>=16){if(this.info)this.info.textContent='16 stops maximum. Clear stops to plan another route.';return;}
    const result=this.ground.recordScan(matrix);if(!result)return;
    const point={x:matrix[12],y:matrix[13],z:matrix[14]};
    if(this.points.some(p=>Math.hypot(p.x-point.x,p.z-point.z)<.12)){if(this.info)this.info.textContent='Choose a stop at least 12 cm from an existing stop.';return;}
    this.points.push(point);this.markers.push(this.marker(matrix,.65));this.finished=false;this.sync();
  }
  sync(){
    if(this.scanButton)this.scanButton.textContent=this.scanning?'Finish scan':'Scan ground';
    if(this.addButton)this.addButton.textContent=this.marking?'Finish stops':'Add stop';
    if(this.playButton){this.playButton.disabled=!this.actor||!this.points.length;this.playButton.textContent=this.active?'Pause route':(!this.finished&&this.cursor>0?'Resume route':'Walk route');}
    const show=document.querySelector('#route-markers')?.checked!==false;
    for(const marker of this.markers)marker.visible=show||this.marking;
    for(const marker of this.scanMarkers)marker.visible=this.scanning;
    if(this.info)this.info.textContent=`Ground: ${this.ground.scanMap.size} samples · Stops: ${this.points.length}`+(this.active?` · Walking to ${this.cursor+1}`:this.finished?' · Route complete':this.marking?' · Tap circles to add stops':this.scanning?' · Move phone over the ground':'');
  }
  play(){
    if(!this.actor||!this.points.length)return;
    this.walking.joystick.stop();this.scanning=false;this.marking=false;this.walls.cancelBuild();
    if(this.finished||this.cursor>=this.points.length)this.cursor=0;
    this.finished=false;this.active=true;this.segmentStart=this.position();this.sync();
  }
  position(){const m=this.actor.matrix;return {x:m[12],y:m[13],z:m[14]};}
  pause(){
    if(this.active){this.walking.joystick.stop();this.walking.moving=false;this.walking.motionRatio=0;}
    this.active=false;this.ground.routeHint=null;this.sync();
  }
  input(pose){
    if(!this.active||!this.actor)return;
    if(!pose){this.pause();return;}
    const position=this.position();let target=this.points[this.cursor],distance=Math.hypot(target.x-position.x,target.z-position.z);
    if(distance<.08){
      this.segmentStart={...target};this.cursor++;this.visits++;
      if(this.cursor>=this.points.length){
        if(this.loop&&this.points.length>1)this.cursor=0;
        else{this.finished=true;this.pause();if(this.info)this.info.textContent='Route complete. '+this.points.length+' stops visited.';return;}
      }
      target=this.points[this.cursor];distance=Math.hypot(target.x-position.x,target.z-position.z);this.sync();
    }
    let camera=pose.transform?.matrix;
    if(!camera&&pose.views?.[0]?.transform?.inverse?.matrix){camera=mat4.create();mat4.invert(camera,pose.views[0].transform.inverse.matrix);}
    const length=camera?Math.hypot(camera[8],camera[10]):0,forward=length>.1?[-camera[8]/length,-camera[10]/length]:this.walking.forward;
    const dx=(target.x-position.x)/(distance||1),dz=(target.z-position.z)/(distance||1),strength=Math.min(1,distance/Math.max(.1,this.walking.speed*.15));
    this.walking.joystick.x=(-forward[1]*dx+forward[0]*dz)*strength;this.walking.joystick.y=(forward[0]*dx+forward[1]*dz)*strength;
    this.ground.routeHint={a:this.segmentStart||position,b:target};
  }
  clear(){this.pause();for(const marker of this.markers)this.drop(marker);this.points=[];this.markers=[];this.cursor=0;this.visits=0;this.finished=false;this.segmentStart=null;this.sync();}
  end(){this.clear();for(const marker of this.scanMarkers)this.drop(marker);this.scanMarkers=[];this.actor=null;this.scanning=false;this.marking=false;this.lastScan=-Infinity;this.sync();}
}
