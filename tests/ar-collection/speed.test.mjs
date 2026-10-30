import test from 'node:test';
import assert from 'node:assert/strict';
import {multiplierFromExponent} from '../../public/ar-experiments/mayhem-ar/movement-speed.js';
import * as colour from '../../public/ar-experiments/mayhem-ar/ar-colour-vision-001/joystick.js';
import * as sound from '../../public/ar-experiments/mayhem-ar/ar-sound-vision-autostereography-001/joystick.js';
import * as single from '../../ar-source/single-wall-009/public/joystick.js';
import * as dual from '../../ar-source/single-wall-010/public/joystick.js';
const camera=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} vs ${b}`);
test.afterEach(()=>delete globalThis.ARTravelSpeed);
test('logarithmic speed is bounded and normal by default',()=>{
 assert.equal(multiplierFromExponent(0),1);assert.equal(multiplierFromExponent(-3),.125);assert.equal(multiplierFromExponent(5),32);
 assert.equal(multiplierFromExponent(-100),.125);assert.equal(multiplierFromExponent(100),32);assert.equal(multiplierFromExponent(NaN),1);
 for(let value=-3;value<5;value+=.125)assert.ok(multiplierFromExponent(value)<multiplierFromExponent(value+.125));
});
for(const [name,api] of Object.entries({colour,sound,single,dual})){
 test(`${name}: measurable 1/8x to 32x travel, independent of refresh rate`,()=>{
  for(const rate of [30,60,90])for(const multiplier of [.125,1,32]){
   globalThis.ARTravelSpeed={multiplier};let distance=0;
   for(let frame=0;frame<rate*10;frame++)distance+=api.horizontalStep(camera,1,0,1/rate)[0];
   close(distance,.45*10*multiplier);
  }
  globalThis.ARTravelSpeed={multiplier:32};close(api.horizontalStep(camera,1,0,10)[0],.45*.05*32);
  close(api.horizontalStep(camera,1,0,-1)[0],0);
 });
 if(api.elevationYawStep)test(`${name}: vertical translation scales; yaw remains unchanged`,()=>{
  for(const multiplier of [.125,1,32]){
   globalThis.ARTravelSpeed={multiplier};close(api.elevationYawStep(0,-1,.02).dy,.35*.02*multiplier);
   close(api.elevationYawStep(1,0,.02).yaw,-Math.PI/5*.02);
  }
 });
}
