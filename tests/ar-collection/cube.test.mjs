import test from 'node:test';
import assert from 'node:assert/strict';
import {architecture} from '../../public/ar-experiments/mayhem-ar/ar-colour-vision-001/model.js';

test('default cube has exactly five square faces and a completely open vertical front',()=>{
 const mesh=architecture();assert.equal(mesh.length,5*6*8);
 const faces=[];
 for(let i=0;i<mesh.length;i+=6*8){
  const vertices=[];for(let j=0;j<6;j++)vertices.push(Array.from(mesh.slice(i+j*8,i+j*8+3)));
  const normal=Array.from(mesh.slice(i+5,i+8));faces.push(normal.join(','));
  const unique=[...new Map(vertices.map(p=>[p.join(','),p])).values()];assert.equal(unique.length,4);
  const ranges=[0,1,2].map(axis=>Math.max(...unique.map(p=>p[axis]))-Math.min(...unique.map(p=>p[axis]))).sort();
  assert.deepEqual(ranges,[0,2,2]);
 }
 assert.deepEqual(faces.sort(),['0,-1,0','0,1,0','0,0,-1','-1,0,0','1,0,0'].sort());
});

test('preserved model choices remain available alongside the cube',()=>{
 for(const kind of ['pavilion','gallery','surface'])assert.ok(architecture(kind).length>0);
 assert.notEqual(architecture('gallery').length,architecture('cube').length);
});
