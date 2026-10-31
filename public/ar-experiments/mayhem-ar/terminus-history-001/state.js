export function makeLayer(stageId){return {stageId,scale:1,rotation:0,opacity:1,offset:[0,0,0]};}
export function makeState(){return {mode:'remote',comparison:'overlay',selected:0,layers:[makeLayer('documented'),{...makeLayer('1917'),opacity:.45}],calibration:{metresPerPlanUnit:2,status:'display-only; real dimensions unverified',sourceId:null},anchor:null,tracking:false,menuVisible:true};}
export function resetAlignment(state){state.anchor=null;state.tracking=false;for(const layer of state.layers){layer.scale=1;layer.rotation=0;layer.offset=[0,0,0];}}
export function setNumber(layer,key,value){const n=Number(value);const ranges={scale:[.01,100],rotation:[-360,360],opacity:[0,1]};if(!Number.isFinite(n)||!ranges[key]||n<ranges[key][0]||n>ranges[key][1])return false;layer[key]=n;return true;}
// Distance changes position only. Scale and rotation are deliberately preserved.
export function atDistance(anchor,viewer,distance){
 if(!anchor||!viewer||!Number.isFinite(distance)||distance<.25||distance>1000)return null;
 let x=anchor[12]-viewer.x,z=anchor[14]-viewer.z,n=Math.hypot(x,z);if(n<1e-6){x=0;z=-1;n=1;}
 const matrix=new Float32Array(anchor);matrix[12]=viewer.x+x/n*distance;matrix[14]=viewer.z+z/n*distance;return matrix;
}
export function gltfForStage(stage,components=stage.components){
 // JSON glTF with embedded buffers is portable and preserves component extras.
 const buffers=[],bufferViews=[],accessors=[],meshes=[],nodes=[],materials=[];
 for(const c of components){if(!c.geometry)continue;const positions=new Float32Array(c.geometry.positions);const bytes=new Uint8Array(positions.buffer);let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  const bi=buffers.length;buffers.push({byteLength:bytes.length,uri:'data:application/octet-stream;base64,'+btoa(binary)});bufferViews.push({buffer:bi,byteLength:bytes.length,target:34962});
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];positions.forEach((n,i)=>{min[i%3]=Math.min(min[i%3],n);max[i%3]=Math.max(max[i%3],n);});
  accessors.push({bufferView:bi,componentType:5126,count:positions.length/3,type:'VEC3',min,max});materials.push({name:c.id,pbrMetallicRoughness:{baseColorFactor:[...(c.colour??[.72,.62,.48]),1],metallicFactor:0,roughnessFactor:.9},doubleSided:true});meshes.push({primitives:[{attributes:{POSITION:bi},material:bi,mode:c.geometry.mode==='LINES'?1:4}]});nodes.push({name:c.id,mesh:bi,extras:{measurementStatus:c.measurementStatus,sourceIds:c.sourceIds,representation:c.representation??'unspecified',unknowns:c.unknowns??[],provenance:c.provenance??null}});
 }
 return {asset:{version:'2.0',generator:'TRADESIGHT · source-bounded Terminus history'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials,buffers,bufferViews,accessors,extras:{stageId:stage.id,geometryStatus:stage.geometryStatus,units:stage.measured?'metres, verified':'dimensionless ratios with display scaling; real dimensions unverified',unknowns:stage.unknown}};
}
