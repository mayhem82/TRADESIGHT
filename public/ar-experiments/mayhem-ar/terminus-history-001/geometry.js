// Geometry construction consumes reviewed plan ratios; this module infers no hotel footprint.
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export function triangulate(polygon){
 if(!Array.isArray(polygon)||polygon.length<3||polygon.some(p=>p.length!==2||p.some(v=>!Number.isFinite(v))))throw Error('A finite plan polygon is required');
 const area=polygon.reduce((s,p,i)=>{const q=polygon[(i+1)%polygon.length];return s+p[0]*q[1]-q[0]*p[1];},0);
 if(Math.abs(area)<1e-10)throw Error('Plan polygon has no area');
 const indices=polygon.map((_,i)=>i);if(area<0)indices.reverse();const triangles=[];
 const inside=(p,a,b,c)=>cross(a,b,p)>=-1e-10&&cross(b,c,p)>=-1e-10&&cross(c,a,p)>=-1e-10;
 while(indices.length>3){let found=false;for(let k=0;k<indices.length;k++){const a=indices[(k+indices.length-1)%indices.length],b=indices[k],c=indices[(k+1)%indices.length];if(cross(polygon[a],polygon[b],polygon[c])<=1e-10)continue;if(indices.some(i=>i!==a&&i!==b&&i!==c&&inside(polygon[i],polygon[a],polygon[b],polygon[c])))continue;triangles.push([a,b,c]);indices.splice(k,1);found=true;break;}if(!found)throw Error('Plan polygon must be simple and non-degenerate');}
 triangles.push([...indices]);return triangles;
}
export function extrude(footprint,height,bottom=0){
 if(!Number.isFinite(height)||height<=0||!Number.isFinite(bottom))throw Error('Extrusion height must be positive');
 triangulate(footprint);const area=footprint.reduce((s,p,i)=>{const q=footprint[(i+1)%footprint.length];return s+p[0]*q[1]-q[0]*p[1];},0),plan=area<0?[...footprint].reverse():footprint;
 const triangles=triangulate(plan),out=[],point=(i,y)=>[plan[i][0],y,plan[i][1]],face=(a,b,c)=>out.push(...a,...b,...c);
 for(const [a,b,c] of triangles){face(point(a,bottom),point(b,bottom),point(c,bottom));face(point(c,bottom+height),point(b,bottom+height),point(a,bottom+height));}
 for(let i=0;i<plan.length;i++){const j=(i+1)%plan.length;face(point(i,bottom),point(j,bottom+height),point(j,bottom));face(point(i,bottom),point(i,bottom+height),point(j,bottom+height));}
 return {positions:out};
}
export function reviewedComponent({id,footprint,height,bottom=0,sourceIds,extraction,unknowns=[],colour}){
 if(!extraction?.reviewer||!extraction?.reference||extraction.coordinateUnits!=='dimensionless-plan-ratios')throw Error('Reviewed plan extraction and dimensionless unit status required');
 return {id,sourceIds,measurementStatus:'estimated',geometry:extrude(footprint,height,bottom),colour,unknowns,provenance:{...extraction,footprint,height,bottom,heightStatus:'interpretive unless separately evidenced',metricCalibration:'unverified'}};
}
