export function response(matrix,viewer,revealDegrees=55){
  if(!matrix||!viewer)return {angle:90,gain:0,distance:0};
  const x=viewer.x-matrix[12],y=viewer.y-matrix[13],z=viewer.z-matrix[14];
  const distance=Math.hypot(x,y,z);
  const dot=distance>1e-5?Math.min(1,Math.abs((x*matrix[8]+y*matrix[9]+z*matrix[10])/distance)):0;
  const angle=Math.acos(dot)*180/Math.PI;
  const t=Math.max(0,Math.min(1,1-angle/Math.max(1,revealDegrees)));
  return {angle,gain:t*t*(3-2*t),distance};
}
