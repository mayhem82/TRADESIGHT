import {WalkingControls as BaseWalkingControls} from './walking-controls-stable.js';
import {mat4} from './js/render/math/gl-matrix.js';
export class WalkingControls extends BaseWalkingControls {
  constructor(ground,walls,appearance) {super();this.ground=ground;this.walls=walls;this.appearance=appearance;}
  attach(node) {
    const placement=node.matrix.slice();super.attach(node);this.ground.place(node,placement);
    const upright=mat4.create();mat4.fromYRotation(upright,Math.atan2(placement[8],placement[10]));upright[12]=placement[12];upright[13]=placement[13];upright[14]=placement[14];node.matrix=upright;
  }
  end(){this.ground.end();this.walls.end();super.end();}
  update(time,pose) {
    this.travelDistance=0;
    this.navigation?.input(pose);
    const before=this.node?.matrix.slice(),wasPlacing=this.placing;
    super.update(time,pose);
    if(!before||!this.node||!pose||wasPlacing||!this.moving)return;
    const next=this.node.matrix.slice(),distance=Math.hypot(next[12]-before[12],next[14]-before[14]);
    const dx=next[12]-before[12],dz=next[14]-before[14],length=Math.hypot(dx,dz)||1;
    this.ground.want={x:next[12]+dx/length*.16,y:before[13],z:next[14]+dz/length*.16};
    const surface=this.ground.resolve(next[12],next[14],before[13],distance);
    // Ground samples adjust elevation only. Missing samples or virtual
    // occlusion walls must never block the user's joystick movement.
    next[13]=surface.ok?surface.y:before[13];
    this.travelDistance=Math.hypot(next[12]-before[12],next[13]-before[13],next[14]-before[14]);
    this.node.matrix=next;
    this.status.textContent=this.ground.enabled?(surface.ok?'Walking along detected ground. Release to stop.':'Walking. Height held until ground is detected.'):'Walking. Release to stop.';
  }
}
