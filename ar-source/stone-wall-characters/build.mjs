// Keep the published Yowie 4 wall, hit-test and movement engine byte-for-byte.
// The frozen build exposes just its replaceable model and motion to the picker.
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../../public/ar-experiments/mayhem-ar/stone-room/reference/', import.meta.url);
const original = readFileSync(new URL('bellbrook-yowie-4-d0e78b45bad9.bundle.js', root), 'utf8');
const reference = original.replace(/\r\n/g, '\n');
let source = reference;
function replaceOnce(before, after) {
  if (source.split(before).length !== 2) throw Error('The frozen build has changed near ' + before.slice(0,65));
  source = source.replace(before, () => after);
}
const picker = 'window.stoneWallCharacters';
replaceOnce('new we(`tradesight-yowie-exposure`,1.5)','new we('+picker+'.initial.exposureKey||`tradesight-yowie-exposure`,'+picker+'.initial.defaultEV??1.5)');
replaceOnce('Y?`media/gltf/yowie-v1/yowie.gltf`:`media/gltf/sunflower/sunflower.gltf`', picker+'.initial.scene');
const selectStart = 'document.querySelector(`#model-choice`).value=';
const selectEnd = 'Z.textContent=`Loading `+';
const start=source.indexOf(selectStart), end=source.indexOf(selectEnd,start);
if (start<0 || end<0 || end-start>400) throw Error('Could not locate the pre-AR-only model picker');
replaceOnce(source.slice(start,end),'');
replaceOnce('(Y?`Bellbrook Yowie`:`sunflower`)',picker+'.initial.name');
replaceOnce('Te.load(W,hn,`media/gltf/yowie-motion-v1/`,!1)', 'Te.load(W,hn,'+picker+'.initial.motion,!1)');
replaceOnce('dn.bind(hn),un.bind(W,hn)', 'dn.bind(hn),un.bind(W,hn),'+picker+'.connect({renderer:W,modelNode:Nt,motionPlayer:Te,template:J,actors:()=>gn,appearance:un,exposure:dn,currentVisual:hn,currentMotion:fn,setActive:(visual,motion)=>{hn=visual;fn=motion}})');
replaceOnce('`Bellbrook Yowie loaded. Idle and Walk animations ready.`',picker+'.initial.name+` loaded. Idle and Walk animations ready.`');
const output='stone-wall-characters-'+createHash('sha256').update(source).digest('hex').slice(0,12)+'.bundle.js';
writeFileSync(new URL(output,root),source);
console.log(output);
