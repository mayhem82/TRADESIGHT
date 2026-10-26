import {sceneViewerIntent} from './native-intent.mjs';
const select=document.querySelector('#model'),launch=document.querySelector('#launch'),alternate=document.querySelector('#arcore'),error=document.querySelector('#error');
let config=null,generation=0;
try{const r=await fetch('./library.json');if(r.ok)config=await r.json()}catch{}
async function update(){
 const current=++generation;launch.removeAttribute('href');alternate.hidden=true;launch.textContent='Preparing Android AR…';
 try{
  if(config){
   const r=await fetch('/api/cad/jobs/'+config.jobs[select.value]+'/ar-link');
   if(!r.ok)throw Error('Open Stone Room from the paired TradeSight library to reconnect Android AR.');
   const link=await r.json();if(current!==generation)return;
   // Primary route is returned by the original CAD service, exactly like the
   // existing carport/garden native viewers. No new asset signing or AR backend.
   launch.href=link.androidIntent;alternate.href=sceneViewerIntent(location.href,select.value,link.assetUrl);alternate.hidden=false;
  }else launch.href=sceneViewerIntent(location.href,select.value);
  launch.hidden=false;launch.textContent='Open Android AR';
 }catch(e){if(current!==generation)return;launch.hidden=true;error.hidden=false;error.textContent=e.message}
}
select.onchange=update;update();
if(new URLSearchParams(location.search).has('unavailable'))error.hidden=false;
