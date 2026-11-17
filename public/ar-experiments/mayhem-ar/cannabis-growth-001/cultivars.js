import {clamp,smooth} from './growth.js';
// Source timestamps refer to the producer's downloadable 4K originals. The
// videos are edited, single-view records. Silhouette curves are hand fitted;
// obscured branch topology and continuous interpolation are reconstructions.
function branches(rows,secondaryCount){
 const result=[];
 rows.forEach(([attach,end,reach,angle,birth,finish],index)=>result.push({parent:0,attach,end,reach,angle:angle*Math.PI/180,birth,finish,confidence:index<6?'visible silhouette / estimated depth':'occluded / inferred depth'}));
 for(let i=0;i<secondaryCount;i++){
  const parent=result[i],direction=i%2?1:-1;
  result.push({parent:i+1,attach:.53,end:.90,reach:parent.reach*.39,angle:parent.angle+direction*.80,birth:parent.birth+.10,finish:parent.finish+.11,confidence:'inferred hidden branchlet'});
 }
 return result;
}
// Each row: source second, displayed stage, height in m (source annotation),
// fitted radial spread, leaf expansion, cluster development, pigment, maturity.
export const CULTIVARS={
 'night-queen':{
  name:'Auto Night Queen',height:.75,width:.50,leafLength:.23,leafWidth:.19,colaLength:.145,flowerStart:.37,senescence:.28,
  description:'A dense, layered canopy with a clear central tip and flowering side branches. Reconstructed from the filmed specimen.',
  video:'https://www.youtube.com/watch?v=MEUo_O3OfVA',file:'Auto-Night-Queen-seed-to-harvest-timelapse.mp4',
  frames:[[22,'Seedling',.05,.07,.05,0,0,0],[28,'Early leaves',.08,.16,.13,0,0,0],[36,'Expanding leaves',.17,.30,.28,0,0,0],[44,'Branching canopy',.36,.57,.51,0,0,0],[52,'Extending branches',.52,.82,.76,.05,0,0],[60,'Young clusters',.70,.96,.95,.22,0,0],[68,'Flowering branches',.72,1,1,.45,0,.05],[76,'Cluster expansion',.74,1,1,.68,.02,.16],[84,'Developing flowers',.75,1,1,.84,.04,.40],[92,'Maturing clusters',.75,1,1,.95,.06,.72],[100,'Mature specimen',.75,1,1,1,.08,1]],
  branches:branches([[.14,.61,.42,26,.055,.40],[.18,.64,.43,205,.070,.42],[.24,.69,.45,118,.09,.44],[.28,.72,.44,296,.105,.45],[.36,.77,.40,38,.13,.46],[.40,.79,.38,220,.15,.48],[.48,.83,.34,130,.18,.49],[.52,.85,.32,310,.20,.50],[.60,.88,.26,52,.23,.52],[.65,.90,.24,233,.25,.53],[.73,.93,.18,142,.28,.54],[.78,.95,.14,322,.30,.55]],8)
 },
 'lemon-kix':{
  name:'Auto Lemon Kix',height:1.03,width:.68,leafLength:.23,leafWidth:.12,colaLength:.18,flowerStart:.46,senescence:.62,
  description:'A taller, open structure with long side branches and separated clusters. Its own leaf and flowering sequence.',
  video:'https://www.youtube.com/watch?v=WvpcMQ8qTAc',file:'Auto-Lemon-Kix-seed-to-harvest-timelapse.mp4',
  frames:[[22,'Seedling',.09,.06,.04,0,0,0],[28,'Early leaves',.22,.13,.13,0,0,0],[36,'Expanding leaves',.39,.29,.31,0,0,0],[44,'Branching canopy',.70,.51,.56,0,0,0],[52,'Extending branches',.70,.78,.84,.015,0,0],[60,'Young clusters',.97,.98,1,.18,0,0],[68,'Flowering branches',1.02,1,1,.38,0,.05],[76,'Cluster expansion',1.02,1,1,.60,0,.20],[84,'Developing flowers',1.02,1,1,.79,0,.43],[92,'Maturing clusters',1.03,1,1,.94,0,.75],[100,'Mature specimen',1.03,1,1,1,0,1]],
  branches:branches([[.11,.57,.47,18,.055,.45],[.16,.61,.46,198,.07,.47],[.23,.67,.46,110,.095,.48],[.29,.71,.44,290,.115,.50],[.36,.77,.40,30,.14,.51],[.43,.81,.37,211,.17,.52],[.51,.85,.32,120,.20,.54],[.58,.88,.28,300,.23,.55],[.66,.91,.22,42,.26,.57],[.73,.94,.18,222,.29,.58]],6)
 },
 'blackberry-kush':{
  name:'Auto Blackberry Kush',height:1.03,width:.58,leafLength:.21,leafWidth:.145,colaLength:.205,flowerStart:.31,senescence:.48,
  description:'A prominent central flowering structure, surrounding tips and progressive plum-colored clusters. Green early foliage changes as it matures.',
  video:'https://www.youtube.com/watch?v=5--nzRjMMnM',file:'Auto-Blackberry-Kush-seed-to-harvest-timelapse.mp4',
  frames:[[22,'Seedling',.10,.06,.04,0,0,0],[28,'Early leaves',.26,.16,.15,0,0,0],[36,'Expanding leaves',.62,.40,.40,0,0,0],[44,'Branching canopy',.91,.72,.75,.08,.04,0],[52,'Young clusters',.91,.94,.94,.27,.24,.02],[60,'Flowering branches',.98,1,1,.47,.44,.10],[68,'Cluster expansion',1,1,1,.67,.66,.25],[76,'Developing flowers',1.02,1,1,.82,.83,.47],[84,'Maturing clusters',1.03,1,1,.95,.94,.75],[92,'Mature specimen',1.03,1,1,1,1,1]],
  branches:branches([[.13,.60,.43,14,.05,.36],[.19,.63,.43,194,.07,.38],[.26,.69,.44,106,.09,.40],[.32,.73,.43,286,.11,.42],[.39,.78,.37,22,.135,.44],[.46,.82,.34,202,.16,.46],[.54,.86,.29,114,.19,.48],[.61,.89,.25,294,.22,.49],[.69,.92,.20,32,.25,.50],[.76,.95,.15,212,.28,.51]],8)
 }
};
export function sampleCultivar(id,progress){
 const profile=CULTIVARS[id]||CULTIVARS['night-queen'],p=clamp(progress),frames=profile.frames,second=frames[0][0]+p*(frames.at(-1)[0]-frames[0][0]);
 let index=1;while(index<frames.length-1&&second>frames[index][0])index++;
 const a=frames[index-1],b=frames[index],t=smooth(a[0],b[0],second),v=k=>a[k]+(b[k]-a[k])*t;
 const stage=p<.13?'Seedling':v(5)<.04?'Leaves & branches':v(5)<.35?'Young flowers':v(7)<.55?'Flower clusters':'Maturing';
 return{progress:p,sourceSecond:second,height:v(2),spread:v(3),foliage:v(4),flowers:v(5),purple:v(6),maturity:v(7),stage,referenceLabel:(t<.5?a[1]:b[1])+' · '+Math.round(second)+' s in source'};
}
export const branchGrowth=(branch,progress)=>smooth(branch.birth,branch.finish,progress);
