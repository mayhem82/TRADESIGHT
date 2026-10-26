(function(){var e=class{constructor(){this.panel=document.querySelector(`#panel`),this.toggle=document.querySelector(`#menu-toggle`);let e=-1/0,t=e=>{e.preventDefault(),e.stopPropagation(),this.show(this.panel.hidden)};this.toggle.onclick=n=>{performance.now()-e<650?n.preventDefault():t(n)},this.toggle.onpointerup=n=>{n.isPrimary&&n.button===0&&(e=performance.now(),t(n))};for(let e of document.querySelectorAll(`#overlay button,#overlay a,#overlay input,#overlay summary`))e.dataset.xrControl=``,e.addEventListener(`beforexrselect`,e=>e.preventDefault());document.querySelector(`#panel`).addEventListener(`beforexrselect`,e=>e.preventDefault()),this.toggle.setAttribute(`aria-controls`,`panel`),this.show(!0)}show(e){this.panel.hidden=!e,this.panel.setAttribute(`aria-hidden`,String(!e)),this.toggle.textContent=e?`Hide menu`:`Show menu`,this.toggle.setAttribute(`aria-expanded`,String(e))}};function t(e){let t=Math.max(0,Math.min(3,(e+Math.PI/2)*3/Math.PI));return t<1?{p:[-.5,0,-t],n:[-1,0,0],wall:0}:t<2?{p:[t-1.5,0,-1],n:[0,0,-1],wall:1}:{p:[.5,0,t-3],n:[1,0,0],wall:2}}function n(){let e=[];for(let[t,n,r]of[[[-.5,0],[-.5,-1],[-1,0,0]],[[-.5,-1],[.5,-1],[0,0,-1]],[[.5,-1],[.5,0],[1,0,0]]]){let i=[[t[0],-.5,t[1]],[n[0],-.5,n[1]],[n[0],.5,n[1]],[t[0],.5,t[1]]];for(let t of[0,2,1,0,3,2])e.push(...i[t],...r)}return{data:new Float32Array(e),stripCount:18}}function r(e=9){let n=[],r=[];for(let i=0;i<e;i++){let a=t(-Math.PI/2+i*Math.PI/e).p,o=t(-Math.PI/2+(i+1)*Math.PI/e).p,s=n.length/3;for(let e of[[a[0],-.5,a[2]],[o[0],-.5,o[2]],[o[0],.5,o[2]],[a[0],.5,a[2]]])n.push(...e);r.push({first:s,count:4})}return{data:new Float32Array(n),ranges:r}}function i(e,n,r,i,a){let o=t(i).p,s=n*o[0],c=(a-.5)*r,l=n*o[2];return[e[0]*s+e[4]*c+e[8]*l+e[12],e[1]*s+e[5]*c+e[9]*l+e[13],e[2]*s+e[6]*c+e[10]*l+e[14]]}function a(e,t){let n=[0,0,0,0];for(let r=0;r<4;r++)n[r]=e[r]*t[0]+e[4+r]*t[1]+e[8+r]*t[2]+e[12+r];return n[3]>1e-6&&n.slice(0,3).every(e=>Number.isFinite(e)&&e>=-n[3]&&e<=n[3])}function o(e,n,r,i,a){let o=t(i).n,s=r[0]*o[0]+r[8]*o[2],c=r[1]*o[0]+r[9]*o[2],l=r[2]*o[0]+r[10]*o[2],u=e=>(e[12]-a[0])*s+(e[13]-a[1])*c+(e[14]-a[2])*l;return u(e)>.001&&u(n)>.001}function s(e,t){let n=Math.hypot(e.world[12]-t[12],e.world[13]-t[13],e.world[14]-t[14]),r=e.world[8]*t[8]+e.world[9]*t[9]+e.world[10]*t[10];return n+.2*Math.acos(Math.max(-1,Math.min(1,r)))}function c(e,t,n,r,s=null){return Array.from({length:9},(c,l)=>{let u=0,d=0,f=0;for(let c of[.15,.5,.85])for(let p of[.15,.5,.85]){let m=-Math.PI/2+(l+p)*Math.PI/9,h=i(t,n,r,m,c);f++;let g=e.filter(e=>a(e.capturePV,h)&&o(e.world,e.world,t,m,h));g.length&&u++,g.some(e=>!s||o(e.world,s,t,m,h))&&d++}return{sector:l,recorded:u,usable:d,total:f,covered:u===f,currentUsable:d===f}})}function l(e,t,n,r,i,a=null,o=null){let l=e.filter(e=>(o===null||e.wallVersion===o)&&e.world&&e.capturePV),u=c(l,n,r,i,t),d=l.map(e=>{let a=c([e],n,r,i,t).reduce((e,t)=>e+t.usable,0)/81;return{shot:e,fraction:a,score:s(e,t)+.25*(1-a)}}).filter(e=>e.fraction>0).sort((e,t)=>e.score-t.score||e.shot.id-t.shot.id),f=d.find(e=>e.shot.id===a);return f&&d[0]&&f.score-d[0].score<.1&&(d.splice(d.indexOf(f),1),d.unshift(f)),{primary:d[0]?.shot||null,order:d.slice().reverse().map(e=>e.shot),coverage:u,recordedSectors:u.filter(e=>e.covered).length,usableSectors:u.filter(e=>e.currentUsable).length,scores:d.map(e=>({id:e.shot.id,score:e.score,coverage:e.fraction}))}}let u=r;function d({active:e,tracking:t,placed:n,captured:r,effect:i,camera:a,aligned:o,submitted:s,error:c,reason:l=``,moduleReady:u=!0,moduleError:d=``,warning:f=``}){return e?u?t?n?!r&&!a?{kind:`unavailable`,text:`NO CAMERA CAPTURE — `+l}:r?i?o?c?{kind:`error`,text:`MASK DRAW ERROR — WebGL `+c}:s?f?{kind:`warning`,text:`IMAGE DRAW SUBMITTED — `+f+`; rotation allowed`}:{kind:`submitted`,text:`MASK DRAW SUBMITTED — stored image, rotation allowed; phone output not yet verified`}:{kind:`inactive`,text:`MASK NOT DRAWN — `+l}:{kind:`suspended`,text:`MASK SUSPENDED — `+l}:{kind:`off`,text:`MASK OFF — live camera is unobstructed`}:{kind:`empty`,text:`NO PHOTOS STORED — press Add view`}:{kind:`place`,text:`MASK NOT ACTIVE — tap the surface circle to place`}:{kind:`paused`,text:`MASK PAUSED — tracking/visibility unavailable`}:{kind:`error`,text:`CAPTURE RENDERER UNAVAILABLE — `+d}:{kind:`idle`,text:`MASK NOT ACTIVE — enter AR`}}let f=WebGLRenderingContext,p={CULL_FACE:1,BLEND:2,DEPTH_TEST:4,STENCIL_TEST:8,COLOR_MASK:16,DEPTH_MASK:32,STENCIL_MASK:64},m={CAPS_RANGE:255,BLEND_SRC_SHIFT:8,BLEND_SRC_RANGE:3840,BLEND_DST_SHIFT:12,BLEND_DST_RANGE:61440,BLEND_FUNC_RANGE:65280,DEPTH_FUNC_SHIFT:16,DEPTH_FUNC_RANGE:983040},h={OPAQUE:0,SKY:1,TRANSPARENT:2,ADDITIVE:3,DEFAULT:4};function g(e,t,n){let r=(e&t)>>n;switch(r){case 0:case 1:return r;default:return r-2+f.SRC_COLOR}}var _=class{constructor(){this._state=p.CULL_FACE|p.DEPTH_TEST|p.COLOR_MASK|p.DEPTH_MASK,this.blendFuncSrc=f.SRC_ALPHA,this.blendFuncDst=f.ONE_MINUS_SRC_ALPHA,this.depthFunc=f.LESS}get cullFace(){return!!(this._state&p.CULL_FACE)}set cullFace(e){e?this._state|=p.CULL_FACE:this._state&=~p.CULL_FACE}get blend(){return!!(this._state&p.BLEND)}set blend(e){e?this._state|=p.BLEND:this._state&=~p.BLEND}get depthTest(){return!!(this._state&p.DEPTH_TEST)}set depthTest(e){e?this._state|=p.DEPTH_TEST:this._state&=~p.DEPTH_TEST}get stencilTest(){return!!(this._state&p.STENCIL_TEST)}set stencilTest(e){e?this._state|=p.STENCIL_TEST:this._state&=~p.STENCIL_TEST}get colorMask(){return!!(this._state&p.COLOR_MASK)}set colorMask(e){e?this._state|=p.COLOR_MASK:this._state&=~p.COLOR_MASK}get depthMask(){return!!(this._state&p.DEPTH_MASK)}set depthMask(e){e?this._state|=p.DEPTH_MASK:this._state&=~p.DEPTH_MASK}get depthFunc(){return((this._state&m.DEPTH_FUNC_RANGE)>>m.DEPTH_FUNC_SHIFT)+f.NEVER}set depthFunc(e){e-=f.NEVER,this._state&=~m.DEPTH_FUNC_RANGE,this._state|=e<<m.DEPTH_FUNC_SHIFT}get stencilMask(){return!!(this._state&p.STENCIL_MASK)}set stencilMask(e){e?this._state|=p.STENCIL_MASK:this._state&=~p.STENCIL_MASK}get blendFuncSrc(){return g(this._state,m.BLEND_SRC_RANGE,m.BLEND_SRC_SHIFT)}set blendFuncSrc(e){switch(e){case 0:case 1:break;default:e=e-f.SRC_COLOR+2}this._state&=~m.BLEND_SRC_RANGE,this._state|=e<<m.BLEND_SRC_SHIFT}get blendFuncDst(){return g(this._state,m.BLEND_DST_RANGE,m.BLEND_DST_SHIFT)}set blendFuncDst(e){switch(e){case 0:case 1:break;default:e=e-f.SRC_COLOR+2}this._state&=~m.BLEND_DST_RANGE,this._state|=e<<m.BLEND_DST_SHIFT}},v=class{constructor(e){this._uniformName=e,this._texture=null}get texture(){return this._texture}set texture(e){this._texture=e}},y=class{constructor(e,t,n){this._uniformName=e,this._value=t,this._length=n,this._length||=t instanceof Array?t.length:1}get value(){return this._value}set value(e){this._value=e}},b=class{constructor(){this.state=new _,this.renderOrder=h.DEFAULT,this._samplers=[],this._uniforms=[]}defineSampler(e){let t=new v(e);return this._samplers.push(t),t}defineUniform(e,t=null,n=0){let r=new y(e,t,n);return this._uniforms.push(r),r}get materialName(){return null}get vertexSource(){return null}get fragmentSource(){return null}getProgramDefines(e){return{}}};let x=typeof Float32Array<`u`?Float32Array:Array;function S(){let e=new x(9);return x!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[5]=0,e[6]=0,e[7]=0),e[0]=1,e[4]=1,e[8]=1,e}function C(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[4],e[4]=t[5],e[5]=t[6],e[6]=t[8],e[7]=t[9],e[8]=t[10],e}function w(){let e=new x(16);return x!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function T(e){let t=new x(16);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t}function E(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e}function D(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function O(e,t){let n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,k=f*_-p*g,A=v*k-y*O+b*D+x*E-S*T+C*w;return A?(A=1/A,e[0]=(s*k-c*O+l*D)*A,e[1]=(i*O-r*k-a*D)*A,e[2]=(h*C-g*S+_*x)*A,e[3]=(f*S-d*C-p*x)*A,e[4]=(c*E-o*k-l*T)*A,e[5]=(n*k-i*E+a*T)*A,e[6]=(g*b-m*C-_*y)*A,e[7]=(u*C-f*b+p*y)*A,e[8]=(o*O-s*E+l*w)*A,e[9]=(r*E-n*O-a*w)*A,e[10]=(m*S-h*b+_*v)*A,e[11]=(d*b-u*S-p*v)*A,e[12]=(s*T-o*D-c*w)*A,e[13]=(n*D-r*T+i*w)*A,e[14]=(h*y-m*x-g*v)*A,e[15]=(u*x-d*y+f*v)*A,e):null}function k(e,t,n){let r=t[0],i=t[1],a=t[2],o=t[3],s=t[4],c=t[5],l=t[6],u=t[7],d=t[8],f=t[9],p=t[10],m=t[11],h=t[12],g=t[13],_=t[14],v=t[15],y=n[0],b=n[1],x=n[2],S=n[3];return e[0]=y*r+b*s+x*d+S*h,e[1]=y*i+b*c+x*f+S*g,e[2]=y*a+b*l+x*p+S*_,e[3]=y*o+b*u+x*m+S*v,y=n[4],b=n[5],x=n[6],S=n[7],e[4]=y*r+b*s+x*d+S*h,e[5]=y*i+b*c+x*f+S*g,e[6]=y*a+b*l+x*p+S*_,e[7]=y*o+b*u+x*m+S*v,y=n[8],b=n[9],x=n[10],S=n[11],e[8]=y*r+b*s+x*d+S*h,e[9]=y*i+b*c+x*f+S*g,e[10]=y*a+b*l+x*p+S*_,e[11]=y*o+b*u+x*m+S*v,y=n[12],b=n[13],x=n[14],S=n[15],e[12]=y*r+b*s+x*d+S*h,e[13]=y*i+b*c+x*f+S*g,e[14]=y*a+b*l+x*p+S*_,e[15]=y*o+b*u+x*m+S*v,e}function A(e,t){let n=Math.sin(t),r=Math.cos(t);return e[0]=r,e[1]=0,e[2]=-n,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=n,e[9]=0,e[10]=r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function ee(e,t,n,r){let i=t[0],a=t[1],o=t[2],s=t[3],c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=r[0],x=r[1],S=r[2];return e[0]=(1-(m+g))*b,e[1]=(f+y)*b,e[2]=(p-v)*b,e[3]=0,e[4]=(f-y)*x,e[5]=(1-(d+g))*x,e[6]=(h+_)*x,e[7]=0,e[8]=(p+v)*S,e[9]=(h-_)*S,e[10]=(1-(d+m))*S,e[11]=0,e[12]=n[0],e[13]=n[1],e[14]=n[2],e[15]=1,e}function te(e,t,n,r,i){let a=1/Math.tan(t/2),o;return e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0?(o=1/(r-i),e[10]=(i+r)*o,e[14]=2*i*r*o):(e[10]=-1,e[14]=-2*r),e}function ne(e,t,n,r){let i,a,o,s,c,l,u,d,f,p,m=t[0],h=t[1],g=t[2],_=r[0],v=r[1],y=r[2],b=n[0],x=n[1],S=n[2];return Math.abs(m-b)<1e-6&&Math.abs(h-x)<1e-6&&Math.abs(g-S)<1e-6?D(e):(u=m-b,d=h-x,f=g-S,p=1/Math.sqrt(u*u+d*d+f*f),u*=p,d*=p,f*=p,i=v*f-y*d,a=y*u-_*f,o=_*d-v*u,p=Math.sqrt(i*i+a*a+o*o),p?(p=1/p,i*=p,a*=p,o*=p):(i=0,a=0,o=0),s=d*o-f*a,c=f*i-u*o,l=u*a-d*i,p=Math.sqrt(s*s+c*c+l*l),p?(p=1/p,s*=p,c*=p,l*=p):(s=0,c=0,l=0),e[0]=i,e[1]=s,e[2]=u,e[3]=0,e[4]=a,e[5]=c,e[6]=d,e[7]=0,e[8]=o,e[9]=l,e[10]=f,e[11]=0,e[12]=-(i*m+a*h+o*g),e[13]=-(s*m+c*h+l*g),e[14]=-(u*m+d*h+f*g),e[15]=1,e)}let re=k;function j(){let e=new x(3);return x!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function M(e){var t=new x(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function ie(e){let t=e[0],n=e[1],r=e[2];return Math.sqrt(t*t+n*n+r*r)}function ae(e,t,n){let r=new x(3);return r[0]=e,r[1]=t,r[2]=n,r}function oe(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function se(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e}function ce(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e}function le(e,t){let n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)}function ue(e,t){let n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a),e}function de(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function fe(e,t,n){let r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}function pe(e,t,n){let r=t[0],i=t[1],a=t[2],o=n[3]*r+n[7]*i+n[11]*a+n[15];return o||=1,e[0]=(n[0]*r+n[4]*i+n[8]*a+n[12])/o,e[1]=(n[1]*r+n[5]*i+n[9]*a+n[13])/o,e[2]=(n[2]*r+n[6]*i+n[10]*a+n[14])/o,e}function me(e,t,n){let r=t[0],i=t[1],a=t[2];return e[0]=r*n[0]+i*n[3]+a*n[6],e[1]=r*n[1]+i*n[4]+a*n[7],e[2]=r*n[2]+i*n[5]+a*n[8],e}let he=ie;(function(){let e=j();return function(t,n,r,i,a,o){let s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();function ge(){let e=new x(4);return x!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0,e[3]=0),e}function _e(e){let t=new x(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t}function ve(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e}function ye(e,t){let n=t[0],r=t[1],i=t[2],a=t[3],o=n*n+r*r+i*i+a*a;return o>0&&(o=1/Math.sqrt(o),e[0]=n*o,e[1]=r*o,e[2]=i*o,e[3]=a*o),e}(function(){let e=ge();return function(t,n,r,i,a,o){let s,c;for(n||=4,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],e[3]=t[s+3],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2],t[s+3]=e[3];return t}})();function be(){let e=new x(4);return x!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e[3]=1,e}function xe(e,t,n){n*=.5;let r=Math.sin(n);return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=Math.cos(n),e}function Se(e,t,n,r){let i=t[0],a=t[1],o=t[2],s=t[3],c=n[0],l=n[1],u=n[2],d=n[3],f,p,m,h,g;return p=i*c+a*l+o*u+s*d,p<0&&(p=-p,c=-c,l=-l,u=-u,d=-d),1-p>1e-6?(f=Math.acos(p),m=Math.sin(f),h=Math.sin((1-r)*f)/m,g=Math.sin(r*f)/m):(h=1-r,g=r),e[0]=h*i+g*c,e[1]=h*a+g*l,e[2]=h*o+g*u,e[3]=h*s+g*d,e}function Ce(e,t){let n=t[0]+t[4]+t[8],r;if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[5]-t[7])*r,e[1]=(t[6]-t[2])*r,e[2]=(t[1]-t[3])*r;else{let n=0;t[4]>t[0]&&(n=1),t[8]>t[n*3+n]&&(n=2);let i=(n+1)%3,a=(n+2)%3;r=Math.sqrt(t[n*3+n]-t[i*3+i]-t[a*3+a]+1),e[n]=.5*r,r=.5/r,e[3]=(t[i*3+a]-t[a*3+i])*r,e[i]=(t[i*3+n]+t[n*3+i])*r,e[a]=(t[a*3+n]+t[n*3+a])*r}return e}function we(e,t,n,r){let i=.5*Math.PI/180;t*=i,n*=i,r*=i;let a=Math.sin(t),o=Math.cos(t),s=Math.sin(n),c=Math.cos(n),l=Math.sin(r),u=Math.cos(r);return e[0]=a*c*u-o*s*l,e[1]=o*s*u+a*c*l,e[2]=o*c*l-a*s*u,e[3]=o*c*u+a*s*l,e}let Te=_e,Ee=ve,De=ye;(function(){let e=j(),t=ae(1,0,0),n=ae(0,1,0);return function(r,i,a){let o=de(i,a);return o<-.999999?(fe(e,t,i),he(e)<1e-6&&fe(e,n,i),ue(e,e),xe(r,e,Math.PI),r):o>.999999?(r[0]=0,r[1]=0,r[2]=0,r[3]=1,r):(fe(e,i,a),r[0]=e[0],r[1]=e[1],r[2]=e[2],r[3]=1+o,De(r,r))}})(),function(){let e=be(),t=be();return function(n,r,i,a,o,s){return Se(e,r,o,s),Se(t,i,a,s),Se(n,e,t,2*s*(1-s)),n}}(),(function(){let e=S();return function(t,n,r,i){return e[0]=r[0],e[3]=r[1],e[6]=r[2],e[1]=i[0],e[4]=i[1],e[7]=i[2],e[2]=-n[0],e[5]=-n[1],e[8]=-n[2],De(t,Ce(t,e))}})();function Oe(){let e=new x(2);return x!=Float32Array&&(e[0]=0,e[1]=0),e}(function(){let e=Oe();return function(t,n,r,i,a,o){let s,c;for(n||=2,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],a(e,e,o),t[s]=e[0],t[s+1]=e[1];return t}})();let ke=S();var Ae=class{constructor(e=null){this.origin=j(),this._dir=j(),this._dir[2]=-1,e&&(pe(this.origin,this.origin,e),C(ke,e),me(this._dir,this._dir,ke)),this.direction=this._dir}get direction(){return this._dir}set direction(e){this._dir=oe(this._dir,e),ue(this._dir,this._dir),this.inv_dir=ae(1/this._dir[0],1/this._dir[1],1/this._dir[2]),this.sign=[+(this.inv_dir[0]<0),+(this.inv_dir[1]<0),+(this.inv_dir[2]<0)]}intersectsAABB(e,t){let n=this,r=[e,t],i=(r[n.sign[0]][0]-n.origin[0])*n.inv_dir[0],a=(r[1-n.sign[0]][0]-n.origin[0])*n.inv_dir[0],o=(r[n.sign[1]][1]-n.origin[1])*n.inv_dir[1],s=(r[1-n.sign[1]][1]-n.origin[1])*n.inv_dir[1];if(i>s||o>a)return null;o>i&&(i=o),s<a&&(a=s);let c=(r[n.sign[2]][2]-n.origin[2])*n.inv_dir[2],l=(r[1-n.sign[2]][2]-n.origin[2])*n.inv_dir[2];if(i>l||c>a)return null;c>i&&(i=c),l<a&&(a=l);let u=-1;if(i>0&&a>0)u=Math.min(i,a);else if(i>0)u=i;else if(a>0)u=a;else return null;u-=.02;let d=M(this._dir);return ce(d,d,u),se(d,d,this.origin),d}};let je=new Float32Array([0,0,0]),Me=new Float32Array([0,0,0,1]),Ne=new Float32Array([1,1,1]),Pe=w();var N=class e{constructor(){this.name=null,this.children=[],this.parent=null,this.visible=!0,this.selectable=!1,this._matrix=null,this._dirtyTRS=!1,this._translation=null,this._rotation=null,this._scale=null,this._dirtyWorldMatrix=!1,this._worldMatrix=null,this._activeFrameId=-1,this._hoverFrameId=-1,this._renderPrimitives=null,this._renderer=null,this._selectHandler=null}_setRenderer(e){if(this._renderer!=e&&(this._renderer&&this.clearRenderPrimitives(),this._renderer=e,e)){this.onRendererChanged(e);for(let t of this.children)t._setRenderer(e)}}onRendererChanged(e){}clone(){let t=new e;return t.name=this.name,t.visible=this.visible,t._renderer=this._renderer,t._dirtyTRS=this._dirtyTRS,this._translation&&(t._translation=j(),oe(t._translation,this._translation)),this._rotation&&(t._rotation=be(),Ee(t._rotation,this._rotation)),this._scale&&(t._scale=j(),oe(t._scale,this._scale)),!t._dirtyTRS&&this._matrix&&(t._matrix=w(),E(t._matrix,this._matrix)),t._dirtyWorldMatrix=this._dirtyWorldMatrix,!t._dirtyWorldMatrix&&this._worldMatrix&&(t._worldMatrix=w(),E(t._worldMatrix,this._worldMatrix)),this.waitForComplete().then(()=>{if(this._renderPrimitives)for(let e of this._renderPrimitives)t.addRenderPrimitive(e);for(let e of this.children)t.addNode(e.clone())}),t}markActive(e){if(this.visible){if(this._renderPrimitives){this._activeFrameId=e;for(let t of this._renderPrimitives)t.markActive(e)}for(let t of this.children)t.visible&&t.markActive(e)}}addNode(e){e&&e.parent!=this&&(e.parent&&e.parent.removeNode(e),e.parent=this,this.children.push(e),e.setMatrixDirty(),this._renderer&&e._setRenderer(this._renderer))}removeNode(e){let t=this.children.indexOf(e);t>-1&&(this.children.splice(t,1),e.parent=null)}clearNodes(){for(let e of this.children)e.parent=null;this.children=[]}setMatrixDirty(){this._dirtyWorldMatrix=!0;for(let e of this.children)e.setMatrixDirty()}_updateLocalMatrix(){return this._matrix||=w(),this._dirtyTRS&&(this._dirtyTRS=!1,ee(this._matrix,this._rotation||Me,this._translation||je,this._scale||Ne)),this._matrix}set matrix(e){e?(this._matrix||=w(),E(this._matrix,e)):this._matrix=null,this.setMatrixDirty(),this._dirtyTRS=!1,this._translation=null,this._rotation=null,this._scale=null}get matrix(){return this.setMatrixDirty(),this._updateLocalMatrix()}get worldMatrix(){return this._worldMatrix||=(this._dirtyWorldMatrix=!0,w()),(this._dirtyWorldMatrix||this._dirtyTRS)&&(this.parent?re(this._worldMatrix,this.parent.worldMatrix,this._updateLocalMatrix()):E(this._worldMatrix,this._updateLocalMatrix()),this._dirtyWorldMatrix=!1),this._worldMatrix}set translation(e){e!=null&&(this._dirtyTRS=!0,this.setMatrixDirty()),this._translation=e}get translation(){return this._dirtyTRS=!0,this.setMatrixDirty(),this._translation||=M(je),this._translation}set rotation(e){e!=null&&(this._dirtyTRS=!0,this.setMatrixDirty()),this._rotation=e}get rotation(){return this._dirtyTRS=!0,this.setMatrixDirty(),this._rotation||=Te(Me),this._rotation}set scale(e){e!=null&&(this._dirtyTRS=!0,this.setMatrixDirty()),this._scale=e}get scale(){return this._dirtyTRS=!0,this.setMatrixDirty(),this._scale||=M(Ne),this._scale}waitForComplete(){let e=[];for(let t of this.children)e.push(t.waitForComplete());if(this._renderPrimitives)for(let t of this._renderPrimitives)e.push(t.waitForComplete());return Promise.all(e).then(()=>this)}get renderPrimitives(){return this._renderPrimitives}addRenderPrimitive(e){this._renderPrimitives?this._renderPrimitives.push(e):this._renderPrimitives=[e],e._instances.push(this)}removeRenderPrimitive(e){if(!this._renderPrimitives)return;let t=this._renderPrimitives._instances.indexOf(e);t>-1&&(this._renderPrimitives._instances.splice(t,1),t=e._instances.indexOf(this),t>-1&&e._instances.splice(t,1),this._renderPrimitives.length||(this._renderPrimitives=null))}clearRenderPrimitives(){if(this._renderPrimitives){for(let e of this._renderPrimitives){let t=e._instances.indexOf(this);t>-1&&e._instances.splice(t,1)}this._renderPrimitives=null}}_hitTestSelectableNode(e){if(this._renderPrimitives){let t=null;for(let n of this._renderPrimitives)if(n._min){t||=(O(Pe,this.worldMatrix),k(Pe,Pe,e.matrix),new Ae(Pe));let r=t.intersectsAABB(n._min,n._max);if(r)return pe(r,r,this.worldMatrix),r}}for(let t of this.children){let n=t._hitTestSelectableNode(e);if(n)return n}return null}hitTest(e){if(this.selectable&&this.visible){let t=this._hitTestSelectableNode(e);if(t){let n=new Ae(e.matrix),r=ae(n.origin.x,n.origin.y,n.origin.z);return{node:this,intersection:t,distance:le(r,t)}}return null}let t=null;for(let n of this.children){let r=n.hitTest(e);r&&(!t||t.distance>r.distance)&&(t=r)}return t}onSelect(e){this._selectHandler=e}get selectHandler(){return this._selectHandler}handleSelect(){this._selectHandler&&this._selectHandler()}onHoverStart(){}onHoverEnd(){}_update(e,t){this.onUpdate(e,t);for(let n of this.children)n._update(e,t)}onUpdate(e,t){}},Fe=class{constructor(e,t,n,r,i,a,o){this._gl=e,this.program=e.createProgram(),this.attrib=null,this.uniform=null,this.defines={},this.extensions=[],this.layouts=[],this._firstUse=!0,this._nextUseCallbacks=[];let s=``;if(a)for(let e of a)this.extensions.push(e),s+=`#extension ${e} : require\n`;let c=``;if(o)for(let e of o)this.layouts.push(e),c+=`layout(${e}) in;\n`;let l=``;if(i)for(let e in i)this.defines[e]=i[e],l+=`#define ${e} ${i[e]}\n`;if(this._vertShader=e.createShader(e.VERTEX_SHADER),e.attachShader(this.program,this._vertShader),e.shaderSource(this._vertShader,`#version 300 es
`+s+c+l+t),e.compileShader(this._vertShader),this._fragShader=e.createShader(e.FRAGMENT_SHADER),e.attachShader(this.program,this._fragShader),e.shaderSource(this._fragShader,`#version 300 es
`+s+l+n),e.compileShader(this._fragShader),r){this.attrib={};for(let t in r)e.bindAttribLocation(this.program,r[t],t),this.attrib[t]=r[t]}e.linkProgram(this.program)}onNextUse(e){this._nextUseCallbacks.push(e)}use(){let e=this._gl;if(this._firstUse){if(this._firstUse=!1,!e.getProgramParameter(this.program,e.LINK_STATUS))e.getShaderParameter(this._vertShader,e.COMPILE_STATUS)?e.getShaderParameter(this._fragShader,e.COMPILE_STATUS)?console.error(`Program link error: `+e.getProgramInfoLog(this.program)):console.error(`Fragment shader compile error: `+e.getShaderInfoLog(this._fragShader)):console.error(`Vertex shader compile error: `+e.getShaderInfoLog(this._vertShader)),e.deleteProgram(this.program),this.program=null;else{if(!this.attrib){this.attrib={};let t=e.getProgramParameter(this.program,e.ACTIVE_ATTRIBUTES);for(let n=0;n<t;n++){let t=e.getActiveAttrib(this.program,n);this.attrib[t.name]=e.getAttribLocation(this.program,t.name)}}this.uniform={};let t=e.getProgramParameter(this.program,e.ACTIVE_UNIFORMS),n=``;for(let r=0;r<t;r++)n=e.getActiveUniform(this.program,r).name.replace(`[0]`,``),this.uniform[n]=e.getUniformLocation(this.program,n)}e.deleteShader(this._vertShader),e.deleteShader(this._fragShader)}if(e.useProgram(this.program),this._nextUseCallbacks.length){for(let e of this._nextUseCallbacks)e(this);this._nextUseCallbacks=[]}}};let Ie=WebGLRenderingContext,Le=0;var Re=class{constructor(){this.minFilter=null,this.magFilter=null,this.wrapS=null,this.wrapT=null}},ze=class{constructor(){this.sampler=new Re,this.mipmap=!0}get format(){return Ie.RGBA}get width(){return 0}get height(){return 0}get textureKey(){return null}get isExternal(){return!1}},Be=class extends ze{constructor(e){super(),this._img=e,this._imgBitmap=null,this._manualKey=null,this._promise=e.src&&e.complete?e.naturalWidth?this._finishImage():Promise.reject(`Image provided had failed to load.`):new Promise((t,n)=>{e.addEventListener(`load`,()=>t(this._finishImage())),e.addEventListener(`error`,n)})}_finishImage(){return window.createImageBitmap?window.createImageBitmap(this._img).then(e=>(this._imgBitmap=e,Promise.resolve(this))):Promise.resolve(this)}get format(){return Ie.RGBA}get width(){return this._img.width}get height(){return this._img.height}waitForComplete(){return this._promise}get textureKey(){return this._manualKey||this._img.src}get source(){return this._imgBitmap||this._img}genDataKey(){this._manualKey=`DATA_${Le}`,Le++}},Ve=class extends ze{constructor(e){super(),this._video=e,this._promise=e.readyState>=2?Promise.resolve(this):e.error?Promise.reject(e.error):new Promise((t,n)=>{e.addEventListener(`loadeddata`,()=>t(this)),e.addEventListener(`error`,n)})}get format(){return Ie.RGBA}get width(){return this._video.videoWidth}get height(){return this._video.videoHeight}waitForComplete(){return this._promise}get textureKey(){return this._video.src}get source(){return this._video}},He=class extends ze{constructor(e,t,n,r=Ie.RGBA,i=Ie.UNSIGNED_BYTE){super(),this._data=e,this._width=t,this._height=n,this._format=r,this._type=i,this._key=`DATA_${Le}`,Le++}get format(){return this._format}get width(){return this._width}get height(){return this._height}get textureKey(){return this._key}},Ue=class extends ze{constructor(e){super(),this._key=e}get textureKey(){return this._key}get isExternal(){return!0}},We=class extends He{constructor(e,t,n,r){let i=new Uint8Array([e*255,t*255,n*255,r*255]);super(i,1,1),this.mipmap=!1,this._key=`COLOR_${i[0]}_${i[1]}_${i[2]}_${i[3]}`}};let Ge={POSITION:1,NORMAL:2,TANGENT:3,TEXCOORD_0:4,TEXCOORD_1:5,COLOR_0:6},P={POSITION:1,NORMAL:2,TANGENT:4,TEXCOORD_0:8,TEXCOORD_1:16,COLOR_0:32},Ke=WebGLRenderingContext,qe=new Float32Array([-.1,-1,-.2]),Je=new Float32Array([3,3,3]),Ye=/* @__PURE__ */ RegExp(`precision (lowp|mediump|highp) float;`);function Xe(e){return!(e&e-1)}function Ze(e){e||={alpha:!1};let t=document.createElement(`canvas`),n=[`webgl2`],r=null;for(let i of n)if(r=t.getContext(i,e),r)break;if(!r){let t=e.webgl2?`WebGL 2`:`WebGL`;return console.error(`This browser does not support `+t+`.`),null}return r}var Qe=class{constructor(e,t,n=null,r=`left`,i=null){this.projectionMatrix=e,this.viewport=n,this._eye=r,this._eyeIndex=r==`left`?0:1,this.depthdata=i,t instanceof Float32Array?(this._viewMatrix=T(t),this.viewTransform=new XRRigidTransform):(this.viewTransform=t,this._viewMatrix=t.inverse.matrix)}get viewMatrix(){return this._viewMatrix}get eye(){return this._eye}set eye(e){this._eye=e,this._eyeIndex=e==`left`?0:1}get eyeIndex(){return this._eyeIndex}set depthTexture(e){this._depthTexture=e}},$e=class{constructor(e,t,n,r=0){this._target=e,this._usage=t,this._length=r,n instanceof Promise?(this._buffer=null,this._promise=n.then(e=>(this._buffer=e,this))):(this._buffer=n,this._promise=Promise.resolve(this))}waitForComplete(){return this._promise}},et=class{constructor(e){this._attrib_index=Ge[e.name],this._componentCount=e.componentCount,this._componentType=e.componentType,this._stride=e.stride,this._byteOffset=e.byteOffset,this._normalized=e.normalized}},tt=class{constructor(e){this._buffer=e,this._attributes=[]}},nt=class{constructor(e){this._activeFrameId=0,this._instances=[],this._material=null,this.setPrimitive(e)}setPrimitive(e){this._mode=e.mode,this._elementCount=e.elementCount,this._promise=null,this._vao=null,this._complete=!1,this._attributeBuffers=[],this._attributeMask=0;for(let t of e.attributes){this._attributeMask|=P[t.name];let e=new et(t),n=!1;for(let r of this._attributeBuffers)if(r._buffer==t.buffer){r._attributes.push(e),n=!0;break}if(!n){let n=new tt(t.buffer);n._attributes.push(e),this._attributeBuffers.push(n)}}this._indexBuffer=null,this._indexByteOffset=0,this._indexType=0,e.indexBuffer&&(this._indexByteOffset=e.indexByteOffset,this._indexType=e.indexType,this._indexBuffer=e.indexBuffer),e._min?(this._min=M(e._min),this._max=M(e._max)):(this._min=null,this._max=null),this._material!=null&&this.waitForComplete()}setRenderMaterial(e){this._material=e,this._promise=null,this._complete=!1,this._material!=null&&this.waitForComplete()}markActive(e){if(this._complete&&this._activeFrameId!=e){if(this._material&&!this._material.markActive(e))return;this._activeFrameId=e}}get samplers(){return this._material._samplerDictionary}get uniforms(){return this._material._uniform_dictionary}waitForComplete(){if(!this._promise){if(!this._material)return Promise.reject(`RenderPrimitive does not have a material`);let e=[];for(let t of this._attributeBuffers)t._buffer._buffer||e.push(t._buffer._promise);this._indexBuffer&&!this._indexBuffer._buffer&&e.push(this._indexBuffer._promise),this._promise=Promise.all(e).then(()=>(this._complete=!0,this))}return this._promise}},rt=class{constructor(e){this._texture=e,this._complete=!1,this._activeFrameId=0,this._activeCallback=null,this._isExternalTexture=!1,this._isArray=!1}markActive(e){this._activeCallback&&this._activeFrameId!=e&&(this._activeFrameId=e,this._activeCallback(this))}};w();function it(e,t,n,r,i){let a=(i&n)-(r&n);a&&(a>0?e.enable(t):e.disable(t))}var at=class{constructor(e,t,n){this._renderer=e,this._uniformName=t._uniformName,this._renderTexture=e._getRenderTexture(t._texture),this._index=n}set texture(e){this._renderTexture=this._renderer._getRenderTexture(e)}},ot=class{constructor(e){this._uniformName=e._uniformName,this._uniform=null,this._length=e._length,this._value=e._value instanceof Array?new Float32Array(e._value):new Float32Array([e._value])}set value(e){if(this._value.length==1)this._value[0]=e;else for(let t=0;t<this._value.length;++t)this._value[t]=e[t]}},st=class{constructor(e,t,n){this._program=n,this._state=t.state._state,this._activeFrameId=0,this._completeForActiveFrame=!1,this._samplerDictionary={},this._samplers=[];for(let n=0;n<t._samplers.length;++n){let r=new at(e,t._samplers[n],n);this._samplers.push(r),this._samplerDictionary[r._uniformName]=r}this._uniform_dictionary={},this._uniforms=[];for(let e of t._uniforms){let t=new ot(e);this._uniforms.push(t),this._uniform_dictionary[t._uniformName]=t}this._firstBind=!0,this._renderOrder=t.renderOrder,this._renderOrder==h.DEFAULT&&(this._renderOrder=this._state&p.BLEND?h.TRANSPARENT:h.OPAQUE)}bind(e){if(this._firstBind){for(let e=0;e<this._samplers.length;){let t=this._samplers[e];this._program.uniform[t._uniformName]?++e:this._samplers.splice(e,1)}for(let e=0;e<this._uniforms.length;){let t=this._uniforms[e];t._uniform=this._program.uniform[t._uniformName],t._uniform?++e:this._uniforms.splice(e,1)}this._firstBind=!1}for(let t of this._samplers){let n=t._renderTexture._isArray?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D;e.activeTexture(e.TEXTURE0+t._index),t._renderTexture&&t._renderTexture._complete?e.bindTexture(n,t._renderTexture._texture):e.bindTexture(n,null)}for(let t of this._uniforms)switch(t._length){case 1:e.uniform1fv(t._uniform,t._value);break;case 2:e.uniform2fv(t._uniform,t._value);break;case 3:e.uniform3fv(t._uniform,t._value);break;case 4:e.uniform4fv(t._uniform,t._value)}}markActive(e){if(this._activeFrameId!=e){this._activeFrameId=e,this._completeForActiveFrame=!0;for(let t=0;t<this._samplers.length;++t){let n=this._samplers[t];if(n._renderTexture){if(!n._renderTexture._complete){this._completeForActiveFrame=!1;break}n._renderTexture.markActive(e)}}}return this._completeForActiveFrame}get cullFace(){return!!(this._state&p.CULL_FACE)}get blend(){return!!(this._state&p.BLEND)}get depthTest(){return!!(this._state&p.DEPTH_TEST)}get stencilTest(){return!!(this._state&p.STENCIL_TEST)}get colorMask(){return!!(this._state&p.COLOR_MASK)}get depthMask(){return!!(this._state&p.DEPTH_MASK)}get stencilMask(){return!!(this._state&p.STENCIL_MASK)}get depthFunc(){return((this._state&m.DEPTH_FUNC_RANGE)>>m.DEPTH_FUNC_SHIFT)+Ke.NEVER}get blendFuncSrc(){return g(this._state,m.BLEND_SRC_RANGE,m.BLEND_SRC_SHIFT)}get blendFuncDst(){return g(this._state,m.BLEND_DST_RANGE,m.BLEND_DST_SHIFT)}_capsDiff(e){return e&m.CAPS_RANGE^this._state&m.CAPS_RANGE}_blendDiff(e){return this._state&p.BLEND?e&m.BLEND_FUNC_RANGE^this._state&m.BLEND_FUNC_RANGE:0}_depthFuncDiff(e){return this._state&p.DEPTH_TEST?e&m.DEPTH_FUNC_RANGE^this._state&m.DEPTH_FUNC_RANGE:0}},ct=class{constructor(e,t,n,r,i){let a=typeof t==`object`?t:{multiview:t,multisampledMultiview:n,useDepth:r,motionVectorPass:i};this._gl=e||Ze(),this._frameId=0,this._programCache={},this._textureCache={},this._renderPrimitives=Array(h.DEFAULT),this._cameraPositions=[],this._vaoExt=e.getExtension(`OES_vertex_array_object`);let o=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT);this._defaultFragPrecision=o.precision>0?`highp`:`mediump`,this._depthMaskNeedsReset=!1,this._colorMaskNeedsReset=!1,this._globalLightColor=M(Je),this._globalLightDir=M(qe),this._mv_ext=e.getExtension(`OCULUS_multiview`)||e.getExtension(`OVR_multiview2`),this._multiview=a.multiview&&this._mv_ext,this._multisampledMultiview=a.multisampledMultiview,this._useDepth=a.useDepth,this._motionVectorPass=a.motionVectorPass}get gl(){return this._gl}get multiview(){return this._multiview}get multisampledMultiview(){return this._multisampledMultiview&&this._multiview}get multiviewExtension(){return this._mv_ext}get motionVectorPass(){return this._motionVectorPass}get useDepth(){return this._useDepth}get xrFramebuffer(){return this._xrFramebuffer||=this._gl.createFramebuffer(),this._xrFramebuffer}getXrBinding(e){return this._xrBindingSession!=e&&(this._xrBinding=new XRWebGLBinding(e,this._gl),this._xrBindingSession=e),this._xrBinding}get maxSamples(){return this._maxSamples||=this._gl.getParameter(this._gl.MAX_SAMPLES),this._maxSamples}set globalLightColor(e){oe(this._globalLightColor,e)}get globalLightColor(){return M(this._globalLightColor)}set globalLightDir(e){oe(this._globalLightDir,e)}get globalLightDir(){return M(this._globalLightDir)}createRenderBuffer(e,t,n=Ke.STATIC_DRAW){let r=this._gl,i=r.createBuffer();if(t instanceof Promise){let a=new $e(e,n,t.then(t=>(r.bindBuffer(e,i),r.bufferData(e,t,n),a._length=t.byteLength,i)));return a}return r.bindBuffer(e,i),r.bufferData(e,t,n),new $e(e,n,i,t.byteLength)}updateRenderBuffer(e,t,n=0){if(e._buffer){let r=this._gl;r.bindBuffer(e._target,e._buffer),n==0&&e._length==t.byteLength?r.bufferData(e._target,t,e._usage):r.bufferSubData(e._target,n,t)}else e.waitForComplete().then(e=>{this.updateRenderBuffer(e,t,n)})}createRenderPrimitive(e,t){let n=new nt(e),r=this._getMaterialProgram(t,n),i=new st(this,t,r);return n.setRenderMaterial(i),this._renderPrimitives[i._renderOrder]||(this._renderPrimitives[i._renderOrder]=[]),this._renderPrimitives[i._renderOrder].push(n),n}createMesh(e,t){let n=new N;return n.addRenderPrimitive(this.createRenderPrimitive(e,t)),n}drawViews(e,t,n){if(!t)return;let r=this._gl;if(this._frameId++,t.markActive(this._frameId),e.length==1&&e[0].viewport){let t=e[0].viewport;this._gl.viewport(t.x,t.y,t.width,t.height)}for(let t=0;t<e.length;++t){this._cameraPositions.length<=t&&this._cameraPositions.push(j());let n=e[t].viewTransform.position;this._cameraPositions[t][0]=n.x,this._cameraPositions[t][1]=n.y,this._cameraPositions[t][2]=n.z}for(let t of this._renderPrimitives)t&&t.length&&this._drawRenderPrimitiveSet(e,t,n);this._vaoExt&&this._vaoExt.bindVertexArrayOES(null),this._depthMaskNeedsReset&&r.depthMask(!0),this._colorMaskNeedsReset&&r.colorMask(!0,!0,!0,!0)}_drawRenderPrimitiveSet(e,t,n){let r=this._gl,i=null,a=null,o=0;for(let s of t)if(s._activeFrameId==this._frameId){i!=s._material._program&&(i=s._material._program,i.use(),i.uniform.LIGHT_DIRECTION&&r.uniform3fv(i.uniform.LIGHT_DIRECTION,this._globalLightDir),i.uniform.LIGHT_COLOR&&r.uniform3fv(i.uniform.LIGHT_COLOR,this._globalLightColor),e.length==1&&(r.uniformMatrix4fv(i.uniform.PROJECTION_MATRIX,!1,e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.VIEW_MATRIX,!1,e[0].viewMatrix),this._motionVectorPass&&(r.uniformMatrix4fv(i.uniform.PREV_PROJECTION_MATRIX,!1,e[0].previousProjectionMatrix||e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_VIEW_MATRIX,!1,e[0].previousViewMatrix||e[0].viewMatrix)),i.uniform.CAMERA_POSITION&&r.uniform3fv(i.uniform.CAMERA_POSITION,this._cameraPositions[0]),i.uniform.EYE_INDEX&&r.uniform1i(i.uniform.EYE_INDEX,e[0].eyeIndex))),a!=s._material&&(this._bindMaterialState(s._material,a),s._material.bind(r,i,a),a=s._material),this._vaoExt?s._vao?this._vaoExt.bindVertexArrayOES(s._vao):(s._vao=this._vaoExt.createVertexArrayOES(),this._vaoExt.bindVertexArrayOES(s._vao),this._bindPrimitive(s)):(this._bindPrimitive(s,o),o=s._attributeMask);for(let t=0;t<e.length;++t){let o=e[t];if(e.length>1){if(o.viewport){let e=o.viewport;r.viewport(e.x,e.y,e.width,e.height)}this.multiview?(t==0&&(r.uniformMatrix4fv(i.uniform.LEFT_PROJECTION_MATRIX,!1,e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.LEFT_VIEW_MATRIX,!1,e[0].viewMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_PROJECTION_MATRIX,!1,e[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_VIEW_MATRIX,!1,e[1].viewMatrix),this._motionVectorPass&&(r.uniformMatrix4fv(i.uniform.PREV_LEFT_PROJECTION_MATRIX,!1,e[0].previousProjectionMatrix||e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_LEFT_VIEW_MATRIX,!1,e[0].previousViewMatrix||e[0].viewMatrix),r.uniformMatrix4fv(i.uniform.PREV_RIGHT_PROJECTION_MATRIX,!1,e[1].previousProjectionMatrix||e[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_RIGHT_VIEW_MATRIX,!1,e[1].previousViewMatrix||e[1].viewMatrix))),i.uniform.CAMERA_POSITION&&r.uniform3fv(i.uniform.CAMERA_POSITION,this._cameraPositions[t]),i.uniform.EYE_INDEX&&r.uniform1i(i.uniform.EYE_INDEX,o.eyeIndex)):(r.uniformMatrix4fv(i.uniform.PROJECTION_MATRIX,!1,o.projectionMatrix),r.uniformMatrix4fv(i.uniform.VIEW_MATRIX,!1,o.viewMatrix),this._motionVectorPass&&(r.uniformMatrix4fv(i.uniform.PREV_PROJECTION_MATRIX,!1,o.previousProjectionMatrix||o.projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_VIEW_MATRIX,!1,o.previousViewMatrix||o.viewMatrix)),i.uniform.CAMERA_POSITION&&r.uniform3fv(i.uniform.CAMERA_POSITION,this._cameraPositions[t]),i.uniform.EYE_INDEX&&r.uniform1i(i.uniform.EYE_INDEX,o.eyeIndex),n&&n.length&&r.uniform1ui(i.uniform.VIEW_ID,t)),n&&r.uniform1i(i.uniform.sortDepth,n.length>0),t==0&&n&&n.length&&(r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_PROJECTION_MATRIX,!1,e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_VIEW_MATRIX,!1,e[0].viewMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_PROJECTION_MATRIX,!1,e[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_VIEW_MATRIX,!1,e[1].viewMatrix),r.uniform1f(i.uniform.rawValueToMeters,n[0].rawValueToMeters),n[0].projectionMatrix&&(r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_PROJECTION_MATRIX,!1,n[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_VIEW_MATRIX,!1,n[0].transform.inverse.matrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_PROJECTION_MATRIX,!1,n[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_VIEW_MATRIX,!1,n[1].transform.inverse.matrix)),r.activeTexture(r.TEXTURE0+a._samplers.length),r.bindTexture(r.TEXTURE_2D_ARRAY,n[0].texture),r.uniform1i(i.uniform.depthColor,a._samplers.length))}for(let e of s._instances)e._activeFrameId==this._frameId&&(this._motionVectorPass&&(this._prepareMotionVectorInstance(e),r.uniformMatrix4fv(i.uniform.PREV_MODEL_MATRIX,!1,e._motionVectorPreviousWorldMatrix)),r.uniformMatrix4fv(i.uniform.MODEL_MATRIX,!1,e.worldMatrix),s._indexBuffer?r.drawElements(s._mode,s._elementCount,s._indexType,s._indexByteOffset):r.drawArrays(s._mode,0,s._elementCount));if(this.multiview)break}}}_prepareMotionVectorInstance(e){e._motionVectorFrameId!=this._frameId&&(e._motionVectorPreviousWorldMatrix?(E(e._motionVectorPreviousWorldMatrix,e._motionVectorCurrentWorldMatrix),E(e._motionVectorCurrentWorldMatrix,e.worldMatrix)):(e._motionVectorPreviousWorldMatrix=T(e.worldMatrix),e._motionVectorCurrentWorldMatrix=T(e.worldMatrix)),e._motionVectorFrameId=this._frameId)}addExternalTexture(e,t,n){this._textureCache[e]===void 0&&(this._textureCache[e]={}),this._textureCache[e]._complete=!0,this._textureCache[e]._texture=t,this._textureCache[e]._isArray=n}_getRenderTexture(e){if(!e)return null;let t=e.textureKey;if(!t)throw Error(`Texure does not have a valid key`);if(t in this._textureCache)return this._textureCache[t];{let n=this._gl,r=n.createTexture(),i=new rt(r);return this._textureCache[t]=i,e instanceof Ue?i._isExternalTexture=!0:e instanceof He?(n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,e.format,e.width,e.height,0,e.format,e._type,e._data),this._setSamplerParameters(e),i._complete=!0):e.waitForComplete().then(()=>{n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,e.format,e.format,n.UNSIGNED_BYTE,e.source),this._setSamplerParameters(e),i._complete=!0,e instanceof Ve&&e._video.addEventListener(`playing`,()=>{i._activeCallback=()=>{!e._video.paused&&!e._video.waiting&&(n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,e.format,e.format,n.UNSIGNED_BYTE,e.source))}})}),i}}_setSamplerParameters(e){let t=this._gl,n=e.sampler,r=Xe(e.width)&&Xe(e.height),i=r&&e.mipmap;i&&t.generateMipmap(t.TEXTURE_2D);let a=n.minFilter||(i?t.LINEAR_MIPMAP_LINEAR:t.LINEAR),o=n.wrapS||(r?t.REPEAT:t.CLAMP_TO_EDGE),s=n.wrapT||(r?t.REPEAT:t.CLAMP_TO_EDGE);t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,n.magFilter||t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,a),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,o),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,s)}_getProgramKey(e,t){let n=`${e}:`;for(let e in t)n+=`${e}=${t[e]},`;return n}_getMaterialProgram(e,t){let n=e.materialName;e.useDepth=this.useDepth;let r=e.vertexSource,i=this._motionVectorPass?`
precision highp float;
in highp vec4 vMotionClipPosition;
in highp vec4 vMotionPrevClipPosition;
out vec4 color;

void main() {
  highp vec4 motionVector =
      (vMotionClipPosition / vMotionClipPosition.w) -
      (vMotionPrevClipPosition / vMotionPrevClipPosition.w);
  color = motionVector;
}
`:e.fragmentSource;if(n==null)throw Error(`Material does not have a name`);if(r==null)throw Error(`Material "${n}" does not have a vertex source`);if(i==null)throw Error(`Material "${n}" does not have a fragment source`);let a=e.getProgramDefines(t),o=this._motionVectorPass&&e.positionOnlyMotionVector;o&&(a.POSITION_ONLY_MOTION_VECTOR=1);let s=this._getProgramKey(n,a),c=[],l=[];if(this.multiview&&(c=[`GL_OVR_multiview2`],l=[`num_views=2`]),s in this._programCache)return this._programCache[s];{let t=r;this._motionVectorPass?t+=o?this.multiview?`
uniform mat4 LEFT_PROJECTION_MATRIX, LEFT_VIEW_MATRIX, RIGHT_PROJECTION_MATRIX, RIGHT_VIEW_MATRIX, MODEL_MATRIX;
uniform mat4 PREV_LEFT_PROJECTION_MATRIX, PREV_LEFT_VIEW_MATRIX, PREV_RIGHT_PROJECTION_MATRIX, PREV_RIGHT_VIEW_MATRIX, PREV_MODEL_MATRIX;
out highp vec4 vMotionClipPosition;
out highp vec4 vMotionPrevClipPosition;

void main() {
  vec4 position = vec4(POSITION, 1.0);
  vec4 modelPosition = MODEL_MATRIX * position;
  vec4 prevModelPosition = PREV_MODEL_MATRIX * position;
  mat4 projectionMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_PROJECTION_MATRIX : RIGHT_PROJECTION_MATRIX;
  mat4 viewMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_VIEW_MATRIX : RIGHT_VIEW_MATRIX;
  mat4 prevProjectionMatrix =
      (gl_ViewID_OVR == 0u) ? PREV_LEFT_PROJECTION_MATRIX : PREV_RIGHT_PROJECTION_MATRIX;
  mat4 prevViewMatrix =
      (gl_ViewID_OVR == 0u) ? PREV_LEFT_VIEW_MATRIX : PREV_RIGHT_VIEW_MATRIX;

  vMotionClipPosition = projectionMatrix * (viewMatrix * modelPosition);
  vMotionPrevClipPosition =
      prevProjectionMatrix * (prevViewMatrix * prevModelPosition);
  gl_Position = vMotionClipPosition;
}
`:`
uniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;
uniform mat4 PREV_PROJECTION_MATRIX, PREV_VIEW_MATRIX, PREV_MODEL_MATRIX;
out highp vec4 vMotionClipPosition;
out highp vec4 vMotionPrevClipPosition;

void main() {
  vec4 position = vec4(POSITION, 1.0);
  vec4 modelPosition = MODEL_MATRIX * position;
  vec4 prevModelPosition = PREV_MODEL_MATRIX * position;
  vMotionClipPosition = PROJECTION_MATRIX * (VIEW_MATRIX * modelPosition);
  vMotionPrevClipPosition =
      PREV_PROJECTION_MATRIX * (PREV_VIEW_MATRIX * prevModelPosition);
  gl_Position = vMotionClipPosition;
}
`:this.multiview?`
uniform mat4 LEFT_PROJECTION_MATRIX, LEFT_VIEW_MATRIX, RIGHT_PROJECTION_MATRIX, RIGHT_VIEW_MATRIX, MODEL_MATRIX;
uniform mat4 PREV_LEFT_PROJECTION_MATRIX, PREV_LEFT_VIEW_MATRIX, PREV_RIGHT_PROJECTION_MATRIX, PREV_RIGHT_VIEW_MATRIX, PREV_MODEL_MATRIX;
out highp vec4 vMotionClipPosition;
out highp vec4 vMotionPrevClipPosition;

void main() {
  mat4 projectionMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_PROJECTION_MATRIX : RIGHT_PROJECTION_MATRIX;
  mat4 viewMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_VIEW_MATRIX : RIGHT_VIEW_MATRIX;
  mat4 prevProjectionMatrix =
      (gl_ViewID_OVR == 0u) ? PREV_LEFT_PROJECTION_MATRIX : PREV_RIGHT_PROJECTION_MATRIX;
  mat4 prevViewMatrix =
      (gl_ViewID_OVR == 0u) ? PREV_LEFT_VIEW_MATRIX : PREV_RIGHT_VIEW_MATRIX;

  vMotionClipPosition = vertex_main(projectionMatrix, viewMatrix, MODEL_MATRIX);
  vMotionPrevClipPosition =
      vertex_main(prevProjectionMatrix, prevViewMatrix, PREV_MODEL_MATRIX);
  gl_Position = vMotionClipPosition;
}
`:`
uniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;
uniform mat4 PREV_PROJECTION_MATRIX, PREV_VIEW_MATRIX, PREV_MODEL_MATRIX;
out highp vec4 vMotionClipPosition;
out highp vec4 vMotionPrevClipPosition;

void main() {
  vMotionClipPosition = vertex_main(PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX);
  vMotionPrevClipPosition = vertex_main(PREV_PROJECTION_MATRIX, PREV_VIEW_MATRIX, PREV_MODEL_MATRIX);
  gl_Position = vMotionClipPosition;
}
`:this._useDepth?t+=this.multiview?`
uniform mat4 LEFT_PROJECTION_MATRIX, LEFT_VIEW_MATRIX, RIGHT_PROJECTION_MATRIX, RIGHT_VIEW_MATRIX, MODEL_MATRIX;
out vec4 vWorldPosition;

const mat4 identity = mat4(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1);

void main() {
  mat4 projectionMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_PROJECTION_MATRIX : RIGHT_PROJECTION_MATRIX;
  mat4 viewMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_VIEW_MATRIX : RIGHT_VIEW_MATRIX;
  vWorldPosition = vertex_main(identity, identity, MODEL_MATRIX);
  gl_Position = vertex_main(projectionMatrix, viewMatrix, MODEL_MATRIX);
}
`:`
uniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;
out vec4 vWorldPosition;

const mat4 identity = mat4(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1);

void main() {
  vWorldPosition = vertex_main(identity, identity, MODEL_MATRIX);
  gl_Position = vertex_main(PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX);
}
`:t+=this.multiview?`
uniform mat4 LEFT_PROJECTION_MATRIX, LEFT_VIEW_MATRIX, RIGHT_PROJECTION_MATRIX, RIGHT_VIEW_MATRIX, MODEL_MATRIX;
void main() {
  mat4 projectionMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_PROJECTION_MATRIX : RIGHT_PROJECTION_MATRIX;
  mat4 viewMatrix =
      (gl_ViewID_OVR == 0u) ? LEFT_VIEW_MATRIX : RIGHT_VIEW_MATRIX;
  gl_Position = vertex_main(projectionMatrix, viewMatrix, MODEL_MATRIX);
}
`:`
uniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;

void main() {
  gl_Position = vertex_main(PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX);
}
`;let n=(i.match(Ye)?``:`precision ${this._defaultFragPrecision} float;\n`)+i;this._motionVectorPass||(this._useDepth?n+=this.multiview?`
#define VIEW_ID gl_ViewID_OVR
#define SideBySideMultiplier 1.0

precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray depthColor;
uniform float rawValueToMeters;
out vec4 color;
in vec4 vWorldPosition;
uniform bool sortDepth;

uniform mat4 LEFT_DEPTH_PROJECTION_MATRIX, LEFT_DEPTH_VIEW_MATRIX, RIGHT_DEPTH_PROJECTION_MATRIX, RIGHT_DEPTH_VIEW_MATRIX;

float Depth_GetCameraDepthInMillimeters(const sampler2DArray depthTexture,
  const vec2 depthUv) {
  return texture(depthColor, vec3(depthUv.x, depthUv.y, VIEW_ID)).r * 1000.0 * rawValueToMeters;
}

float Depth_GetOcclusion(const sampler2DArray depthTexture, const vec2 depthUv, float assetDepthMm) {
  float depthMm = Depth_GetCameraDepthInMillimeters(depthTexture, depthUv);

  // Instead of a hard z-buffer test, allow the asset to fade into the
  // background along a 2 * kDepthTolerancePerMm * assetDepthMm
  // range centered on the background depth.
  const float kDepthTolerancePerMm = 0.01;
  return clamp(1.0 -
    0.5 * (depthMm - assetDepthMm) /
        (kDepthTolerancePerMm * assetDepthMm) +
    0.5, 0.0, 1.0);
}

float Depth_GetBlurredOcclusionAroundUV(const sampler2DArray depthTexture, const vec2 uv, float assetDepthMm) {
  // Kernel used:
  // 0   4   7   4   0
  // 4   16  26  16  4
  // 7   26  41  26  7
  // 4   16  26  16  4
  // 0   4   7   4   0
  const float kKernelTotalWeights = 269.0;
  float sum = 0.0;

  const float kOcclusionBlurAmount = 0.01;
  vec2 blurriness = vec2(kOcclusionBlurAmount /SideBySideMultiplier, kOcclusionBlurAmount /** u_DepthAspectRatio*/);

  float current = 0.0;

  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, -2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, -2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, +2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, +2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-2.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+2.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-2.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+2.0, -1.0) * blurriness, assetDepthMm);
  sum += current * 4.0;

  current = 0.0;
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-2.0, -0.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+2.0, +0.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+0.0, +2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-0.0, -2.0) * blurriness, assetDepthMm);
  sum += current * 7.0;

  current = 0.0;
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, +1.0) * blurriness, assetDepthMm);
  sum += current * 16.0;

  current = 0.0;
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+0.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-0.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, -0.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, +0.0) * blurriness, assetDepthMm);
  sum += current * 26.0;

  sum += Depth_GetOcclusion(depthTexture, uv, assetDepthMm) * 41.0;

  return sum / kKernelTotalWeights;
}

void main() {
  vec4 depthPosition = (VIEW_ID == 0u) ? LEFT_DEPTH_PROJECTION_MATRIX * LEFT_DEPTH_VIEW_MATRIX * vWorldPosition :
                      RIGHT_DEPTH_PROJECTION_MATRIX * RIGHT_DEPTH_VIEW_MATRIX * vWorldPosition;
  vec2 depthPositionHC = depthPosition.xy / depthPosition.w;
  depthPositionHC = vec2 (depthPositionHC.x + 1.0,  depthPositionHC.y + 1.0 ) * 0.5;
  color = fragment_main();
  if (color.a == 0.0) {
    // There's no sense in calculating occlusion for a fully transparent pixel.
    return;
  }

  if (!sortDepth) {
    return;
  }

  float assetDepthMm = gl_FragCoord.z * 1000.0 * rawValueToMeters;

  float occlusion = Depth_GetBlurredOcclusionAroundUV(depthColor, depthPositionHC, assetDepthMm);

  //float occlusion = Depth_GetOcclusion(depthColor, depthPositionHC, assetDepthMm);

  float objectMaskEroded = pow(occlusion, 10.0);

  float occlusionTransition = clamp(occlusion * (2.0 - objectMaskEroded), 0.0, 1.0);

  float kMaxOcclusion = 1.0;
  occlusionTransition = min(occlusionTransition, kMaxOcclusion);

  color = color * (1.0 - occlusion);
}
`:`
uniform uint VIEW_ID;
#define SideBySideMultiplier 1.0

precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray depthColor;
uniform float rawValueToMeters;
out vec4 color;
in vec4 vWorldPosition;
uniform bool sortDepth;

uniform mat4 LEFT_DEPTH_PROJECTION_MATRIX, LEFT_DEPTH_VIEW_MATRIX, RIGHT_DEPTH_PROJECTION_MATRIX, RIGHT_DEPTH_VIEW_MATRIX;

float Depth_GetCameraDepthInMillimeters(const sampler2DArray depthTexture,
  const vec2 depthUv) {
  return texture(depthColor, vec3(depthUv.x, depthUv.y, VIEW_ID)).r * 1000.0 * rawValueToMeters;
}

float Depth_GetOcclusion(const sampler2DArray depthTexture, const vec2 depthUv, float assetDepthMm) {
  float depthMm = Depth_GetCameraDepthInMillimeters(depthTexture, depthUv);

  // Instead of a hard z-buffer test, allow the asset to fade into the
  // background along a 2 * kDepthTolerancePerMm * assetDepthMm
  // range centered on the background depth.
  const float kDepthTolerancePerMm = 0.01;
  return clamp(1.0 -
    0.5 * (depthMm - assetDepthMm) /
        (kDepthTolerancePerMm * assetDepthMm) +
    0.5, 0.0, 1.0);
}

float Depth_GetBlurredOcclusionAroundUV(const sampler2DArray depthTexture, const vec2 uv, float assetDepthMm) {
  // Kernel used:
  // 0   4   7   4   0
  // 4   16  26  16  4
  // 7   26  41  26  7
  // 4   16  26  16  4
  // 0   4   7   4   0
  const float kKernelTotalWeights = 269.0;
  float sum = 0.0;

  const float kOcclusionBlurAmount = 0.01;
  vec2 blurriness = vec2(kOcclusionBlurAmount /SideBySideMultiplier, kOcclusionBlurAmount /** u_DepthAspectRatio*/);

  float current = 0.0;

  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, -2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, -2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, +2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, +2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-2.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+2.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-2.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+2.0, -1.0) * blurriness, assetDepthMm);
  sum += current * 4.0;

  current = 0.0;
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-2.0, -0.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+2.0, +0.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+0.0, +2.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-0.0, -2.0) * blurriness, assetDepthMm);
  sum += current * 7.0;

  current = 0.0;
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, +1.0) * blurriness, assetDepthMm);
  sum += current * 16.0;

  current = 0.0;
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+0.0, +1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-0.0, -1.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(-1.0, -0.0) * blurriness, assetDepthMm);
  current += Depth_GetOcclusion(depthTexture, uv + vec2(+1.0, +0.0) * blurriness, assetDepthMm);
  sum += current * 26.0;

  sum += Depth_GetOcclusion(depthTexture, uv, assetDepthMm) * 41.0;

  return sum / kKernelTotalWeights;
}

void main() {
  vec4 depthPosition = (VIEW_ID == 0u) ? LEFT_DEPTH_PROJECTION_MATRIX * LEFT_DEPTH_VIEW_MATRIX * vWorldPosition :
                      RIGHT_DEPTH_PROJECTION_MATRIX * RIGHT_DEPTH_VIEW_MATRIX * vWorldPosition;
  vec2 depthPositionHC = depthPosition.xy / depthPosition.w;
  depthPositionHC = vec2 (depthPositionHC.x + 1.0,  depthPositionHC.y + 1.0 ) * 0.5;
  color = fragment_main();
  if (color.a == 0.0) {
    // There's no sense in calculating occlusion for a fully transparent pixel.
    return;
  }

  if (!sortDepth) {
    return;
  }

  float assetDepthMm = gl_FragCoord.z * 1000.0 * rawValueToMeters;

  float occlusion = Depth_GetBlurredOcclusionAroundUV(depthColor, depthPositionHC, assetDepthMm);

  //float occlusion = Depth_GetOcclusion(depthColor, depthPositionHC, assetDepthMm);

  float objectMaskEroded = pow(occlusion, 10.0);

  float occlusionTransition = clamp(occlusion * (2.0 - objectMaskEroded), 0.0, 1.0);

  float kMaxOcclusion = 1.0;
  occlusionTransition = min(occlusionTransition, kMaxOcclusion);

  color = color * (1.0 - occlusion);
}
`:n+=(this.multiview,`
out vec4 color;
void main() {
  color = fragment_main();
}
`));let u=new Fe(this._gl,t,n,Ge,a,c,l);return this._programCache[s]=u,u.onNextUse(t=>{for(let n=0;n<e._samplers.length;++n){let r=e._samplers[n],i=t.uniform[r._uniformName];i&&this._gl.uniform1i(i,n)}}),u}}_bindPrimitive(e,t){let n=this._gl;if(t!=e._attributeMask)for(let t in Ge)e._attributeMask&P[t]?n.enableVertexAttribArray(Ge[t]):n.disableVertexAttribArray(Ge[t]);for(let t of e._attributeBuffers){n.bindBuffer(n.ARRAY_BUFFER,t._buffer._buffer);for(let e of t._attributes)n.vertexAttribPointer(e._attrib_index,e._componentCount,e._componentType,e._normalized,e._stride,e._byteOffset)}e._indexBuffer?n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e._indexBuffer._buffer):n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,null)}_bindMaterialState(e,t=null){let n=this._gl,r=e._state,i=t?t._state:~r;if(r!=i){if(e._capsDiff(i)){it(n,n.CULL_FACE,p.CULL_FACE,i,r),it(n,n.BLEND,p.BLEND,i,r),it(n,n.DEPTH_TEST,p.DEPTH_TEST,i,r),it(n,n.STENCIL_TEST,p.STENCIL_TEST,i,r);let e=(r&p.COLOR_MASK)-(i&p.COLOR_MASK);if(e){let t=e>1;this._colorMaskNeedsReset=!t,n.colorMask(t,t,t,t)}let t=(r&p.DEPTH_MASK)-(i&p.DEPTH_MASK);t&&(this._depthMaskNeedsReset=!(t>1),n.depthMask(t>1));let a=(r&p.STENCIL_MASK)-(i&p.STENCIL_MASK);a&&n.stencilMask(a>1?255:0)}e._blendDiff(i)&&n.blendFuncSeparate(e.blendFuncSrc,e.blendFuncDst,n.ONE,n.ONE_MINUS_SRC_ALPHA),e._depthFuncDiff(i)&&n.depthFunc(e.depthFunc)}}},F=class{constructor(e,t,n,r,i,a){this.name=e,this.buffer=t,this.componentCount=n||3,this.componentType=r||5126,this.stride=i||0,this.byteOffset=a||0,this.normalized=!1}},lt=class{constructor(e,t,n){this.attributes=e||[],this.elementCount=t||0,this.mode=n||4,this.indexBuffer=null,this.indexByteOffset=0,this.indexType=0,this._min=null,this._max=null}setIndexBuffer(e,t,n){this.indexBuffer=e,this.indexByteOffset=t||0,this.indexType=n||5123}setBounds(e,t){this._min=M(e),this._max=M(t)}},ut=class extends b{constructor(){super(),this.baseColor=this.defineSampler(`baseColorTex`),this.metallicRoughness=this.defineSampler(`metallicRoughnessTex`),this.normal=this.defineSampler(`normalTex`),this.occlusion=this.defineSampler(`occlusionTex`),this.emissive=this.defineSampler(`emissiveTex`),this.baseColorFactor=this.defineUniform(`baseColorFactor`,[1,1,1,1]),this.metallicRoughnessFactor=this.defineUniform(`metallicRoughnessFactor`,[1,1]),this.occlusionStrength=this.defineUniform(`occlusionStrength`,1),this.modelExposure=this.defineUniform(`modelExposure`,1),this.modelOpacity=this.defineUniform(`modelOpacity`,1),this.emissiveFactor=this.defineUniform(`emissiveFactor`,[0,0,0])}get materialName(){return`PBR`}get vertexSource(){return`
in vec3 POSITION, NORMAL;
in vec2 TEXCOORD_0, TEXCOORD_1;

uniform vec3 CAMERA_POSITION;
uniform vec3 LIGHT_DIRECTION;

out vec3 vLight; // Vector from vertex to light.
out vec3 vView; // Vector from vertex to camera.
out vec2 vTex;

#ifdef USE_NORMAL_MAP
in vec4 TANGENT;
out mat3 vTBN;
#else
out vec3 vNorm;
#endif

#ifdef USE_VERTEX_COLOR
in vec4 COLOR_0;
out vec4 vCol;
#endif

vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
  vec3 n = normalize(vec3(model * vec4(NORMAL, 0.0)));
#ifdef USE_NORMAL_MAP
  vec3 t = normalize(vec3(model * vec4(TANGENT.xyz, 0.0)));
  vec3 b = cross(n, t) * TANGENT.w;
  vTBN = mat3(t, b, n);
#else
  vNorm = n;
#endif

#ifdef USE_VERTEX_COLOR
  vCol = COLOR_0;
#endif

  vTex = TEXCOORD_0;
  vec4 mPos = model * vec4(POSITION, 1.0);
  vLight = -LIGHT_DIRECTION;
  vView = CAMERA_POSITION - mPos.xyz;
  return proj * view * mPos;
}`}get fragmentSource(){return`
#define M_PI 3.14159265

uniform vec4 baseColorFactor;
#ifdef USE_BASE_COLOR_MAP
uniform sampler2D baseColorTex;
#endif

in vec3 vLight;
in vec3 vView;
in vec2 vTex;

#ifdef USE_VERTEX_COLOR
in vec4 vCol;
#endif

#ifdef USE_NORMAL_MAP
uniform sampler2D normalTex;
in mat3 vTBN;
#else
in vec3 vNorm;
#endif

#ifdef USE_METAL_ROUGH_MAP
uniform sampler2D metallicRoughnessTex;
#endif
uniform vec2 metallicRoughnessFactor;

#ifdef USE_OCCLUSION
uniform sampler2D occlusionTex;
uniform float occlusionStrength;
#endif

#ifdef USE_EMISSIVE_TEXTURE
uniform sampler2D emissiveTex;
#endif
uniform vec3 emissiveFactor;

uniform vec3 LIGHT_COLOR;
uniform float modelExposure;
uniform float modelOpacity;

const vec3 dielectricSpec = vec3(0.04);
const vec3 black = vec3(0.0);


vec3 lambertDiffuse(vec3 cDiff) {
  return cDiff / M_PI;
}

float specD(float a, float nDotH) {
  float aSqr = a * a;
  float f = ((nDotH * nDotH) * (aSqr - 1.0) + 1.0);
  return aSqr / (M_PI * f * f);
}

float specG(float roughness, float nDotL, float nDotV) {
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float gl = nDotL / (nDotL * (1.0 - k) + k);
  float gv = nDotV / (nDotV * (1.0 - k) + k);
  return gl * gv;
}

vec3 specF(float vDotH, vec3 F0) {
  float exponent = (-5.55473 * vDotH - 6.98316) * vDotH;
  float base = 2.0;
  return F0 + (1.0 - F0) * pow(base, exponent);
}

vec4 fragment_main() {
#ifdef USE_BASE_COLOR_MAP
  vec4 baseColor = texture(baseColorTex, vTex) * baseColorFactor;
#else
  vec4 baseColor = baseColorFactor;
#endif

#ifdef USE_VERTEX_COLOR
  baseColor *= vCol;
#endif

#ifdef USE_NORMAL_MAP
  vec3 n = texture(normalTex, vTex).rgb;
  n = normalize(vTBN * (2.0 * n - 1.0));
#else
  vec3 n = normalize(vNorm);
#endif

#ifdef FULLY_ROUGH
  float metallic = 0.0;
#else
  float metallic = metallicRoughnessFactor.x;
#endif

  float roughness = metallicRoughnessFactor.y;

#ifdef USE_METAL_ROUGH_MAP
  vec4 metallicRoughness = texture(metallicRoughnessTex, vTex);
  metallic *= metallicRoughness.b;
  roughness *= metallicRoughness.g;
#endif
  
  vec3 l = normalize(vLight);
  vec3 v = normalize(vView);
  vec3 h = normalize(l+v);

  float nDotL = clamp(dot(n, l), 0.001, 1.0);
  float nDotV = abs(dot(n, v)) + 0.001;
  float nDotH = max(dot(n, h), 0.0);
  float vDotH = max(dot(v, h), 0.0);

  // From GLTF Spec
  vec3 cDiff = mix(baseColor.rgb * (1.0 - dielectricSpec.r), black, metallic); // Diffuse color
  vec3 F0 = mix(dielectricSpec, baseColor.rgb, metallic); // Specular color
  float a = roughness * roughness;

#ifdef FULLY_ROUGH
  vec3 specular = F0 * 0.45;
#else
  vec3 F = specF(vDotH, F0);
  float D = specD(a, nDotH);
  float G = specG(roughness, nDotL, nDotV);
  vec3 specular = (D * F * G) / (4.0 * nDotL * nDotV);
#endif
  float halfLambert = dot(n, l) * 0.5 + 0.5;
  halfLambert *= halfLambert;

  vec3 color = (halfLambert * LIGHT_COLOR * lambertDiffuse(cDiff)) + specular;

#ifdef USE_OCCLUSION
  float occlusion = texture(occlusionTex, vTex).r;
  color = mix(color, color * occlusion, occlusionStrength);
#endif
  
  vec3 emissive = emissiveFactor;
#ifdef USE_EMISSIVE_TEXTURE
  emissive *= texture(emissiveTex, vTex).rgb;
#endif
  color += emissive;

  // gamma correction
  //color = pow(color, vec3(1.0/2.2));

  return vec4(color * modelExposure, baseColor.a * modelOpacity);
}`}get positionOnlyMotionVector(){return!0}getProgramDefines(e){let t={};return e._attributeMask&P.COLOR_0&&(t.USE_VERTEX_COLOR=1),e._attributeMask&P.TEXCOORD_0&&(this.baseColor.texture&&(t.USE_BASE_COLOR_MAP=1),this.normal.texture&&e._attributeMask&P.TANGENT&&(t.USE_NORMAL_MAP=1),this.metallicRoughness.texture&&(t.USE_METAL_ROUGH_MAP=1),this.occlusion.texture&&(t.USE_OCCLUSION=1),this.emissive.texture&&(t.USE_EMISSIVE_TEXTURE=1)),(!this.metallicRoughness.texture||!(e._attributeMask&P.TEXCOORD_0))&&this.metallicRoughnessFactor.value[1]==1&&(t.FULLY_ROUGH=1),t}};let dt=WebGLRenderingContext,ft={JSON:1313821514,BIN:5130562};function pt(e){let t=RegExp(`^`+window.location.protocol,`i`);return!!e.match(t)}function mt(e){return!!e.match(/^data:/)}function ht(e,t){return pt(e)||mt(e)?e:t+e}function gt(e){switch(e){case`SCALAR`:return 1;case`VEC2`:return 2;case`VEC3`:return 3;case`VEC4`:return 4;default:return 0}}var _t=class{constructor(e){this.renderer=e,this._gl=e._gl}loadFromUrl(e){return fetch(e).then(t=>{let n=e.lastIndexOf(`/`),r=n===0?``:e.substring(0,n+1);if(e.endsWith(`.gltf`))return t.json().then(e=>this.loadFromJson(e,r));if(e.endsWith(`.glb`))return t.arrayBuffer().then(e=>this.loadFromBinary(e,r));throw Error(`Unrecognized file extension`)})}loadFromBinary(e,t){let n=new DataView(e,0,12),r=n.getUint32(0,!0),i=n.getUint32(4,!0),a=n.getUint32(8,!0);if(r!=1179937895)throw Error(`Invalid magic string in binary header.`);if(i!=2)throw Error(`Incompatible version in binary header.`);let o={},s=12;for(;s<a;){let t=new DataView(e,s,8),n=t.getUint32(0,!0),r=t.getUint32(4,!0);o[r]=e.slice(s+8,s+8+n),s+=n+8}if(!o[ft.JSON])throw Error(`File contained no json chunk.`);let c=new TextDecoder(`utf-8`).decode(o[ft.JSON]),l=JSON.parse(c);return this.loadFromJson(l,t,o[ft.BIN])}loadFromJson(e,t,n){if(!e.asset)throw Error(`Missing asset description.`);if(e.asset.minVersion!=`2.0`&&e.asset.version!=`2.0`)throw Error(`Incompatible asset version.`);let r=[];if(n)r[0]=new bt({},t,n);else for(let n of e.buffers)r.push(new bt(n,t));let i=[];for(let t of e.bufferViews)i.push(new yt(t,r));let a=[];if(e.images)for(let n of e.images)a.push(new bt(n,t));let o=[];if(e.textures)for(let t of e.textures){let e=a[t.source].texture(i);if(t.sampler){let n=n[t.sampler];e.sampler.minFilter=n.minFilter,e.sampler.magFilter=n.magFilter,e.sampler.wrapS=n.wrapS,e.sampler.wrapT=n.wrapT}o.push(e)}function s(e){return e?o[e.index]:null}let c=[];if(e.materials)for(let t of e.materials){let e=new ut,n=t.pbrMetallicRoughness||{};switch(e.baseColorFactor.value=n.baseColorFactor||[1,1,1,1],e.baseColor.texture=s(n.baseColorTexture),e.metallicRoughnessFactor.value=[n.metallicFactor??1,n.roughnessFactor??1],e.metallicRoughness.texture=s(n.metallicRoughnessTexture),e.normal.texture=s(t.normalTexture),e.occlusion.texture=s(t.occlusionTexture),e.occlusionStrength.value=t.occlusionTexture&&t.occlusionTexture.strength?t.occlusionTexture.strength:1,e.emissiveFactor.value=t.emissiveFactor||[0,0,0],e.emissive.texture=s(t.emissiveTexture),!e.emissive.texture&&t.emissiveFactor&&(e.emissive.texture=new We(1,1,1,1)),t.alphaMode){case`BLEND`:e.state.blend=!0;break;case`MASK`:e.state.blend=!0;break;default:e.state.blend=!1}e.state.cullFace=!t.doubleSided,c.push(e)}let l=e.accessors,u=[];for(let t of e.meshes){let e=new vt;u.push(e);for(let n of t.primitives){let t=null;t=`material`in n?c[n.material]:new ut;let r=[],a=0,o=null,s=null;for(let e in n.attributes){let t=l[n.attributes[e]],c=i[t.bufferView];a=t.count;let u=new F(e,c.renderBuffer(this.renderer,dt.ARRAY_BUFFER),gt(t.type),t.componentType,c.byteStride||0,t.byteOffset||0);u.normalized=t.normalized||!1,e==`POSITION`&&(o=t.min,s=t.max),r.push(u)}let u=new lt(r,a,n.mode);if(`indices`in n){let e=l[n.indices],t=i[e.bufferView];u.setIndexBuffer(t.renderBuffer(this.renderer,dt.ELEMENT_ARRAY_BUFFER),e.byteOffset||0,e.componentType),u.indexType=e.componentType,u.indexByteOffset=e.byteOffset||0,u.elementCount=e.count}o&&s&&u.setBounds(o,s);let d=this.renderer.createRenderPrimitive(u,t);d.vertexStreams=Object.fromEntries(r.map(e=>[e.name,{buffer:e.buffer,byteOffset:e.byteOffset,stride:e.stride,count:l[n.attributes[e.name]].count}])),e.primitives.push(d)}}let d=new N,f=e.scenes[e.scene];for(let t of f.nodes){let n=e.nodes[t];d.addNode(this.processNodes(n,e.nodes,u))}return d}processNodes(e,t,n){let r=new N;if(r.name=e.name,`mesh`in e){let t=n[e.mesh];for(let e of t.primitives)r.addRenderPrimitive(e)}if(e.matrix?r.matrix=new Float32Array(e.matrix):(e.translation||e.rotation||e.scale)&&(e.translation&&(r.translation=new Float32Array(e.translation)),e.rotation&&(r.rotation=new Float32Array(e.rotation)),e.scale&&(r.scale=new Float32Array(e.scale))),e.children)for(let i of e.children){let e=t[i];r.addNode(this.processNodes(e,t,n))}return r}},vt=class{constructor(){this.primitives=[]}},yt=class{constructor(e,t){this.buffer=t[e.buffer],this.byteOffset=e.byteOffset||0,this.byteLength=e.byteLength||null,this.byteStride=e.byteStride,this._viewPromise=null,this._renderBuffer=null}dataView(){return this._viewPromise||=this.buffer.arrayBuffer().then(e=>new DataView(e,this.byteOffset,this.byteLength)),this._viewPromise}renderBuffer(e,t){return this._renderBuffer||=e.createRenderBuffer(t,this.dataView()),this._renderBuffer}},bt=class{constructor(e,t,n){this.json=e,this.baseUrl=t,this._dataPromise=null,this._texture=null,n&&(this._dataPromise=Promise.resolve(n))}arrayBuffer(){if(!this._dataPromise){if(mt(this.json.uri)){let e=this.json.uri.replace(`data:application/octet-stream;base64,`,``),t=Uint8Array.from(atob(e),e=>e.charCodeAt(0));return this._dataPromise=Promise.resolve(t.buffer),this._dataPromise}this._dataPromise=fetch(ht(this.json.uri,this.baseUrl)).then(e=>e.arrayBuffer())}return this._dataPromise}texture(e){if(!this._texture){let t=new Image;this._texture=new Be(t),this.json.uri?t.src=mt(this.json.uri)?this.json.uri:`${this.baseUrl}${this.json.uri}`:(this._texture.genDataKey(),e[this.json.bufferView].dataView().then(e=>{let n=new Blob([e],{type:this.json.mimeType});t.src=window.URL.createObjectURL(n)}))}return this._texture}};let xt=/* @__PURE__ */ new WeakMap;var St=class extends N{constructor(e){super(),this._url=e.url,this._promise=null,this._resolver=null,this._rejecter=null}onRendererChanged(e){let t=xt.get(e);t||(t=new _t(e),xt.set(e,t)),!this._resolver&&this._promise&&(this._promise=null),this._ensurePromise(),t.loadFromUrl(this._url).then(e=>{this.addNode(e),this._resolver(e.waitForComplete()),this._resolver=null,this._rejecter=null}).catch(e=>{this._rejecter&&this._rejecter(e),this._resolver=null,this._rejecter=null})}_ensurePromise(){return this._promise||=new Promise((e,t)=>{this._resolver=e,this._rejecter=t}),this._promise}waitForComplete(){return this._ensurePromise()}};let Ct={Handedness:Object.freeze({NONE:`none`,LEFT:`left`,RIGHT:`right`}),ComponentState:Object.freeze({DEFAULT:`default`,TOUCHED:`touched`,PRESSED:`pressed`}),ComponentProperty:Object.freeze({BUTTON:`button`,X_AXIS:`xAxis`,Y_AXIS:`yAxis`,STATE:`state`}),ComponentType:Object.freeze({TRIGGER:`trigger`,SQUEEZE:`squeeze`,TOUCHPAD:`touchpad`,THUMBSTICK:`thumbstick`,BUTTON:`button`}),ButtonTouchThreshold:.05,AxisTouchThreshold:.1,VisualResponseProperty:Object.freeze({TRANSFORM:`transform`,VISIBILITY:`visibility`})};async function wt(e){let t=await fetch(e);if(t.ok)return t.json();throw Error(t.statusText)}async function Tt(e){if(!e)throw Error(`No basePath supplied`);return await wt(`${e}/profilesList.json`)}async function Et(e,t,n=null,r=!0){if(!e)throw Error(`No xrInputSource supplied`);if(!t)throw Error(`No basePath supplied`);let i=await Tt(t),a;if(e.profiles.some(e=>{let n=i[e];return n&&(a={profileId:e,profilePath:`${t}/${n.path}`,deprecated:!!n.deprecated}),!!a}),!a){if(!n)throw Error(`No matching profile name found`);let e=i[n];if(!e)throw Error(`No matching profile name found and default profile "${n}" missing.`);a={profileId:n,profilePath:`${t}/${e.path}`,deprecated:!!e.deprecated}}let o=await wt(a.profilePath),s;if(r){let t;if(t=e.handedness===`any`?o.layouts[Object.keys(o.layouts)[0]]:o.layouts[e.handedness],!t)throw Error(`No matching handedness, ${e.handedness}, in profile ${a.profileId}`);t.assetPath&&(s=a.profilePath.replace(`profile.json`,t.assetPath))}return{profile:o,assetPath:s}}Ct.ComponentState.DEFAULT;let Dt=WebGLRenderingContext,Ot=new Uint8Array([255,255,255,1,255,255,255,2,191,191,191,4,204,204,204,5,219,219,219,7,204,204,204,10,216,216,216,13,210,210,210,17,206,206,206,21,206,206,206,26,206,206,206,31,205,205,205,36,200,200,200,42,201,201,201,47,201,201,201,52,201,201,201,57,201,201,201,61,200,200,200,65,203,203,203,68,238,238,238,135,250,250,250,200,249,249,249,201,249,249,249,201,250,250,250,201,250,250,250,201,249,249,249,201,249,249,249,201,250,250,250,200,238,238,238,135,203,203,203,68,200,200,200,65,201,201,201,61,201,201,201,57,201,201,201,52,201,201,201,47,200,200,200,42,205,205,205,36,206,206,206,31,206,206,206,26,206,206,206,21,210,210,210,17,216,216,216,13,204,204,204,10,219,219,219,7,204,204,204,5,191,191,191,4,255,255,255,2,255,255,255,1]),kt=[1,1,1,.25],At=.004,jt=.007,Mt=[1,1,1,1],Nt=[.5,.5,.5,.25],Pt={controllers:!0,lasers:!0,cursors:!0};var Ft=class extends b{constructor(){super(),this.renderOrder=h.ADDITIVE,this.state.cullFace=!1,this.state.blend=!0,this.state.blendFuncSrc=Dt.ONE,this.state.blendFuncDst=Dt.ONE,this.state.depthMask=!1,this.laser=this.defineSampler(`diffuse`),this.laser.texture=new He(Ot,48,1),this.laserColor=this.defineUniform(`laserColor`,kt)}get materialName(){return`INPUT_LASER`}get vertexSource(){return`
    in vec3 POSITION;
    in vec2 TEXCOORD_0;

    out vec2 vTexCoord;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vTexCoord = TEXCOORD_0;
      return proj * view * model * vec4(POSITION, 1.0);
    }`}get fragmentSource(){return`
    precision mediump float;

    uniform vec4 laserColor;
    uniform sampler2D diffuse;
    in vec2 vTexCoord;

    const float fadePoint = 0.5335;
    const float fadeEnd = 0.535;

    vec4 fragment_main() {
      vec2 uv = vTexCoord;
      float front_fade_factor = 1.0 - clamp(1.0 - (uv.y - fadePoint) / (1.0 - fadePoint), 0.0, 1.0);
      float back_fade_factor = clamp((uv.y - fadePoint) / (fadeEnd - fadePoint), 0.0, 1.0);
      vec4 color = laserColor * texture(diffuse, vTexCoord);
      float opacity = color.a * front_fade_factor * back_fade_factor;
      return vec4(color.rgb * opacity, opacity);
    }`}};let It=`
in vec4 POSITION;

out float vLuminance;
out float vOpacity;

vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
  vLuminance = POSITION.z;
  vOpacity = POSITION.w;

  // Billboarded, constant size vertex transform.
  vec4 screenPos = proj * view * model * vec4(0.0, 0.0, 0.0, 1.0);
  screenPos /= screenPos.w;
  screenPos.xy += POSITION.xy;
  return screenPos;
}`,Lt=`
precision mediump float;

uniform vec4 cursorColor;
in float vLuminance;
in float vOpacity;

vec4 fragment_main() {
  vec3 color = cursorColor.rgb * vLuminance;
  float opacity = cursorColor.a * vOpacity;
  return vec4(color * opacity, opacity);
}`;var Rt=class extends b{constructor(){super(),this.renderOrder=h.ADDITIVE,this.state.cullFace=!1,this.state.blend=!0,this.state.blendFuncSrc=Dt.ONE,this.state.depthMask=!1,this.cursorColor=this.defineUniform(`cursorColor`,Mt)}get materialName(){return`INPUT_CURSOR`}get vertexSource(){return It}get fragmentSource(){return Lt}},zt=class extends b{constructor(){super(),this.renderOrder=h.ADDITIVE,this.state.cullFace=!1,this.state.blend=!0,this.state.blendFuncSrc=Dt.ONE,this.state.depthFunc=Dt.GEQUAL,this.state.depthMask=!1,this.cursorColor=this.defineUniform(`cursorColor`,Nt)}get materialName(){return`INPUT_CURSOR_2`}get vertexSource(){return It}get fragmentSource(){return Lt}},Bt=class extends N{constructor(){super(),this._maxInputElements=32,this._controllers=null,this._lasers=null,this._cursors=null,this._activeControllers=0,this._activeLasers=0,this._activeCursors=0,this._blurred=!1}onRendererChanged(e){this._controllers=null,this._lasers=null,this._cursors=null,this._activeControllers=0,this._activeLasers=0,this._activeCursors=0}useProfileControllerMeshes(e){e.addEventListener(`inputsourceschange`,e=>{for(let t of e.added)t.targetRayMode==`tracked-pointer`&&Et(t,`https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles`).then(({profile:e,assetPath:n})=>{this.setControllerMesh(new St({url:n}),t.handedness,t.profiles[0])})}),e.addEventListener(`visibilitychange`,e=>{e.session.visibilityState===`visible-blurred`?this._blurred=!0:e.session.visibilityState===`visible`&&(this._blurred=!1)})}setControllerMesh(e,t=`right`,n=``){this._controllers||={},this._controllers[n+`_`+t]={nodes:[e],activeCount:0},e.visible=!1,this.addNode(e)}addController(e,t=`right`,n=``){if(!this._controllers||this._blurred)return;let r=this._controllers[n+`_`+t];if(!r)return;let i=null;r.activeCount<r.nodes.length?i=r.nodes[r.activeCount]:(i=r.nodes[0].clone(),this.addNode(i),r.nodes.push(i)),r.activeCount=(r.activeCount+1)%this._maxInputElements,i.matrix=e,i.visible=!0}hideController(e=`right`,t=``){this._controllers&&this._controllers[t+`_`+e]&&(controllerNode.visible=!0)}addLaserPointer(e){if(this._blurred)return;!this._lasers&&this._renderer&&(this._lasers=[this._createLaserMesh()],this.addNode(this._lasers[0]));let t=null;this._activeLasers<this._lasers.length?t=this._lasers[this._activeLasers]:(t=this._lasers[0].clone(),this.addNode(t),this._lasers.push(t)),this._activeLasers=(this._activeLasers+1)%this._maxInputElements,t.matrix=e.matrix,t.visible=!0}addCursor(e){if(this._blurred)return;!this._cursors&&this._renderer&&(this._cursors=[this._createCursorMesh()],this.addNode(this._cursors[0]));let t=null;this._activeCursors<this._cursors.length?t=this._cursors[this._activeCursors]:(t=this._cursors[0].clone(),this.addNode(t),this._cursors.push(t)),this._activeCursors=(this._activeCursors+1)%this._maxInputElements,t.translation=e,t.visible=!0}reset(e){if(e||=Pt,this._controllers&&e.controllers)for(let e in this._controllers){let t=this._controllers[e];t.activeCount=0;for(let e of t.nodes)e.visible=!1}if(this._lasers&&e.lasers){for(let e of this._lasers)e.visible=!1;this._activeLasers=0}if(this._cursors&&e.cursors){for(let e of this._cursors)e.visible=!1;this._activeCursors=0}}_createLaserMesh(){let e=this._renderer._gl,t=.005,n=[0,t,0,0,1,0,t,-1,0,0,0,-.005,0,1,1,0,-.005,-1,1,0,t,0,0,0,1,t,0,-1,0,0,-.005,0,0,1,1,-.005,0,-1,1,0,0,-.005,0,0,1,0,-.005,-1,0,0,0,t,0,1,1,0,t,-1,1,0,-.005,0,0,0,1,-.005,0,-1,0,0,t,0,0,1,1,t,0,-1,1,0],r=[0,1,2,1,3,2,4,5,6,5,7,6,8,9,10,9,11,10,12,13,14,13,15,14],i=this._renderer.createRenderBuffer(e.ARRAY_BUFFER,new Float32Array(n)),a=this._renderer.createRenderBuffer(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(r)),o=r.length,s=new lt([new F(`POSITION`,i,3,e.FLOAT,20,0),new F(`TEXCOORD_0`,i,2,e.FLOAT,20,12)],o);s.setIndexBuffer(a);let c=new Ft,l=this._renderer.createRenderPrimitive(s,c),u=new N;return u.addRenderPrimitive(l),u}_createCursorMesh(){let e=this._renderer._gl,t=[],n=[],r=2*Math.PI/16;for(let e=0;e<16;++e){let i=e*r,a=Math.cos(i),o=Math.sin(i);t.push(a*At,o*At,1,.9),e>1&&n.push(0,e-1,e)}for(let e=0;e<16;++e){let i=e*r,a=Math.cos(i),o=Math.sin(i);if(t.push(a*At,o*At,.5,.75),t.push(a*jt,o*jt,0,0),e>0){let t=16+e*2;n.push(t-2,t-1,t),n.push(t-1,t+1,t)}}n.push(46,47,16),n.push(47,17,16);let i=this._renderer.createRenderBuffer(e.ARRAY_BUFFER,new Float32Array(t)),a=this._renderer.createRenderBuffer(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(n)),o=n.length,s=new lt([new F(`POSITION`,i,4,e.FLOAT,16,0)],o);s.setIndexBuffer(a);let c=new Rt,l=new zt,u=this._renderer.createRenderPrimitive(s,c),d=this._renderer.createRenderPrimitive(s,l),f=new N;return f.addRenderPrimitive(u),f.addRenderPrimitive(d),f}},Vt=class extends b{get materialName(){return`SEVEN_SEGMENT_TEXT`}get vertexSource(){return`
    in vec2 POSITION;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      return proj * view * model * vec4(POSITION, 0.0, 1.0);
    }`}get fragmentSource(){return`
    precision mediump float;
    const vec4 fragColor = vec4(0.0, 1.0, 0.0, 1.0);

    vec4 fragment_main() {
      return fragColor;
    }`}},Ht=class extends N{constructor(){super(),this._text=``,this._charNodes=[]}onRendererChanged(e){this.clearNodes(),this._charNodes=[];let t=[],n={},r=[],i=.5,a=.25;function o(e,r,i,a,o){let s=t.length/2;t.push(r,i,a,i,a,o,r,o),n[e]=[s,s+2,s+1,s,s+3,s+2]}let s={};function c(e,t){let i={character:e,offset:r.length*2,count:0};for(let e=0;e<t.length;++e){let a=t[e],o=n[a];i.count+=o.length,r.push(...o)}s[e]=i}o(0,-1,1,i,.75),o(1,-1,a*.5,i,-.125),o(2,-1,-.75,i,-1),o(3,-1,1,-.75,-.125),o(4,.25,1,i,-.125),o(5,-1,a*.5,-.75,-1),o(6,.25,a*.5,i,-1),c(`0`,[0,2,3,4,5,6]),c(`1`,[4,6]),c(`2`,[0,1,2,4,5]),c(`3`,[0,1,2,4,6]),c(`4`,[1,3,4,6]),c(`5`,[0,1,2,3,6]),c(`6`,[0,1,2,3,5,6]),c(`7`,[0,4,6]),c(`8`,[0,1,2,3,4,5,6]),c(`9`,[0,1,2,3,4,6]),c(`A`,[0,1,3,4,5,6]),c(`B`,[1,2,3,5,6]),c(`C`,[0,2,3,5]),c(`D`,[1,2,4,5,6]),c(`E`,[0,1,2,4,6]),c(`F`,[0,1,3,5]),c(`P`,[0,1,3,4,5]),c(`-`,[1]),c(` `,[]),c(`_`,[2]);let l=e.gl,u=e.createRenderBuffer(l.ARRAY_BUFFER,new Float32Array(t)),d=e.createRenderBuffer(l.ELEMENT_ARRAY_BUFFER,new Uint16Array(r)),f=new lt([new F(`POSITION`,u,2,l.FLOAT,8,0)],r.length);f.setIndexBuffer(d);let p=new Vt;this._charPrimitives={};for(let t in s){let n=s[t];f.elementCount=n.count,f.indexByteOffset=n.offset,this._charPrimitives[t]=e.createRenderPrimitive(f,p)}this.text=this._text}get text(){return this._text}set text(e){this._text=e;let t=0,n=null;for(;t<e.length;++t)if(n=e[t]in this._charPrimitives?this._charPrimitives[e[t]]:this._charPrimitives._,this._charNodes.length<=t){let e=new N;e.addRenderPrimitive(n),e.translation=[t*2,0,0],this._charNodes.push(e),this.addNode(e)}else this._charNodes[t].clearRenderPrimitives(),this._charNodes[t].addRenderPrimitive(n),this._charNodes[t].visible=!0;for(;t<this._charNodes.length;++t)this._charNodes[t].visible=!1}},Ut=class extends b{get materialName(){return`STATS_VIEWER`}get vertexSource(){return`
    in vec3 POSITION;
    in vec3 COLOR_0;
    out vec4 vColor;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vColor = vec4(COLOR_0, 1.0);
      return proj * view * model * vec4(POSITION, 1.0);
    }`}get fragmentSource(){return`
    precision mediump float;
    in vec4 vColor;

    vec4 fragment_main() {
      return vColor;
    }`}};function I(e){return .9/30*e-.45}function L(e){return .7/90*Math.min(e,90)-.45}function Wt(e){return{r:Math.max(0,Math.min(1,1-e/60)),g:Math.max(0,Math.min(1,(e-15)/75)),b:Math.max(0,Math.min(1,(e-15)/75))}}let Gt=window.performance&&performance.now?performance.now.bind(performance):Date.now;var Kt=class extends N{constructor(){super(),this._performanceMonitoring=!1,this._startTime=Gt(),this._prevFrameTime=this._startTime,this._prevGraphUpdateTime=this._startTime,this._frames=0,this._fpsAverage=0,this._fpsMin=0,this._fpsStep=this._performanceMonitoring?1e3:250,this._lastSegment=0,this._fpsVertexBuffer=null,this._fpsRenderPrimitive=null,this._fpsNode=null,this._sevenSegmentNode=new Ht,this._sevenSegmentNode.matrix=new Float32Array([.075,0,0,0,0,.075,0,0,0,0,1,0,-.3625,.3625,.02,1])}onRendererChanged(e){this.clearNodes();let t=e.gl,n=[],r=[];for(let e=0;e<30;++e){n.push(I(e),L(0),.02,0,1,1),n.push(I(e+1),L(0),.02,0,1,1),n.push(I(e),L(0),.02,0,1,1),n.push(I(e+1),L(0),.02,0,1,1);let t=e*4;r.push(t,t+3,t+1,t+3,t,t+2)}function i(e,t,i,a,o,s,c,l){let u=n.length/6;n.push(e,t,o,s,c,l),n.push(i,a,o,s,c,l),n.push(e,a,o,s,c,l),n.push(i,t,o,s,c,l),r.push(u,u+1,u+2,u,u+3,u+1)}i(-.5,-.5,.5,.5,0,0,0,.125),i(-.45,-.45,.45,.25,.01,0,0,.4),i(-.45,L(30),.45,L(32),.015,.5,0,.5),i(-.45,L(60),.45,L(62),.015,.2,0,.75),this._fpsVertexBuffer=e.createRenderBuffer(t.ARRAY_BUFFER,new Float32Array(n),t.DYNAMIC_DRAW);let a=e.createRenderBuffer(t.ELEMENT_ARRAY_BUFFER,new Uint16Array(r)),o=new lt([new F(`POSITION`,this._fpsVertexBuffer,3,t.FLOAT,24,0),new F(`COLOR_0`,this._fpsVertexBuffer,3,t.FLOAT,24,12)],r.length);o.setIndexBuffer(a),o.setBounds([-.5,-.5,0],[.5,.5,.015]),this._fpsRenderPrimitive=e.createRenderPrimitive(o,new Ut),this._fpsNode=new N,this._fpsNode.addRenderPrimitive(this._fpsRenderPrimitive),this.addNode(this._fpsNode),this.addNode(this._sevenSegmentNode)}get performanceMonitoring(){return this._performanceMonitoring}set performanceMonitoring(e){this._performanceMonitoring=e,this._fpsStep=e?1e3:250}begin(){this._startTime=Gt()}end(){let e=Gt(),t=1e3/(e-this._prevFrameTime);if(this._prevFrameTime=e,this._fpsMin=this._frames?Math.min(this._fpsMin,t):t,this._frames++,e>this._prevGraphUpdateTime+this._fpsStep){let t=e-this._prevGraphUpdateTime;this._fpsAverage=Math.round(1e3/(t/this._frames)),this._updateGraph(this._fpsMin,this._fpsAverage),this._performanceMonitoring&&console.log(`Average FPS: ${this._fpsAverage} Min FPS: ${this._fpsMin}`),this._prevGraphUpdateTime=e,this._frames=0,this._fpsMin=0}}_updateGraph(e,t){let n=Wt(e),r=L(e-1),i=L(t+1),a=[I(this._lastSegment),i,.02,n.r,n.g,n.b,I(this._lastSegment+1),i,.02,n.r,n.g,n.b,I(this._lastSegment),r,.02,n.r,n.g,n.b,I(this._lastSegment+1),r,.02,n.r,n.g,n.b];n.r=.2,n.g=1,n.b=.2,this._lastSegment==29?(this._renderer.updateRenderBuffer(this._fpsVertexBuffer,new Float32Array(a),this._lastSegment*24*4),a=[I(0),L(90),.02,n.r,n.g,n.b,I(.25),L(90),.02,n.r,n.g,n.b,I(0),L(0),.02,n.r,n.g,n.b,I(.25),L(0),.02,n.r,n.g,n.b],this._renderer.updateRenderBuffer(this._fpsVertexBuffer,new Float32Array(a),0)):(a.push(I(this._lastSegment+1),L(90),.02,n.r,n.g,n.b,I(this._lastSegment+1.25),L(90),.02,n.r,n.g,n.b,I(this._lastSegment+1),L(0),.02,n.r,n.g,n.b,I(this._lastSegment+1.25),L(0),.02,n.r,n.g,n.b),this._renderer.updateRenderBuffer(this._fpsVertexBuffer,new Float32Array(a),this._lastSegment*24*4)),this._lastSegment=(this._lastSegment+1)%30,this._sevenSegmentNode.text=`${this._fpsAverage.toString().padEnd(3)}FP5`}},qt=class extends Qe{constructor(e,t,n,r){super(e?e.projectionMatrix:null,e?e.transform:null,n||(t&&e?t.getViewport(e):null),e?e.eye:`left`,r)}},Jt=class extends N{constructor(){super(),this._timestamp=-1,this._frameDelta=0,this._statsStanding=!1,this._stats=null,this._statsEnabled=!1,this.enableStats(!0),this._inputRenderer=null,this._resetInputEndFrame=!0,this._lastTimestamp=0,this._hoverFrame=0,this._hoveredNodes=[],this.clear=!0}setRenderer(e){this._setRenderer(e)}loseRenderer(){this._renderer&&(this._stats=null,this._renderer=null,this._inputRenderer=null)}get inputRenderer(){return this._inputRenderer||(this._inputRenderer=new Bt,this.addNode(this._inputRenderer)),this._inputRenderer}updateInputSources(e,t){let n=[],r=this._hoverFrame;this._hoverFrame++;for(let i of e.session.inputSources){let a=e.getPose(i.targetRaySpace,t);if(!a)continue;i.targetRayMode==`tracked-pointer`&&this.inputRenderer.addLaserPointer(a.transform);let o=this.hitTest(a.transform);if(o)this.inputRenderer.addCursor(o.intersection),o.node._hoverFrameId!=r&&o.node.onHoverStart(),o.node._hoverFrameId=this._hoverFrame,n.push(o.node);else{let e=new Ae(a.transform.matrix),t=ae(e.origin[0],e.origin[1],e.origin[2]);se(t,t,[e.direction[0]*1,e.direction[1]*1,e.direction[2]*1]),this.inputRenderer.addCursor(t)}if(i.gripSpace){let n=e.getPose(i.gripSpace,t);n&&this.inputRenderer.addController(n.transform.matrix,i.handedness,i.profiles[0])}}for(let e of this._hoveredNodes)e._hoverFrameId!=this._hoverFrame&&e.onHoverEnd();this._hoveredNodes=n}handleSelect(e,t,n){let r=t.getPose(e.targetRaySpace,n);r&&this.handleSelectPointer(r.transform)}handleSelectPointer(e){if(e){let t=this.hitTest(e);t&&t.node.handleSelect()}}enableStats(e){e!=this._statsEnabled&&(this._statsEnabled=e,e?(this._stats=new Kt,this._stats.selectable=!0,this.addNode(this._stats),this._statsStanding?this._stats.translation=[0,1.4,-.75]:this._stats.translation=[0,-.3,-.5],this._stats.scale=[.3,.3,.3],we(this._stats.rotation,-45,0,0)):e||(this._stats&&=(this.removeNode(this._stats),null)))}standingStats(e){this._statsStanding=e,this._stats&&(this._statsStanding?this._stats.translation=[0,1.4,-.75]:this._stats.translation=[0,-.3,-.5],this._stats.scale=[.3,.3,.3],we(this._stats.rotation,-45,0,0))}draw(e,t,n){let r=new Qe(e,t);n&&(r.eye=n),this.drawViewArray([r])}drawXRFrame(e,t,n,r){if(!this._renderer||!t)return;let i=this._renderer.gl,a=this._renderer,o=e.session,s=o.renderState.baseLayer,c=[];if(s){i.bindFramebuffer(i.FRAMEBUFFER,s.framebuffer);for(let e of t.views)c.push(new qt(e,s))}else{if(s=n||o.renderState.layers[0],i.bindFramebuffer(i.FRAMEBUFFER,a.xrFramebuffer),s.usingTextureArray??!1){var l=0;for(let e of t.views){let t=a.getXrBinding(o).getViewSubImage(s,e);i.framebufferTextureLayer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,t.colorTexture,0,l),i.framebufferTextureLayer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,t.depthStencilTexture,0,l),c=[new qt(e,t,t.viewport)],this.clear&&i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT),this.drawViewArray(c,r),++l}return}for(let e of t.views){let n=a.getXrBinding(o).getViewSubImage(s,e);e==t.views[0]&&(a.multisampledMultiview?a.multiviewExtension.framebufferTextureMultisampleMultiviewOVR(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,n.colorTexture,0,a.maxSamples,0,2):a.multiview?a.multiviewExtension.framebufferTextureMultiviewOVR(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,n.colorTexture,0,0,2):i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,n.colorTexture,0),n.depthStencilTexture&&(a.multisampledMultiview?a.multiviewExtension.framebufferTextureMultisampleMultiviewOVR(i.DRAW_FRAMEBUFFER,i.DEPTH_ATTACHMENT,n.depthStencilTexture,0,a.maxSamples,0,2):a.multiview?a.multiviewExtension.framebufferTextureMultiviewOVR(i.DRAW_FRAMEBUFFER,i.DEPTH_ATTACHMENT,n.depthStencilTexture,0,0,2):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,n.depthStencilTexture,0))),c.push(new qt(e,n,n.viewport))}}this.clear&&i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT),this.drawViewArray(c,r)}drawViewArray(e,t){this._renderer&&this._renderer.drawViews(e,this,t)}startFrame(){let e=this._timestamp;return this._timestamp=performance.now(),this._stats&&this._stats.begin(),this._frameDelta=e>=0?this._timestamp-e:0,this._update(this._timestamp,this._frameDelta),this._frameDelta}endFrame(){this._inputRenderer&&this._resetInputEndFrame&&this._inputRenderer.reset(),this._stats&&this._stats.end()}onLoadScene(e){return Promise.resolve()}},Yt=class{constructor(){this.reset()}reset(){this.worldMatrix=null,this.matrix=null,this.pending=!1,this.scanning=!1,this.repositioning=!1,this.generation=(this.generation||0)+1}beginReposition(){return this.worldMatrix?(this.repositioning=!0,this.scanning=!0,this.pending=!1,!0):!1}cancelReposition(){this.repositioning=!1,this.scanning=!1,this.pending=!1}request(){(!this.worldMatrix||this.repositioning)&&(this.pending=!0)}cancelPending(){this.pending=!1}resolve(e,t){let n=this.pending;if(this.pending=!1,!n||this.worldMatrix&&!this.repositioning||!e||!t||e.length!==16||!Array.from(e).every(Number.isFinite))return!1;let r=[e[12],e[13],e[14]];if(![t.x,t.y,t.z].every(Number.isFinite))return!1;this.worldMatrix=new Float32Array(e);let i=w();return A(i,Math.atan2(t.x-r[0],t.z-r[2])+Math.PI),i[12]=r[0],i[13]=r[1]+.7,i[14]=r[2],this.matrix=i,this.scanning=!1,this.repositioning=!1,!0}};function Xt(e,t){return Array.from(e?.enabledFeatures||[]).includes(t)}function Zt(e,t,n,r){if(!Xt(e,`camera-access`))return{texture:null,status:`camera-access not granted; virtual-only diagnostic`};if(!n?.getCameraImage)return{texture:null,status:`getCameraImage unavailable; virtual-only diagnostic`};try{let e=t?.camera;if(!e)return{texture:null,status:`XRView.camera is null; virtual-only diagnostic`};let i=n.getCameraImage(e);return!i||!r.isTexture(i)||!(e.width>0&&e.height>0)?{texture:null,status:`No valid camera texture; virtual-only diagnostic`}:{texture:i,width:e.width,height:e.height,granted:!0,status:`Live camera texture ${e.width} × ${e.height}; phone alignment unverified`}}catch(e){return{texture:null,status:`Camera unavailable (${e.name}); virtual-only diagnostic`}}}function Qt(e,t,n){if(!Xt(e,`depth-sensing`))return`Depth not granted; occlusion not implemented`;try{let e=(t.getDepthInformation?.(n))?.getDepthInMeters?.(.5,.5);return Number.isFinite(e)&&e>0?`CPU depth sample ${e.toFixed(2)} m; occlusion not implemented`:`Depth granted, no valid CPU sample; occlusion not implemented`}catch(e){return`Depth unavailable (${e.name}); occlusion not implemented`}}function $t(e,t,n){return{requiredFeatures:[`local`,`hit-test`],optionalFeatures:[`dom-overlay`,...e?[`camera-access`]:[],...t?[`depth-sensing`]:[]],domOverlay:{root:n},...t?{depthSensing:{usagePreference:[`cpu-optimized`],dataFormatPreference:[`float32`,`luminance-alpha`]}}:{}}}let en={translation:.08,rotation:4};function tn(e,t){if(!e||!t)return{usable:!1,distance:1/0,degrees:180};let n=Math.hypot(t[12]-e[12],t[13]-e[13],t[14]-e[14]),r=0;for(let n of[0,1,2,4,5,6,8,9,10])r+=e[n]*t[n];let i=Math.acos(Math.max(-1,Math.min(1,(r-1)/2)))*180/Math.PI;return{usable:Number.isFinite(n)&&Number.isFinite(i)&&n<=en.translation&&i<=en.rotation,distance:n,degrees:i}}function nn(e,t){let n=tn(e,t),r=!!e&&!!t&&Number.isFinite(n.distance)&&Number.isFinite(n.degrees);return{...n,usable:r,translationWarning:r&&n.distance>.02,largeTranslation:r&&n.distance>.08,warning:r&&n.distance>.02?n.distance>.08?`PARALLAX WARNING`:`POSITION SHIFT — parallax possible`:``}}var rn=class{constructor(e){this.gl=e,this.snapshot=null,this.captures=0,this.views=[],this.bytes=0,this.wallVersion=0,this.plan=null;let t=(t,n)=>{let r=e.createProgram();for(let[i,a]of[[e.VERTEX_SHADER,t],[e.FRAGMENT_SHADER,n]]){let t=e.createShader(i);if(e.shaderSource(t,a),e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(t));e.attachShader(r,t),e.deleteShader(t)}if(e.bindAttribLocation(r,0,`a`),e.bindAttribLocation(r,1,`n`),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw Error(e.getProgramInfoLog(r));return r};this.copy=t(`attribute vec3 a;varying vec2 uv;void main(){uv=a.xy*.5+.5;gl_Position=vec4(a.xy,0.,1.);}`,`precision highp float;varying vec2 uv;uniform sampler2D image;void main(){gl_FragColor=vec4(texture2D(image,uv).rgb,1.);}`),this.program=t(`attribute vec3 a;attribute vec3 n;uniform mat4 projection,view,model,capturePV;uniform float radius,height;varying vec4 captured;varying vec3 wp,wn;void main(){vec4 world=model*vec4(a.x*radius,a.y*height,a.z*radius,1.);wp=world.xyz;wn=normalize((model*vec4(n,0.)).xyz);captured=capturePV*world;gl_Position=projection*view*world;}`,`precision highp float;varying vec4 captured;varying vec3 wp,wn;uniform sampler2D image;uniform float debug;uniform vec3 guideColor,capturePosition,currentPosition;void main(){if(debug>.5){gl_FragColor=vec4(guideColor,1.);return;}if(dot(capturePosition-wp,wn)<=.001||dot(currentPosition-wp,wn)<=.001)discard;if(captured.w<=.000001)discard;vec3 p=captured.xyz/captured.w;if(any(lessThan(p,vec3(-1.)))||any(greaterThan(p,vec3(1.))))discard;gl_FragColor=vec4(texture2D(image,p.xy*.5+.5).rgb,1.);}`),this.u=Object.fromEntries([`projection`,`view`,`model`,`capturePV`,`radius`,`height`,`debug`,`image`,`guideColor`,`capturePosition`,`currentPosition`].map(t=>[t,e.getUniformLocation(this.program,t)])),this.copySampler=e.getUniformLocation(this.copy,`image`);let r=e.getParameter(e.ARRAY_BUFFER_BINDING);this.copyBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.copyBuffer),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),e.STATIC_DRAW),this.mesh=n(),this.arcBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.arcBuffer),e.bufferData(e.ARRAY_BUFFER,this.mesh.data,e.STATIC_DRAW),this.guides=u(),this.guideBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this.guideBuffer),e.bufferData(e.ARRAY_BUFFER,this.guides.data,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,r),this.vao=e.createVertexArray();let i=e.getParameter(e.TEXTURE_BINDING_2D);this.fallback=e.createTexture(),e.bindTexture(e.TEXTURE_2D,this.fallback),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.bindTexture(e.TEXTURE_2D,i)}withState(e){let t=this.gl,n=[t.DEPTH_TEST,t.BLEND,t.CULL_FACE,t.SCISSOR_TEST,t.STENCIL_TEST],r={program:t.getParameter(t.CURRENT_PROGRAM),buffer:t.getParameter(t.ARRAY_BUFFER_BINDING),vao:t.getParameter(t.VERTEX_ARRAY_BINDING),draw:t.getParameter(t.DRAW_FRAMEBUFFER_BINDING),read:t.getParameter(t.READ_FRAMEBUFFER_BINDING),viewport:t.getParameter(t.VIEWPORT),active:t.getParameter(t.ACTIVE_TEXTURE),depth:t.getParameter(t.DEPTH_WRITEMASK),color:t.getParameter(t.COLOR_WRITEMASK),flags:n.map(e=>t.isEnabled(e))};t.activeTexture(t.TEXTURE0),r.texture=t.getParameter(t.TEXTURE_BINDING_2D);try{return n.forEach(e=>t.disable(e)),t.depthMask(!1),t.colorMask(!0,!0,!0,!0),t.bindVertexArray(this.vao),e()}finally{t.bindTexture(t.TEXTURE_2D,r.texture),t.activeTexture(r.active),t.useProgram(r.program),t.bindVertexArray(r.vao),t.bindBuffer(t.ARRAY_BUFFER,r.buffer),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,r.draw),t.bindFramebuffer(t.READ_FRAMEBUFFER,r.read),t.viewport(...r.viewport),t.depthMask(r.depth),t.colorMask(...r.color),n.forEach((e,n)=>r.flags[n]?t.enable(e):t.disable(e))}}bind(e){let t=this.gl;t.bindBuffer(t.ARRAY_BUFFER,e),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,3,t.FLOAT,!1,0,0),t.disableVertexAttribArray(1),t.vertexAttrib3f(1,0,0,1)}clear(){for(let e of this.views)this.gl.deleteTexture(e.texture),this.gl.deleteFramebuffer(e.framebuffer);this.views=[],this.snapshot=null,this.bytes=0,this.plan=null,this.wallVersion++}choose(e,t,n,r){return this.plan=l(this.views,e,t,n,r,this.snapshot?.id,this.wallVersion),this.snapshot=this.plan.primary||this.views.at(-1)||null,this.plan}capture({texture:e,width:t,height:n,projection:r,viewInverse:i,cameraGranted:a=!1,model:o,radius:s=1.2,wallHeight:l=2}){let u=this.gl;if(!a||!e||e===this.fallback||!u.isTexture(e)||t<16||n<16)throw Error(`Capture requires a granted, valid current raw camera image; no diagnostic substitute`);if(!r||!i||!o)throw Error(`Capture pose/projection or wall transform unavailable`);if(this.views.length>=6)throw Error(`Six views already stored. Clear views to start a new set; existing views retained.`);let d=w(),f=w();if(k(d,r,i),!O(f,i))throw Error(`Invalid capture pose`);if(!c([{capturePV:d,world:f}],o,s,l,f).some(e=>e.usable>0))throw Error(`No exterior panel in this view. Walk outside the left, back or right wall and aim at its outer face; previous photos kept.`);let p=Math.min(1,1024/Math.max(t,n)),m=Math.max(1,Math.round(t*p)),h=Math.max(1,Math.round(n*p)),g=null,_=null;if(this.bytes+m*h*4>16777216)throw Error(`16 MiB image limit reached; existing views retained. Clear views to start a new set.`);try{this.withState(()=>{if(g=u.createTexture(),u.bindTexture(u.TEXTURE_2D,g),u.texImage2D(u.TEXTURE_2D,0,u.RGBA,m,h,0,u.RGBA,u.UNSIGNED_BYTE,null),u.texParameteri(u.TEXTURE_2D,u.TEXTURE_MIN_FILTER,u.LINEAR),u.texParameteri(u.TEXTURE_2D,u.TEXTURE_MAG_FILTER,u.LINEAR),u.texParameteri(u.TEXTURE_2D,u.TEXTURE_WRAP_S,u.CLAMP_TO_EDGE),u.texParameteri(u.TEXTURE_2D,u.TEXTURE_WRAP_T,u.CLAMP_TO_EDGE),_=u.createFramebuffer(),u.bindFramebuffer(u.FRAMEBUFFER,_),u.framebufferTexture2D(u.FRAMEBUFFER,u.COLOR_ATTACHMENT0,u.TEXTURE_2D,g,0),u.checkFramebufferStatus(u.FRAMEBUFFER)!==u.FRAMEBUFFER_COMPLETE)throw Error(`Capture framebuffer incomplete`);u.viewport(0,0,m,h),u.useProgram(this.copy),this.bind(this.copyBuffer),u.bindTexture(u.TEXTURE_2D,e),u.uniform1i(this.copySampler,0),u.drawArrays(u.TRIANGLE_FAN,0,4);let t=0,n=/* @__PURE__ */ new Uint8Array(4);for(let e of[.2,.5,.8])for(let r of[.2,.5,.8])u.readPixels(Math.floor(e*(m-1)),Math.floor(r*(h-1)),1,1,u.RGBA,u.UNSIGNED_BYTE,n),t=Math.max(t,n[0],n[1],n[2]);if(u.getError()!==u.NO_ERROR)throw Error(`Camera copy or pixel validation failed`);if(t<=2)throw Error(`Camera copy appears blank/black; capture not accepted`)});let a=w(),c=w();if(k(a,r,i),!O(c,i))throw Error(`Invalid capture pose`);let d={texture:g,framebuffer:_,width:m,height:h,rawWidth:t,rawHeight:n,projection:new Float32Array(r),viewInverse:new Float32Array(i),capturePV:a,world:c,at:Date.now(),id:++this.captures,wallVersion:this.wallVersion,model:new Float32Array(o),radius:s,height:l,bytes:m*h*4};return this.views.push(d),this.bytes+=d.bytes,this.snapshot=d,this.plan=null,d}catch(e){throw g&&u.deleteTexture(g),_&&u.deleteFramebuffer(_),e}}draw({projection:e,view:t,model:n,radius:r=1.2,height:i=2,effect:a=!0,debug:o=!0,viewport:s,aligned:c=!1,currentWorld:l=null}){if(!n||!a||!l&&(l=w(),!O(l,t)))return{imageSubmitted:!1,selected:null};let u=this.gl,d=this.u,f=this.choose(l,n,r,i),p=0;return this.withState(()=>{if(u.viewport(s.x,s.y,s.width,s.height),u.useProgram(this.program),this.bind(this.arcBuffer),u.vertexAttribPointer(0,3,u.FLOAT,!1,24,0),u.enableVertexAttribArray(1),u.vertexAttribPointer(1,3,u.FLOAT,!1,24,12),u.uniformMatrix4fv(d.projection,!1,e),u.uniformMatrix4fv(d.view,!1,t),u.uniformMatrix4fv(d.model,!1,n),u.uniform1f(d.radius,r),u.uniform1f(d.height,i),u.uniform1i(d.image,0),u.uniform3f(d.currentPosition,l[12],l[13],l[14]),c)for(let e of f.order)u.uniformMatrix4fv(d.capturePV,!1,e.capturePV),u.uniform3f(d.capturePosition,e.world[12],e.world[13],e.world[14]),u.uniform1f(d.debug,0),u.bindTexture(u.TEXTURE_2D,e.texture),u.drawArrays(u.TRIANGLES,0,this.mesh.stripCount),p++;if(o){this.bind(this.guideBuffer),u.bindTexture(u.TEXTURE_2D,this.fallback),u.uniformMatrix4fv(d.capturePV,!1,w()),u.uniform1f(d.debug,1);for(let e of f.coverage){let t=e.currentUsable;u.uniform3f(d.guideColor,t?.25:1,t?1:.62,t?.65:.15);let n=this.guides.ranges[e.sector];u.drawArrays(u.LINE_LOOP,n.first,n.count)}}}),{imageSubmitted:p>0,selected:f.primary?.id||null,passes:p,recordedSectors:f.recordedSectors,usableSectors:f.usableSectors}}};let R=e=>document.querySelector(e),z=new Yt,an=null,on=!1,B={effect:!0,radius:1.2,height:2,debug:!0},V,H,sn,U,W,G=null,cn=null,ln=null,un=null,K=!1,dn=!1,q=!1,fn=-1/0,pn=0,J=!1,Y=`No views stored — Add view retains each photo`,mn=0,hn=``;function gn(e){let t=d(e),n=R(`#mask-status`);n.textContent=t.text,n.dataset.state=t.kind,X.mask=t.text}let X={build:`invisibility-wall-008e`,tracking:`Desktop preview`,camera:`No XR session; preview is virtual-only`,depth:`No sample; real-depth occlusion not implemented`},Z=e=>R(`#status`).textContent=e;function _n(){R(`#diagnostics`).textContent=Object.entries(X).map(([e,t])=>`${e}: ${t}`).join(`
`)}function vn(){R(`#start`).disabled=R(`#basic`).disabled=!K||!dn||q||!!G}function yn(){R(`#scan`).textContent=z.repositioning?`Cancel reposition`:z.worldMatrix?`Reposition`:z.scanning?`Finish scan`:`Scan surface`,R(`#scan`).classList.toggle(`can-reposition`,!!z.worldMatrix),R(`#scan`).setAttribute(`aria-pressed`,String(z.repositioning))}function Q(){yn(),R(`#capture-status`).textContent=Y;let e=U?.views.length||0;R(`#view-count`).textContent=e+`/6 views · `+((U?.bytes||0)/1048576).toFixed(1)+`/16 MiB`;let t=U?.plan?.coverage||Array.from({length:9},(e,t)=>({sector:t,covered:!1,currentUsable:!1}));R(`#coverage`).replaceChildren(...t.map(e=>{let t=document.createElement(`span`);return t.textContent=String(e.sector+1),t.className=e.currentUsable?`usable`:e.covered?`recorded`:`missing`,t.title=`Sector `+(e.sector+1)+(e.currentUsable?` usable from stored views`:e.covered?` recorded; current view not compatible`:` needs more capture coverage`),t})),R(`#coverage-label`).textContent=(U?.plan?.recordedSectors||0)+`/9 sampled sectors recorded · `+(U?.plan?.usableSectors||0)+`/9 currently usable`,R(`#wall-coverage`).textContent=[`Left`,`Back`,`Right`].map((e,n)=>e+`: `+t.slice(n*3,n*3+3).filter(e=>e.covered).length+`/3 sectors recorded`).join(` · `);for(let e of[`capture`,`recapture`])R(`#`+e).disabled=!1,R(`#`+e).setAttribute(`aria-busy`,String(J));X.captureTaps=mn}function $(e=`No capture stored`){U?.clear(),J=!1,Y=e,Q()}function bn(){on=!1,R(`#session-state`).textContent=G?`Waiting for tracking — aim at the floor circle.`:`Enter AR, then tap the floor circle to place.`,gn({active:!!G,tracking:!0,placed:!1}),z.reset(),W&&(W.visible=!1),R(`#scan`).textContent=`Scan surface`,$(),Z(G?`Move slowly over a surface, then tap its circle.`:`Desktop outline only. Enter AR to place and capture.`)}function xn(e){an?.show(e)}function Sn(){an=new e,R(`#controls-toggle`).onclick=()=>{let e=R(`#panel`).classList.toggle(`compact`);R(`#controls-toggle`).textContent=e?`More settings`:`Less settings`,R(`#controls-toggle`).setAttribute(`aria-expanded`,String(!e))},R(`#effect`).onclick=()=>{B.effect=!B.effect,R(`#effect`).textContent=B.effect?`Wall on`:`Wall off`,R(`#effect`).setAttribute(`aria-pressed`,String(B.effect))};for(let e of[`radius`,`height`])R(`#`+e).oninput=t=>{B[e]=Number(t.target.value),R(`#`+e+`-value`).textContent=B[e].toFixed(1)+` m`,$(`Wall resized. Capture the empty background again.`)};R(`#debug`).onchange=e=>B.debug=e.target.checked,R(`#reset`).onclick=bn;let t=()=>{let e=++mn;J=!1,G?z.matrix?z.repositioning?Y=`Finish or cancel reposition before Add photo. Existing wall and photos kept.`:U?(J=!0,Y=`Capture tap `+e+` received — checking the next current raw camera frame…`):Y=`Capture tap `+e+` received — capture renderer unavailable: `+hn:Y=`Capture tap `+e+` received — tap the surface circle to place the wall first.`:Y=`Capture tap `+e+` received — enter AR first.`,Z(Y),Q();let t=R(`#mask-status`);t.textContent=Y,t.dataset.state=J?`requested`:`unavailable`,J&&setTimeout(()=>{J&&mn===e&&(J=!1,Y=`Capture tap `+e+` timed out — no current XR camera frame reached the handler.`,Q(),Z(Y),t.textContent=Y,t.dataset.state=`error`)},2500)};R(`#capture`).onclick=t,R(`#recapture`).onclick=()=>{$(`All views cleared. Walk around the empty wall and add views.`),Z(Y)},R(`#scan`).onclick=()=>{G?(J=!1,z.repositioning?(z.cancelReposition(),W.visible=!1,Z(`Reposition cancelled. Wall and photos kept.`)):z.worldMatrix?(z.beginReposition(),Z(`Aim at a new surface circle and tap to move. Current wall and photos stay until confirmed.`)):(z.scanning=!z.scanning,Z(`Aim at the floor circle, then tap to place.`)),yn()):Z(`Reposition requires AR.`)},R(`#start`).onclick=()=>En(!1),R(`#basic`).onclick=()=>En(!0),R(`#exit`).onclick=()=>G?.end().catch(e=>Z(`Exit failed: `+e.message)),R(`#panel`).addEventListener(`beforexrselect`,e=>e.preventDefault())}async function Cn(){if(Sn(),V=Ze({xrCompatible:!0,alpha:!0}),!V)throw Error(`WebGL unavailable`);V.canvas.width=720,V.canvas.height=360,V.canvas.setAttribute(`aria-label`,`Generated virtual perspective preview`),R(`#preview`).append(V.canvas),sn=new ct(V),H=new Jt,H.enableStats(!1),H.clear=!1,H.setRenderer(sn);try{U=new rn(V)}catch(e){U=null,hn=e.message,X.capture=`Capture renderer unavailable: `+e.message}W=new St({url:`media/gltf/reticle/reticle.gltf`}),W.visible=!1,H.addNode(W),await W.waitForComplete(),V.canvas.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),K=!1,vn(),Z(`Graphics context lost. Reload the experiment after exiting AR.`),G?.end().catch(()=>{})}),V.canvas.addEventListener(`pointermove`,e=>{e.buttons&&(e.offsetX/V.canvas.clientWidth-.5)*2.8}),K=!0;try{dn=!!navigator.xr&&await navigator.xr.isSessionSupported(`immersive-ar`)}catch(e){X.xr=e.name}if(R(`#support`).textContent=dn?`Immersive AR can be requested. Camera, depth and physical tracking remain unverified.`:`Immersive AR unavailable in this browser. The virtual-only preview remains usable.`,R(`#startup`).textContent=`Ready · wall-008e · phone verification pending`,vn(),bn(),_n(),/Android/i.test(navigator.userAgent)){let e=new URL(location.href);R(`#chrome`).href=`intent://${e.host}${e.pathname}${e.search}#Intent;scheme=${e.protocol.slice(0,-1)};package=com.android.chrome;end`,R(`#chrome`).hidden=!1}requestAnimationFrame(Tn)}function wn(){if(!z.matrix)return null;let e=new Float32Array(z.matrix);return e[13]=z.worldMatrix[13]+B.height/2,e}function Tn(){if(requestAnimationFrame(Tn),G||q||!K)return;let e=w(),t=w();te(e,Math.PI/3,2,.05,30),ne(t,[0,.3,3],[0,0,0],[0,1,0]),V.bindFramebuffer(V.FRAMEBUFFER,null),V.viewport(0,0,720,360),V.clearColor(.04,.09,.12,1),V.clear(V.COLOR_BUFFER_BIT|V.DEPTH_BUFFER_BIT),U?.draw({projection:e,view:t,model:w(),...B,aligned:!1,viewport:{x:0,y:0,width:720,height:360}})}async function En(e){if(q||G||!K)return;q=!0,vn();let t=++pn,n=null;Z(`Requesting AR…`);try{if(n=await navigator.xr.requestSession(`immersive-ar`,$t(!e&&R(`#camera-request`).checked,!e&&R(`#depth-request`).checked,R(`#overlay`))),t!==pn){await n.end();return}G=n,G.addEventListener(`end`,()=>Dn(n),{once:!0}),G.addEventListener(`visibilitychange`,()=>{z.cancelPending(),J&&(Y=`Capture cancelled: session visibility changed`),J=!1,W.visible=!1,X.tracking=n.visibilityState,Q(),_n()}),G.updateRenderState({baseLayer:new XRWebGLLayer(G,V)}),X.compositor=G.environmentBlendMode||`not reported`;let r=V.getContextAttributes();X.context=`alpha=`+r.alpha+` / premultipliedAlpha=`+r.premultipliedAlpha;let i=await G.requestReferenceSpace(`local`);if(G!==n)return;cn=i,cn.addEventListener?.(`reset`,()=>{bn(),Z(`Reference space reset. Place the window again.`)});let a=await G.requestReferenceSpace(`viewer`);if(G!==n)return;let o=await G.requestHitTestSource({space:a});if(G!==n){o.cancel();return}ln=o;try{un=typeof XRWebGLBinding==`function`?new XRWebGLBinding(G,V):null}catch(e){un=null,X.binding=e.name}G.addEventListener(`select`,()=>z.request()),bn(),document.body.classList.add(`xr`),xn(!0),R(`#panel`).classList.add(`compact`),R(`#controls-toggle`).textContent=`More settings`,R(`#controls-toggle`).setAttribute(`aria-expanded`,`false`),X.features=Array.from(G.enabledFeatures||[]).join(`, `)||`No enabledFeatures list: camera gate closed`,X.overlay=G.domOverlayState?.type||`Unavailable; use browser/system exit gesture`,X.entry=e?`Basic AR without camera/depth request`:`Optional features requested; availability checked each frame`,G.requestAnimationFrame(On)}catch(e){n&&G===n&&await n.end().catch(()=>{}),Z(`AR could not start (${e.name}): ${e.message}. Use AR without camera/depth for an explicit basic entry.`),X.start=e.name,_n()}finally{q=!1,vn()}}function Dn(e){if(e===G){$(),++pn;try{ln?.cancel()}catch{}ln=null,G=null,cn=null,un=null,z.reset(),W.visible=!1,document.body.classList.remove(`xr`),xn(!0),R(`#scan`).textContent=`Scan surface`,X={build:`invisibility-wall-008e`,tracking:`Session ended; fresh placement required on re-entry`,camera:`No current camera frame`,depth:`No sample; real-depth occlusion not implemented`},Z(`AR ended. START AR to enter again.`),gn({active:!1}),vn(),_n(),Q()}}function On(e,t){let n=t.session;if(n!==G)return;n.requestAnimationFrame(On);let r=n.renderState.baseLayer;V.bindFramebuffer(V.FRAMEBUFFER,r.framebuffer),V.clearColor(0,0,0,0),V.clear(V.COLOR_BUFFER_BIT|V.DEPTH_BUFFER_BIT),W.visible=!1;let i=null;try{n.visibilityState===`visible`&&(i=t.getViewerPose(cn))}catch(e){X.pose=e.name}if(!i){on=!1,R(`#session-state`).textContent=`Tracking paused — hold still; captures kept. Wait for tracking before capture.`,gn({active:!0,tracking:!1}),J&&(Y=`Capture cancelled: no current tracked camera frame`,Q()),J=!1,z.cancelPending(),X.tracking=`Pose unavailable/paused; effect hidden`,X.camera=`No current view; no stale texture reused`,X.depth=`No current depth sample`,e-fn>250&&(_n(),fn=e);return}on=!0,R(`#session-state`).textContent=z.matrix?`Tracking available — add a clean-background view.`:`Aim at the floor circle, then tap to place.`,X.tracking=i.emulatedPosition?`Emulated viewer position; phone unverified`:`Viewer pose available; phone stability unverified`;let a=null;if(ln&&(!z.worldMatrix||z.scanning))try{let e=t.getHitTestResults(ln)[0]?.getPose(cn);e&&(a=new Float32Array(e.transform.matrix),W.matrix=a,W.visible=!0)}catch(e){X.hit=e.name}let o=z.repositioning,s=z.matrix?new Float32Array(z.matrix):null;z.resolve(a,i.transform.position)&&(W.visible=!1,o&&s&&s.some((e,t)=>Math.abs(e-z.matrix[t])>1e-4)?($(`Wall moved. Previous photos cleared because their wall position changed. Add new empty-background photos.`),Z(Y)):Z(o?`Same wall position confirmed. Photos kept.`:`Square placed. Walk outside a side/back wall, aim at its exterior face, then Add photo.`),yn(),Q()),H.startFrame(),H.drawXRFrame(t,i),H.endFrame();let c=null;for(let[e,a]of i.views.entries()){let o=Zt(n,a,un,V);if(X.camera=o.status,X.depth=Qt(n,t,a),e===0&&J){J=!1;try{if(!U)throw Error(`Capture renderer unavailable`);if(i.views.length!==1)throw Error(`Capture supports single-view phone AR only`);if(!o.texture)throw Error(o.status);if(!z.matrix)throw Error(`Place wall first`);let e=U.capture({texture:o.texture,width:o.width,height:o.height,projection:a.projectionMatrix,viewInverse:a.transform.inverse.matrix,cameraGranted:o.granted,model:wn(),radius:B.radius,wallHeight:B.height});Y=`Added view `+U.views.length+`/6 · `+e.width+` × `+e.height+` · memory only`}catch(e){Y=`View not added: `+e.message+` · `+(U?.views.length||0)+` existing views kept`}Z(Y),Q()}let s=w();O(s,a.transform.inverse.matrix),U?.choose(s,wn()||w(),B.radius,B.height),c=nn(U?.snapshot?.world,s),X.alignment=U?.snapshot?(c.usable?`Projection enabled`:`Invalid pose`)+` · moved `+(c.distance*100).toFixed(1)+` cm / rotated `+c.degrees.toFixed(1)+`° (rotation is not a cutoff)`+(c.warning?` · `+c.warning:``):`No capture pose`,X.capture=U?.views.length?U.views.length+` retained views · primary `+(U.plan?.primary?.id||`none`)+` · `+(U.bytes/1048576).toFixed(1)+` MiB; nearest compatible capture per pixel`:`No stored views`;try{let e=U?.draw({projection:a.projectionMatrix,view:a.transform.inverse.matrix,model:wn(),...B,aligned:c.usable,viewport:r.getViewport(a),currentWorld:s}),t=V.getError();X.draw=`submitted=`+!!e?.imageSubmitted+` / GL error=`+t,gn({active:!0,tracking:!0,moduleReady:!!U,moduleError:hn,placed:!!z.matrix,captured:!!U?.snapshot,effect:B.effect,camera:!!o.texture,aligned:c.usable,submitted:!!e?.imageSubmitted,error:t,warning:c.warning,reason:U?.views.length&&!e?.imageSubmitted?`No compatible captured coverage here — add a clean-background view`:U?.snapshot?(c.distance*100).toFixed(1)+` cm / `+c.degrees.toFixed(1)+`°; translation can cause parallax`:o.status})}catch(e){B.effect=!1,X.effect=`Wall disabled: `+e.message,gn({active:!0,tracking:!0,placed:!0,captured:!0,effect:!0,camera:!0,aligned:!0,error:e.message})}}X.visual=B.effect?U?.snapshot?c?.usable?`Captured image projects onto flat panels; invalid capture UVs stay transparent. `+(c.warning||`Rotation allowed; no new-view reconstruction.`):`Current pose invalid; mask hidden`:`Outline only — no capture image`:`Wall off: normal camera view`,e-fn>250&&(_n(),fn=e,Q())}window.addEventListener(`pagehide`,()=>{$(),z.cancelPending(),G?.end().catch(()=>{})}),new URLSearchParams(location.search).has(`test`)&&(window.__WALL={get state(){return{ready:K,supported:dn,starting:q,active:!!G,matrix:z.matrix?Array.from(z.matrix):null,world:z.worldMatrix?Array.from(z.worldMatrix):null,settings:{...B},diagnostics:{...X},captured:!!U?.views.length,viewCount:U?.views.length||0,memoryBytes:U?.bytes||0,wallVersion:U?.wallVersion||0,selectedView:U?.plan?.primary?.id||null,coverage:U?.plan?.coverage||[],captureRequested:J,captureMessage:Y,captureRequestCount:mn,captureModuleError:hn,trackingNow:on,repositioning:z.repositioning,scanning:z.scanning,pending:z.pending,glError:V?.getError()}},get gl(){return V},get wall(){return U},reset:bn}),Cn().catch(e=>{Z(`Startup failed: `+e.message),R(`#startup`).textContent=`AR code could not initialize: `+e.message,vn()})})();