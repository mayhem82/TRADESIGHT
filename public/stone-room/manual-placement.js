// Lighthouse-style manual local-space placement; no measured surface is implied.
export function manualPlacement(values){
 const distance=Number(values.distance),height=Number(values.height),horizontal=Number(values.horizontal),scale=Number(values.scale),rotation=Number(values.rotation);
 if(![distance,height,horizontal,scale,rotation].every(Number.isFinite)||distance<=0||scale<=0)throw Error('Invalid manual placement values');
 return {position:[horizontal,height,-distance],scale,yaw:rotation*Math.PI/180,planeY:height};
}
export function manualPlaneTarget(origin,direction,planeY,maxDistance=100){
 if(!Number.isFinite(direction.y)||Math.abs(direction.y)<1e-6)return null;
 const distance=(planeY-origin.y)/direction.y;
 if(!(distance>0&&distance<=maxDistance))return null;
 return {x:origin.x+direction.x*distance,y:planeY,z:origin.z+direction.z*distance};
}
