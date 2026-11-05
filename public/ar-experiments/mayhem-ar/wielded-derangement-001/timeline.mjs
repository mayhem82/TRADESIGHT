export const DURATION=269.32;
const keys=[
 [0,.65,.42,0,'The name arrives'],[40,1.05,.65,.3,'Accumulation'],[75,1.65,.82,1,'Loaded'],[112,1.15,.58,.15,'The lock'],[155,2.05,1.02,.85,'Repetition'],[180,1.0,.62,.35,'Intact elsewhere'],[213,1.7,.76,.1,'Certainty'],[245,2.3,1.12,.8,'The architecture'],[269.32,1.1,.55,.5,'Wielded']
];
export const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
export function stateAt(seconds,energy=0){
 const t=Math.max(0,Math.min(DURATION,Number(seconds)||0));let i=0;while(i<keys.length-2&&t>=keys[i+1][0])i++;
 const a=keys[i],b=keys[i+1],u=smooth((t-a[0])/(b[0]-a[0]));const mix=j=>a[j]+(b[j]-a[j])*u;
 return {t,height:mix(1),radius:mix(2),angular:mix(3),pulse:1+Math.max(0,Math.min(1,energy))*.075,phase:a[4],twist:t*.045};
}
export function cellAt(i,s){
 const layer=Math.floor(i/12),a=i%12/12*Math.PI*2+s.twist*(layer%2?1:-1),r=s.radius*(.78+.12*layer);
 const round=[Math.cos(a),Math.sin(a)],square=round.map(v=>Math.sign(v)*Math.sqrt(Math.abs(v)));
 return {x:r*(round[0]*(1-s.angular)+square[0]*s.angular),y:.35+layer*s.height/3+Math.sin(a*2+s.t*.13)*.08,z:r*(round[1]*(1-s.angular)+square[1]*s.angular),yaw:-a+Math.PI/2,scale:s.pulse*(.8+.16*Math.sin(s.t*.18+i*.7))};
}
export function faceAt(i,s){
 const layer=Math.floor(i/4),a=i%4*Math.PI/2+s.twist*.22+layer*.45;
 const wave=(Math.sin(s.t*.19-i*1.7)+1)/2,alpha=smooth((wave-.32)/.5);
 const r=s.radius*(.95+layer*.09)+.1+alpha*.13;
 return {x:Math.sin(a)*r,y:.5+layer*s.height*.42,z:Math.cos(a)*r,yaw:a,scale:.7+alpha*.65,alpha};
}
