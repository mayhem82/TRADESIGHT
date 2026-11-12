function primitivesIn(node) {
  const result=[];
  const visit=part=>{for(const primitive of part.renderPrimitives||[])result.push(primitive);for(const child of part.children||[])visit(child);};visit(node);return result;
}
export class ModelExposure {
  constructor(storageKey='tradesight-companion-exposure',defaultEV=0) {
    this.storageKey=storageKey;this.primitives=[];this.ev=defaultEV;
    try{const saved=localStorage.getItem(this.storageKey);if(saved!==null&&Number.isFinite(Number(saved)))this.ev=Math.max(-2,Math.min(3,Number(saved)));}catch{}
    for(const input of document.querySelectorAll('[data-model-exposure]'))input.addEventListener('input',()=>this.set(Number(input.value)));
    for(const button of document.querySelectorAll('[data-exposure-reset]'))button.addEventListener('click',()=>this.set(0));
    this.set(this.ev);
  }
  bind(model) {this.primitives=primitivesIn(model);this.set(this.ev);}
  set(ev) {
    if(!Number.isFinite(ev))return;this.ev=Math.max(-2,Math.min(3,ev));const factor=2**this.ev;
    for(const primitive of this.primitives){const uniform=primitive.uniforms.modelExposure;if(uniform)uniform.value=factor;}
    for(const input of document.querySelectorAll('[data-model-exposure]'))input.value=String(this.ev);
    for(const output of document.querySelectorAll('[data-exposure-value]'))output.textContent=`${this.ev>0?'+':''}${this.ev.toFixed(1)} EV`;
    try{localStorage.setItem(this.storageKey,String(this.ev));}catch{}
  }
}
