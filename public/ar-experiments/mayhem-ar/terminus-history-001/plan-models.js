import {reviewedComponent} from './geometry.js';
// Reviewed by an image-viewing researcher and supplied by the parent task.
// These are source-photo trace ratios, not rectified survey coordinates.
export const trace={
 '1841':[[.7659,.7902],[1.5317,.7854],[1.5366,1.5463],[.7756,1.561]],
 '1863':[[.0146,.0439],[.7512,.0244],[.7756,1.561],[.1512,1.5707],[.0098,1.439]],
 wing:[[ -.0195,-1.2683],[1.2049,-1.3122],[1.2098,-.9366],[.9024,-.9317],[.8195,-.8439],[.8293,.0049],[-.0049,.0341]],
 corner:[[0,.0341],[.9951,0],[1.0049,1.5268],[.9122,1.561],[.1561,1.5659],[.0146,1.4293]],
 deck:[[1.0049,.3756],[1.5073,.3659],[1.5317,1.4146],[1.3756,1.4195],[1.3756,1.5512],[1.0098,1.5561]],
 courtyard:[[.8341,-.839],[1.5366,-.8585],[1.5463,.361],[1.0049,.3756],[1.0049,-.0049],[.839,.0049]]
};
export const extraction={reviewer:'Image-viewing researcher; trace reviewed and supplied by parent',reference:'Private user-supplied Terminus heritage plaque, 9595.jpg',coordinateUnits:'dimensionless-plan-ratios',nativeSize:[1536,2048],rectification:'None; photographed plan is visibly projective',displayOrigin:[531,549],displayPixelsPerUnit:205,coordinateUse:'Supplied UV trace used directly; display normalization is not a native-pixel metric calibration',direction:'u right toward rear; v down toward John Street. Not georeferenced.',traceUncertainty:'Typically 3–6 displayed pixels; up to 10 on faint dashed corners. Excludes photographic distortion and plaque drafting error.'};
const commonUnknowns=['Metric size unverified','Photo perspective has not been rectified','No surveyed alignment','Wall elevations and architectural detail unresolved'];
function volume(id,key,height,kind,sourceIds=['plaque']){const c=reviewedComponent({id,footprint:trace[key],height:Math.max(.004,height),sourceIds,extraction,unknowns:[...commonUnknowns,kind==='roof-envelope'?'Traced roof outline is not a proven wall-line footprint':'Historical footprint does not establish original height','Vertical extent is an adjustable illustration, not historical evidence']});c.representation=kind;c.colour=key==='deck'?[.58,.65,.45]:key==='wing'?[.72,.52,.39]:[.84,.67,.48];return c;}
function outline(id,key){const p=trace[key],positions=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];for(let j=0;j<8;j+=2){const t=j/8,u=(j+1)/8;positions.push(a[0]+(b[0]-a[0])*t,.012,a[1]+(b[1]-a[1])*t,a[0]+(b[0]-a[0])*u,.012,a[1]+(b[1]-a[1])*u);}}return {id,measurementStatus:'estimated',sourceIds:['plaque'],representation:'historical-footprint-reference',geometry:{positions,mode:'LINES'},unknowns:[...commonUnknowns,'This dashed prior footprint is a reference; persistence into this phase is unverified'],provenance:extraction};}
export function componentsForStage(id,height=.45){
 if(!Number.isFinite(height)||height<0||height>2)throw Error('Illustrative height must be 0–2 relative plan units');
 const wing=()=>volume('1900-wing-roof-envelope','wing',height,'roof-envelope');
 const corner=()=>volume('1917-corner-roof-envelope','corner',height,'roof-envelope');
 const deck=()=>volume('2017-visible-deck-area','deck',height*.45,'visible-deck-envelope');
 if(id==='1841')return [outline('1841-dashed-footprint','1841')];
 if(id==='1863')return [volume('1863-described-building','1863',height,'historical-footprint-envelope'),outline('1841-incorporated-footprint-reference','1841')];
 if(id==='1900')return [wing(),outline('1863-prior-corner-reference','1863'),outline('1841-prior-footprint-reference','1841')];
 if(id==='1917')return [wing(),corner()];
 if(['2017','2018','documented'].includes(id))return [wing(),corner(),deck()];
 throw Error('Unknown historical stage '+id);
}
