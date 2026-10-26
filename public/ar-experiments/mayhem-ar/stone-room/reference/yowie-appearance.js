import {CAP,RENDER_ORDER} from './js/render/core/material.js';
export class YowieAppearance {
  constructor() {
    this.size=1;this.transparency=0;this.records=[];this.template=null;this.actor=null;this.visual=null;
    try{const saved=JSON.parse(localStorage.getItem('bellbrook-yowie-appearance')||'null');if(saved){this.size=Math.max(.1,Math.min(3,Number(saved.size)||1));this.transparency=Math.max(0,Math.min(100,Number(saved.transparency)||0));}}catch{}
    for(const input of document.querySelectorAll('[data-yowie-size]'))input.addEventListener('input',()=>this.setSize(Number(input.value)/100));
    for(const input of document.querySelectorAll('[data-yowie-transparency]'))input.addEventListener('input',()=>this.setTransparency(Number(input.value)));
    for(const button of document.querySelectorAll('[data-yowie-reset]'))button.addEventListener('click',()=>{this.setSize(1);this.setTransparency(0);});
    this.sync();
  }
  bind(renderer,model) {
    this.renderer=renderer;this.template=model;model.name='yowie-visual';
    const visit=node=>{for(const primitive of node.renderPrimitives||[])this.records.push({primitive,state:primitive._material._state,order:primitive._material._renderOrder});for(const child of node.children)visit(child);};visit(model);
    this.apply();
  }
  attach(actor) {this.actor=actor;this.visual=null;this.appliedSize=null;this.update();}
  setSize(value) {if(!Number.isFinite(value))return;this.size=Math.max(.1,Math.min(3,value));this.apply();this.sync();}
  setTransparency(value) {if(!Number.isFinite(value))return;this.transparency=Math.max(0,Math.min(100,value));this.apply();this.sync();}
  sync() {
    for(const input of document.querySelectorAll('[data-yowie-size]'))input.value=String(Math.round(this.size*100));
    for(const input of document.querySelectorAll('[data-yowie-transparency]'))input.value=String(this.transparency);
    for(const output of document.querySelectorAll('[data-yowie-size-value]'))output.textContent=Math.round(this.size*100)+'%';
    for(const output of document.querySelectorAll('[data-yowie-transparency-value]'))output.textContent=Math.round(this.transparency)+'%';
    try{localStorage.setItem('bellbrook-yowie-appearance',JSON.stringify({size:this.size,transparency:this.transparency}));}catch{}
  }
  apply() {
    if(this.template)this.template.scale=new Float32Array([this.size,this.size,this.size]);
    this.update();
    const opacity=1-this.transparency/100;
    for(const record of this.records){
      const {primitive,state,order}=record,material=primitive._material;
      if(primitive.uniforms.modelOpacity)primitive.uniforms.modelOpacity.value=opacity;
      const nextOrder=opacity<1?RENDER_ORDER.TRANSPARENT:order;
      material._state=opacity<1?((state|CAP.BLEND)&~CAP.DEPTH_MASK):state;
      if(nextOrder!==material._renderOrder){
        const old=this.renderer._renderPrimitives[material._renderOrder],index=old.indexOf(primitive);if(index>=0)old.splice(index,1);
        (this.renderer._renderPrimitives[nextOrder]??=[]).push(primitive);material._renderOrder=nextOrder;
      }
    }
  }
  update() {
    if(this.actor&&!this.visual)this.visual=this.actor.children.find(child=>child.name==='yowie-visual')||null;
    if(this.visual&&this.appliedSize!==this.size){this.visual.scale=new Float32Array([this.size,this.size,this.size]);this.appliedSize=this.size;}
  }
  clear() {this.actor=null;this.visual=null;this.appliedSize=null;}
}
