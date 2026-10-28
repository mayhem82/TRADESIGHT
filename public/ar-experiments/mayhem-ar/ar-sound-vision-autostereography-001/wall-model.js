// The surface circle anchors the closed back wall. Local +Z is the opening,
// already rotated away from the placement viewer by Placement's accepted yaw.
export function anchoredWallModel(placement,world,side,height){
 if(!placement||!world)return null;
 const model=new Float32Array(placement);
 model[12]+=model[8]*side;model[14]+=model[10]*side;
 model[13]=world[13]+height/2;
 return model;
}
