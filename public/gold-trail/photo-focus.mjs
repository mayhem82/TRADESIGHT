// Close-up bounds are normalized to the original, orientation-corrected photo.
export function photoFocusAt(parent, x, y) {
  const p=parent||{x:0,y:0,width:1,height:1};
  if (![p.x,p.y,p.width,p.height,x,y].every(Number.isFinite)||p.x<0||p.y<0||p.width<=0||p.height<=0||p.x+p.width>1.00000001||p.y+p.height>1.00000001||x<0||x>=1||y<0||y>=1) return null;
  if (p.width<=1/16 || p.height<=1/16) return null;
  const width=p.width/2,height=p.height/2;
  const left=Math.max(p.x,Math.min(p.x+p.width-width,p.x+x*p.width-width/2));
  const top=Math.max(p.y,Math.min(p.y+p.height-height,p.y+y*p.height-height/2));
  return {x:left,y:top,width,height};
}
