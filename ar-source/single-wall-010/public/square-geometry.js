// One whole vertical panel using008g's closed-back floor-anchor convention.
export function surface(t){return {p:[(t+Math.PI/2)/Math.PI-.5,0,-1],n:[0,0,-1],wall:0};}
export function squareMesh(){const p=[[-.5,-.5,-1],[.5,-.5,-1],[.5,.5,-1],[-.5,.5,-1]],data=[];for(const i of [0,2,1,0,3,2])data.push(...p[i],0,0,-1);return {data:new Float32Array(data),stripCount:6};}
export function squareGuides(){return {data:new Float32Array([-.5,-.5,-1,.5,-.5,-1,.5,.5,-1,-.5,.5,-1]),ranges:[{first:0,count:4}]};}
