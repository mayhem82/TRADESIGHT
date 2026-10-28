(function(){let e=typeof Float32Array<`u`?Float32Array:Array;function t(){let t=new e(9);return e!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[5]=0,t[6]=0,t[7]=0),t[0]=1,t[4]=1,t[8]=1,t}function n(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[4],e[4]=t[5],e[5]=t[6],e[6]=t[8],e[7]=t[9],e[8]=t[10],e}function r(){let t=new e(16);return e!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function i(t){let n=new e(16);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n[8]=t[8],n[9]=t[9],n[10]=t[10],n[11]=t[11],n[12]=t[12],n[13]=t[13],n[14]=t[14],n[15]=t[15],n}function a(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e}function o(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function s(e,t){let n=t[0],r=t[1],i=t[2],a=t[3],o=t[4],s=t[5],c=t[6],l=t[7],u=t[8],d=t[9],f=t[10],p=t[11],m=t[12],h=t[13],g=t[14],_=t[15],v=n*s-r*o,y=n*c-i*o,b=n*l-a*o,x=r*c-i*s,S=r*l-a*s,C=i*l-a*c,w=u*h-d*m,T=u*g-f*m,E=u*_-p*m,D=d*g-f*h,O=d*_-p*h,ee=f*_-p*g,k=v*ee-y*O+b*D+x*E-S*T+C*w;return k?(k=1/k,e[0]=(s*ee-c*O+l*D)*k,e[1]=(i*O-r*ee-a*D)*k,e[2]=(h*C-g*S+_*x)*k,e[3]=(f*S-d*C-p*x)*k,e[4]=(c*E-o*ee-l*T)*k,e[5]=(n*ee-i*E+a*T)*k,e[6]=(g*b-m*C-_*y)*k,e[7]=(u*C-f*b+p*y)*k,e[8]=(o*O-s*E+l*w)*k,e[9]=(r*E-n*O-a*w)*k,e[10]=(m*S-h*b+_*v)*k,e[11]=(d*b-u*S-p*v)*k,e[12]=(s*T-o*D-c*w)*k,e[13]=(n*D-r*T+i*w)*k,e[14]=(h*y-m*x-g*v)*k,e[15]=(u*x-d*y+f*v)*k,e):null}function c(e,t,n){let r=t[0],i=t[1],a=t[2],o=t[3],s=t[4],c=t[5],l=t[6],u=t[7],d=t[8],f=t[9],p=t[10],m=t[11],h=t[12],g=t[13],_=t[14],v=t[15],y=n[0],b=n[1],x=n[2],S=n[3];return e[0]=y*r+b*s+x*d+S*h,e[1]=y*i+b*c+x*f+S*g,e[2]=y*a+b*l+x*p+S*_,e[3]=y*o+b*u+x*m+S*v,y=n[4],b=n[5],x=n[6],S=n[7],e[4]=y*r+b*s+x*d+S*h,e[5]=y*i+b*c+x*f+S*g,e[6]=y*a+b*l+x*p+S*_,e[7]=y*o+b*u+x*m+S*v,y=n[8],b=n[9],x=n[10],S=n[11],e[8]=y*r+b*s+x*d+S*h,e[9]=y*i+b*c+x*f+S*g,e[10]=y*a+b*l+x*p+S*_,e[11]=y*o+b*u+x*m+S*v,y=n[12],b=n[13],x=n[14],S=n[15],e[12]=y*r+b*s+x*d+S*h,e[13]=y*i+b*c+x*f+S*g,e[14]=y*a+b*l+x*p+S*_,e[15]=y*o+b*u+x*m+S*v,e}function l(e,t){let n=Math.sin(t),r=Math.cos(t);return e[0]=r,e[1]=0,e[2]=-n,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=n,e[9]=0,e[10]=r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function u(e,t,n,r){let i=t[0],a=t[1],o=t[2],s=t[3],c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=r[0],x=r[1],S=r[2];return e[0]=(1-(m+g))*b,e[1]=(f+y)*b,e[2]=(p-v)*b,e[3]=0,e[4]=(f-y)*x,e[5]=(1-(d+g))*x,e[6]=(h+_)*x,e[7]=0,e[8]=(p+v)*S,e[9]=(h-_)*S,e[10]=(1-(d+m))*S,e[11]=0,e[12]=n[0],e[13]=n[1],e[14]=n[2],e[15]=1,e}function d(e,t,n,r,i){let a=1/Math.tan(t/2),o;return e[0]=a/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i!=null&&i!==1/0?(o=1/(r-i),e[10]=(i+r)*o,e[14]=2*i*r*o):(e[10]=-1,e[14]=-2*r),e}function f(e,t,n,r){let i,a,s,c,l,u,d,f,p,m,h=t[0],g=t[1],_=t[2],v=r[0],y=r[1],b=r[2],x=n[0],S=n[1],C=n[2];return Math.abs(h-x)<1e-6&&Math.abs(g-S)<1e-6&&Math.abs(_-C)<1e-6?o(e):(d=h-x,f=g-S,p=_-C,m=1/Math.sqrt(d*d+f*f+p*p),d*=m,f*=m,p*=m,i=y*p-b*f,a=b*d-v*p,s=v*f-y*d,m=Math.sqrt(i*i+a*a+s*s),m?(m=1/m,i*=m,a*=m,s*=m):(i=0,a=0,s=0),c=f*s-p*a,l=p*i-d*s,u=d*a-f*i,m=Math.sqrt(c*c+l*l+u*u),m?(m=1/m,c*=m,l*=m,u*=m):(c=0,l=0,u=0),e[0]=i,e[1]=c,e[2]=d,e[3]=0,e[4]=a,e[5]=l,e[6]=f,e[7]=0,e[8]=s,e[9]=u,e[10]=p,e[11]=0,e[12]=-(i*h+a*g+s*_),e[13]=-(c*h+l*g+u*_),e[14]=-(d*h+f*g+p*_),e[15]=1,e)}let p=c;function m(){let t=new e(3);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function h(t){var n=new e(3);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n}function g(e){let t=e[0],n=e[1],r=e[2];return Math.sqrt(t*t+n*n+r*r)}function _(t,n,r){let i=new e(3);return i[0]=t,i[1]=n,i[2]=r,i}function v(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function y(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e}function b(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e}function x(e,t){let n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)}function S(e,t){let n=t[0],r=t[1],i=t[2],a=n*n+r*r+i*i;return a>0&&(a=1/Math.sqrt(a),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a),e}function C(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function w(e,t,n){let r=t[0],i=t[1],a=t[2],o=n[0],s=n[1],c=n[2];return e[0]=i*c-a*s,e[1]=a*o-r*c,e[2]=r*s-i*o,e}function T(e,t,n){let r=t[0],i=t[1],a=t[2],o=n[3]*r+n[7]*i+n[11]*a+n[15];return o||=1,e[0]=(n[0]*r+n[4]*i+n[8]*a+n[12])/o,e[1]=(n[1]*r+n[5]*i+n[9]*a+n[13])/o,e[2]=(n[2]*r+n[6]*i+n[10]*a+n[14])/o,e}function E(e,t,n){let r=t[0],i=t[1],a=t[2];return e[0]=r*n[0]+i*n[3]+a*n[6],e[1]=r*n[1]+i*n[4]+a*n[7],e[2]=r*n[2]+i*n[5]+a*n[8],e}let D=g;(function(){let e=m();return function(t,n,r,i,a,o){let s,c;for(n||=3,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2];return t}})();function O(){let t=new e(4);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function ee(t){let n=new e(4);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n}function k(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e}function te(e,t){let n=t[0],r=t[1],i=t[2],a=t[3],o=n*n+r*r+i*i+a*a;return o>0&&(o=1/Math.sqrt(o),e[0]=n*o,e[1]=r*o,e[2]=i*o,e[3]=a*o),e}(function(){let e=O();return function(t,n,r,i,a,o){let s,c;for(n||=4,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],e[2]=t[s+2],e[3]=t[s+3],a(e,e,o),t[s]=e[0],t[s+1]=e[1],t[s+2]=e[2],t[s+3]=e[3];return t}})();function ne(){let t=new e(4);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}function re(e,t,n){n*=.5;let r=Math.sin(n);return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=Math.cos(n),e}function ie(e,t,n,r){let i=t[0],a=t[1],o=t[2],s=t[3],c=n[0],l=n[1],u=n[2],d=n[3],f,p,m,h,g;return p=i*c+a*l+o*u+s*d,p<0&&(p=-p,c=-c,l=-l,u=-u,d=-d),1-p>1e-6?(f=Math.acos(p),m=Math.sin(f),h=Math.sin((1-r)*f)/m,g=Math.sin(r*f)/m):(h=1-r,g=r),e[0]=h*i+g*c,e[1]=h*a+g*l,e[2]=h*o+g*u,e[3]=h*s+g*d,e}function ae(e,t){let n=t[0]+t[4]+t[8],r;if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[5]-t[7])*r,e[1]=(t[6]-t[2])*r,e[2]=(t[1]-t[3])*r;else{let n=0;t[4]>t[0]&&(n=1),t[8]>t[n*3+n]&&(n=2);let i=(n+1)%3,a=(n+2)%3;r=Math.sqrt(t[n*3+n]-t[i*3+i]-t[a*3+a]+1),e[n]=.5*r,r=.5/r,e[3]=(t[i*3+a]-t[a*3+i])*r,e[i]=(t[i*3+n]+t[n*3+i])*r,e[a]=(t[a*3+n]+t[n*3+a])*r}return e}function oe(e,t,n,r){let i=.5*Math.PI/180;t*=i,n*=i,r*=i;let a=Math.sin(t),o=Math.cos(t),s=Math.sin(n),c=Math.cos(n),l=Math.sin(r),u=Math.cos(r);return e[0]=a*c*u-o*s*l,e[1]=o*s*u+a*c*l,e[2]=o*c*l-a*s*u,e[3]=o*c*u+a*s*l,e}let se=ee,ce=k,le=te;(function(){let e=m(),t=_(1,0,0),n=_(0,1,0);return function(r,i,a){let o=C(i,a);return o<-.999999?(w(e,t,i),D(e)<1e-6&&w(e,n,i),S(e,e),re(r,e,Math.PI),r):o>.999999?(r[0]=0,r[1]=0,r[2]=0,r[3]=1,r):(w(e,i,a),r[0]=e[0],r[1]=e[1],r[2]=e[2],r[3]=1+o,le(r,r))}})(),function(){let e=ne(),t=ne();return function(n,r,i,a,o,s){return ie(e,r,o,s),ie(t,i,a,s),ie(n,e,t,2*s*(1-s)),n}}(),(function(){let e=t();return function(t,n,r,i){return e[0]=r[0],e[3]=r[1],e[6]=r[2],e[1]=i[0],e[4]=i[1],e[7]=i[2],e[2]=-n[0],e[5]=-n[1],e[8]=-n[2],le(t,ae(t,e))}})();function ue(){let t=new e(2);return e!=Float32Array&&(t[0]=0,t[1]=0),t}(function(){let e=ue();return function(t,n,r,i,a,o){let s,c;for(n||=2,r||=0,c=i?Math.min(i*n+r,t.length):t.length,s=r;s<c;s+=n)e[0]=t[s],e[1]=t[s+1],a(e,e,o),t[s]=e[0],t[s+1]=e[1];return t}})();let de=t();var fe=class{constructor(e=null){this.origin=m(),this._dir=m(),this._dir[2]=-1,e&&(T(this.origin,this.origin,e),n(de,e),E(this._dir,this._dir,de)),this.direction=this._dir}get direction(){return this._dir}set direction(e){this._dir=v(this._dir,e),S(this._dir,this._dir),this.inv_dir=_(1/this._dir[0],1/this._dir[1],1/this._dir[2]),this.sign=[+(this.inv_dir[0]<0),+(this.inv_dir[1]<0),+(this.inv_dir[2]<0)]}intersectsAABB(e,t){let n=this,r=[e,t],i=(r[n.sign[0]][0]-n.origin[0])*n.inv_dir[0],a=(r[1-n.sign[0]][0]-n.origin[0])*n.inv_dir[0],o=(r[n.sign[1]][1]-n.origin[1])*n.inv_dir[1],s=(r[1-n.sign[1]][1]-n.origin[1])*n.inv_dir[1];if(i>s||o>a)return null;o>i&&(i=o),s<a&&(a=s);let c=(r[n.sign[2]][2]-n.origin[2])*n.inv_dir[2],l=(r[1-n.sign[2]][2]-n.origin[2])*n.inv_dir[2];if(i>l||c>a)return null;c>i&&(i=c),l<a&&(a=l);let u=-1;if(i>0&&a>0)u=Math.min(i,a);else if(i>0)u=i;else if(a>0)u=a;else return null;u-=.02;let d=h(this._dir);return b(d,d,u),y(d,d,this.origin),d}};let pe=new Float32Array([0,0,0]),me=new Float32Array([0,0,0,1]),he=new Float32Array([1,1,1]),ge=r();var A=class e{constructor(){this.name=null,this.children=[],this.parent=null,this.visible=!0,this.selectable=!1,this._matrix=null,this._dirtyTRS=!1,this._translation=null,this._rotation=null,this._scale=null,this._dirtyWorldMatrix=!1,this._worldMatrix=null,this._activeFrameId=-1,this._hoverFrameId=-1,this._renderPrimitives=null,this._renderer=null,this._selectHandler=null}_setRenderer(e){if(this._renderer!=e&&(this._renderer&&this.clearRenderPrimitives(),this._renderer=e,e)){this.onRendererChanged(e);for(let t of this.children)t._setRenderer(e)}}onRendererChanged(e){}clone(){let t=new e;return t.name=this.name,t.visible=this.visible,t._renderer=this._renderer,t._dirtyTRS=this._dirtyTRS,this._translation&&(t._translation=m(),v(t._translation,this._translation)),this._rotation&&(t._rotation=ne(),ce(t._rotation,this._rotation)),this._scale&&(t._scale=m(),v(t._scale,this._scale)),!t._dirtyTRS&&this._matrix&&(t._matrix=r(),a(t._matrix,this._matrix)),t._dirtyWorldMatrix=this._dirtyWorldMatrix,!t._dirtyWorldMatrix&&this._worldMatrix&&(t._worldMatrix=r(),a(t._worldMatrix,this._worldMatrix)),this.waitForComplete().then(()=>{if(this._renderPrimitives)for(let e of this._renderPrimitives)t.addRenderPrimitive(e);for(let e of this.children)t.addNode(e.clone())}),t}markActive(e){if(this.visible){if(this._renderPrimitives){this._activeFrameId=e;for(let t of this._renderPrimitives)t.markActive(e)}for(let t of this.children)t.visible&&t.markActive(e)}}addNode(e){e&&e.parent!=this&&(e.parent&&e.parent.removeNode(e),e.parent=this,this.children.push(e),e.setMatrixDirty(),this._renderer&&e._setRenderer(this._renderer))}removeNode(e){let t=this.children.indexOf(e);t>-1&&(this.children.splice(t,1),e.parent=null)}clearNodes(){for(let e of this.children)e.parent=null;this.children=[]}setMatrixDirty(){this._dirtyWorldMatrix=!0;for(let e of this.children)e.setMatrixDirty()}_updateLocalMatrix(){return this._matrix||=r(),this._dirtyTRS&&(this._dirtyTRS=!1,u(this._matrix,this._rotation||me,this._translation||pe,this._scale||he)),this._matrix}set matrix(e){e?(this._matrix||=r(),a(this._matrix,e)):this._matrix=null,this.setMatrixDirty(),this._dirtyTRS=!1,this._translation=null,this._rotation=null,this._scale=null}get matrix(){return this.setMatrixDirty(),this._updateLocalMatrix()}get worldMatrix(){return this._worldMatrix||=(this._dirtyWorldMatrix=!0,r()),(this._dirtyWorldMatrix||this._dirtyTRS)&&(this.parent?p(this._worldMatrix,this.parent.worldMatrix,this._updateLocalMatrix()):a(this._worldMatrix,this._updateLocalMatrix()),this._dirtyWorldMatrix=!1),this._worldMatrix}set translation(e){e!=null&&(this._dirtyTRS=!0,this.setMatrixDirty()),this._translation=e}get translation(){return this._dirtyTRS=!0,this.setMatrixDirty(),this._translation||=h(pe),this._translation}set rotation(e){e!=null&&(this._dirtyTRS=!0,this.setMatrixDirty()),this._rotation=e}get rotation(){return this._dirtyTRS=!0,this.setMatrixDirty(),this._rotation||=se(me),this._rotation}set scale(e){e!=null&&(this._dirtyTRS=!0,this.setMatrixDirty()),this._scale=e}get scale(){return this._dirtyTRS=!0,this.setMatrixDirty(),this._scale||=h(he),this._scale}waitForComplete(){let e=[];for(let t of this.children)e.push(t.waitForComplete());if(this._renderPrimitives)for(let t of this._renderPrimitives)e.push(t.waitForComplete());return Promise.all(e).then(()=>this)}get renderPrimitives(){return this._renderPrimitives}addRenderPrimitive(e){this._renderPrimitives?this._renderPrimitives.push(e):this._renderPrimitives=[e],e._instances.push(this)}removeRenderPrimitive(e){if(!this._renderPrimitives)return;let t=this._renderPrimitives._instances.indexOf(e);t>-1&&(this._renderPrimitives._instances.splice(t,1),t=e._instances.indexOf(this),t>-1&&e._instances.splice(t,1),this._renderPrimitives.length||(this._renderPrimitives=null))}clearRenderPrimitives(){if(this._renderPrimitives){for(let e of this._renderPrimitives){let t=e._instances.indexOf(this);t>-1&&e._instances.splice(t,1)}this._renderPrimitives=null}}_hitTestSelectableNode(e){if(this._renderPrimitives){let t=null;for(let n of this._renderPrimitives)if(n._min){t||=(s(ge,this.worldMatrix),c(ge,ge,e.matrix),new fe(ge));let r=t.intersectsAABB(n._min,n._max);if(r)return T(r,r,this.worldMatrix),r}}for(let t of this.children){let n=t._hitTestSelectableNode(e);if(n)return n}return null}hitTest(e){if(this.selectable&&this.visible){let t=this._hitTestSelectableNode(e);if(t){let n=new fe(e.matrix),r=_(n.origin.x,n.origin.y,n.origin.z);return{node:this,intersection:t,distance:x(r,t)}}return null}let t=null;for(let n of this.children){let r=n.hitTest(e);r&&(!t||t.distance>r.distance)&&(t=r)}return t}onSelect(e){this._selectHandler=e}get selectHandler(){return this._selectHandler}handleSelect(){this._selectHandler&&this._selectHandler()}onHoverStart(){}onHoverEnd(){}_update(e,t){this.onUpdate(e,t);for(let n of this.children)n._update(e,t)}onUpdate(e,t){}},_e=class{constructor(e,t,n,r,i){this.scene=e,this.reticle=t,this.ground=n,this.walking=r,this.walls=i,this.points=[],this.markers=[],this.scanMarkers=[],this.active=!1,this.scanning=!1,this.marking=!1,this.cursor=0,this.visits=0,this.finished=!1,this.segmentStart=null,this.lastScan=-1/0,this.lastUI=-1/0,this.loop=!1,this.actor=null,this.info=document.querySelector(`#route-status`),this.scanButton=document.querySelector(`#ground-scan`),this.addButton=document.querySelector(`#route-add`),this.playButton=document.querySelector(`#route-play`),this.scanButton?.addEventListener(`click`,()=>{this.scanning=!this.scanning,this.scanning&&(this.pause(),this.marking=!1,this.walls.cancelBuild()),this.sync()}),this.addButton?.addEventListener(`click`,()=>{this.marking=!this.marking,this.marking&&(this.pause(),this.scanning=!1,this.walls.cancelBuild()),this.sync()}),this.playButton?.addEventListener(`click`,()=>this.active?this.pause():this.play()),document.querySelector(`#route-clear`)?.addEventListener(`click`,()=>this.clear()),document.querySelector(`#route-loop`)?.addEventListener(`change`,e=>{this.loop=e.target.checked}),document.querySelector(`#route-markers`)?.addEventListener(`change`,()=>this.sync()),document.querySelector(`#walk-stop`)?.addEventListener(`click`,()=>this.pause());for(let e of[`walk-reposition`,`wall-add`])document.querySelector(`#`+e)?.addEventListener(`click`,()=>{this.pause(),this.marking=!1,this.scanning=!1,this.sync()});this.walking.joystick.onEngage=()=>this.pause(),window.addEventListener(`blur`,()=>this.pause()),document.addEventListener(`visibilitychange`,()=>{document.hidden&&this.pause()}),this.sync()}begin(e){this.end(),e.addEventListener(`visibilitychange`,()=>{e.visibilityState!==`visible`&&this.pause()}),this.sync()}attach(e){this.actor=e,this.sync()}drop(e){e.visible=!1,this.scene.removeNode(e),setTimeout(()=>{let t=e=>{for(let n of e.children)t(n);e.clearRenderPrimitives()};t(e)},0)}marker(e,t){let n=new A,i=this.reticle.clone();i.matrix=r(),i.scale=new Float32Array([t,t,t]),i.visible=!0;let a=new Float32Array(e);return a[13]+=.012,n.matrix=a,n.addNode(i),this.scene.addNode(n),n}observe(e,t,n){if(e-this.lastUI>500&&(this.lastUI=e,this.sync()),!this.scanning||!t||!n||e-this.lastScan<100)return;this.lastScan=e;let r=this.ground.recordScan(n);r&&(r.fresh&&(this.scanMarkers.push(this.marker(n,.18)),this.scanMarkers.length>48&&this.drop(this.scanMarkers.shift())),this.sync())}addStop(e){if(this.points.length>=16){this.info&&(this.info.textContent=`16 stops maximum. Clear stops to plan another route.`);return}if(!this.ground.recordScan(e))return;let t={x:e[12],y:e[13],z:e[14]};this.points.some(e=>Math.hypot(e.x-t.x,e.z-t.z)<.12)?this.info&&(this.info.textContent=`Choose a stop at least 12 cm from an existing stop.`):(this.points.push(t),this.markers.push(this.marker(e,.65)),this.finished=!1,this.sync())}sync(){this.scanButton&&(this.scanButton.textContent=this.scanning?`Finish scan`:`Scan ground`),this.addButton&&(this.addButton.textContent=this.marking?`Finish stops`:`Add stop`),this.playButton&&(this.playButton.disabled=!this.actor||!this.points.length,this.playButton.textContent=this.active?`Pause route`:!this.finished&&this.cursor>0?`Resume route`:`Walk route`);let e=document.querySelector(`#route-markers`)?.checked!==!1;for(let t of this.markers)t.visible=e||this.marking;for(let e of this.scanMarkers)e.visible=this.scanning;this.info&&(this.info.textContent=`Ground: ${this.ground.scanMap.size} samples · Stops: ${this.points.length}`+(this.active?` · Walking to ${this.cursor+1}`:this.finished?` · Route complete`:this.marking?` · Tap circles to add stops`:this.scanning?` · Move phone over the ground`:``))}play(){this.actor&&this.points.length&&(this.walking.joystick.stop(),this.scanning=!1,this.marking=!1,this.walls.cancelBuild(),(this.finished||this.cursor>=this.points.length)&&(this.cursor=0),this.finished=!1,this.active=!0,this.segmentStart=this.position(),this.sync())}position(){let e=this.actor.matrix;return{x:e[12],y:e[13],z:e[14]}}pause(){this.active&&(this.walking.joystick.stop(),this.walking.moving=!1,this.walking.motionRatio=0),this.active=!1,this.ground.routeHint=null,this.sync()}input(e){if(!this.active||!this.actor)return;if(!e){this.pause();return}let t=this.position(),n=this.points[this.cursor],i=Math.hypot(n.x-t.x,n.z-t.z);if(i<.08){if(this.segmentStart={...n},this.cursor++,this.visits++,this.cursor>=this.points.length){if(this.loop&&this.points.length>1)this.cursor=0;else{this.finished=!0,this.pause(),this.info&&(this.info.textContent=`Route complete. `+this.points.length+` stops visited.`);return}}n=this.points[this.cursor],i=Math.hypot(n.x-t.x,n.z-t.z),this.sync()}let a=e.transform?.matrix;!a&&e.views?.[0]?.transform?.inverse?.matrix&&(a=r(),s(a,e.views[0].transform.inverse.matrix));let o=a?Math.hypot(a[8],a[10]):0,c=o>.1?[-a[8]/o,-a[10]/o]:this.walking.forward,l=(n.x-t.x)/(i||1),u=(n.z-t.z)/(i||1),d=Math.min(1,i/Math.max(.1,this.walking.speed*.15));this.walking.joystick.x=(-c[1]*l+c[0]*u)*d,this.walking.joystick.y=(c[0]*l+c[1]*u)*d,this.ground.routeHint={a:this.segmentStart||t,b:n}}clear(){this.pause();for(let e of this.markers)this.drop(e);this.points=[],this.markers=[],this.cursor=0,this.visits=0,this.finished=!1,this.segmentStart=null,this.sync()}end(){this.clear();for(let e of this.scanMarkers)this.drop(e);this.scanMarkers=[],this.actor=null,this.scanning=!1,this.marking=!1,this.lastScan=-1/0,this.sync()}};let j=WebGLRenderingContext,M={CULL_FACE:1,BLEND:2,DEPTH_TEST:4,STENCIL_TEST:8,COLOR_MASK:16,DEPTH_MASK:32,STENCIL_MASK:64},N={CAPS_RANGE:255,BLEND_SRC_SHIFT:8,BLEND_SRC_RANGE:3840,BLEND_DST_SHIFT:12,BLEND_DST_RANGE:61440,BLEND_FUNC_RANGE:65280,DEPTH_FUNC_SHIFT:16,DEPTH_FUNC_RANGE:983040},P={OPAQUE:0,SKY:1,TRANSPARENT:2,ADDITIVE:3,DEFAULT:4};function ve(e,t,n){let r=(e&t)>>n;switch(r){case 0:case 1:return r;default:return r-2+j.SRC_COLOR}}var ye=class{constructor(){this._state=M.CULL_FACE|M.DEPTH_TEST|M.COLOR_MASK|M.DEPTH_MASK,this.blendFuncSrc=j.SRC_ALPHA,this.blendFuncDst=j.ONE_MINUS_SRC_ALPHA,this.depthFunc=j.LESS}get cullFace(){return!!(this._state&M.CULL_FACE)}set cullFace(e){e?this._state|=M.CULL_FACE:this._state&=~M.CULL_FACE}get blend(){return!!(this._state&M.BLEND)}set blend(e){e?this._state|=M.BLEND:this._state&=~M.BLEND}get depthTest(){return!!(this._state&M.DEPTH_TEST)}set depthTest(e){e?this._state|=M.DEPTH_TEST:this._state&=~M.DEPTH_TEST}get stencilTest(){return!!(this._state&M.STENCIL_TEST)}set stencilTest(e){e?this._state|=M.STENCIL_TEST:this._state&=~M.STENCIL_TEST}get colorMask(){return!!(this._state&M.COLOR_MASK)}set colorMask(e){e?this._state|=M.COLOR_MASK:this._state&=~M.COLOR_MASK}get depthMask(){return!!(this._state&M.DEPTH_MASK)}set depthMask(e){e?this._state|=M.DEPTH_MASK:this._state&=~M.DEPTH_MASK}get depthFunc(){return((this._state&N.DEPTH_FUNC_RANGE)>>N.DEPTH_FUNC_SHIFT)+j.NEVER}set depthFunc(e){e-=j.NEVER,this._state&=~N.DEPTH_FUNC_RANGE,this._state|=e<<N.DEPTH_FUNC_SHIFT}get stencilMask(){return!!(this._state&M.STENCIL_MASK)}set stencilMask(e){e?this._state|=M.STENCIL_MASK:this._state&=~M.STENCIL_MASK}get blendFuncSrc(){return ve(this._state,N.BLEND_SRC_RANGE,N.BLEND_SRC_SHIFT)}set blendFuncSrc(e){switch(e){case 0:case 1:break;default:e=e-j.SRC_COLOR+2}this._state&=~N.BLEND_SRC_RANGE,this._state|=e<<N.BLEND_SRC_SHIFT}get blendFuncDst(){return ve(this._state,N.BLEND_DST_RANGE,N.BLEND_DST_SHIFT)}set blendFuncDst(e){switch(e){case 0:case 1:break;default:e=e-j.SRC_COLOR+2}this._state&=~N.BLEND_DST_RANGE,this._state|=e<<N.BLEND_DST_SHIFT}},be=class{constructor(e){this._uniformName=e,this._texture=null}get texture(){return this._texture}set texture(e){this._texture=e}},xe=class{constructor(e,t,n){this._uniformName=e,this._value=t,this._length=n,this._length||=t instanceof Array?t.length:1}get value(){return this._value}set value(e){this._value=e}},F=class{constructor(){this.state=new ye,this.renderOrder=P.DEFAULT,this._samplers=[],this._uniforms=[]}defineSampler(e){let t=new be(e);return this._samplers.push(t),t}defineUniform(e,t=null,n=0){let r=new xe(e,t,n);return this._uniforms.push(r),r}get materialName(){return null}get vertexSource(){return null}get fragmentSource(){return null}getProgramDefines(e){return{}}},Se=class{constructor(){this.size=1,this.transparency=0,this.records=[],this.template=null,this.actor=null,this.visual=null;try{let e=JSON.parse(localStorage.getItem(`bellbrook-yowie-appearance`)||`null`);e&&(this.size=Math.max(.1,Math.min(3,Number(e.size)||1)),this.transparency=Math.max(0,Math.min(100,Number(e.transparency)||0)))}catch{}for(let e of document.querySelectorAll(`[data-yowie-size]`))e.addEventListener(`input`,()=>this.setSize(Number(e.value)/100));for(let e of document.querySelectorAll(`[data-yowie-transparency]`))e.addEventListener(`input`,()=>this.setTransparency(Number(e.value)));for(let e of document.querySelectorAll(`[data-yowie-reset]`))e.addEventListener(`click`,()=>{this.setSize(1),this.setTransparency(0)});this.sync()}bind(e,t){this.renderer=e,this.template=t,t.name=`yowie-visual`;let n=e=>{for(let t of e.renderPrimitives||[])this.records.push({primitive:t,state:t._material._state,order:t._material._renderOrder});for(let t of e.children)n(t)};n(t),this.apply()}attach(e){this.actor=e,this.visual=null,this.appliedSize=null,this.update()}setSize(e){Number.isFinite(e)&&(this.size=Math.max(.1,Math.min(3,e)),this.apply(),this.sync())}setTransparency(e){Number.isFinite(e)&&(this.transparency=Math.max(0,Math.min(100,e)),this.apply(),this.sync())}sync(){for(let e of document.querySelectorAll(`[data-yowie-size]`))e.value=String(Math.round(this.size*100));for(let e of document.querySelectorAll(`[data-yowie-transparency]`))e.value=String(this.transparency);for(let e of document.querySelectorAll(`[data-yowie-size-value]`))e.textContent=Math.round(this.size*100)+`%`;for(let e of document.querySelectorAll(`[data-yowie-transparency-value]`))e.textContent=Math.round(this.transparency)+`%`;try{localStorage.setItem(`bellbrook-yowie-appearance`,JSON.stringify({size:this.size,transparency:this.transparency}))}catch{}}apply(){this.template&&(this.template.scale=new Float32Array([this.size,this.size,this.size])),this.update();let e=1-this.transparency/100;for(let t of this.records){let{primitive:n,state:r,order:i}=t,a=n._material;n.uniforms.modelOpacity&&(n.uniforms.modelOpacity.value=e);let o=e<1?P.TRANSPARENT:i;if(a._state=e<1?(r|M.BLEND)&~M.DEPTH_MASK:r,o!==a._renderOrder){let e=this.renderer._renderPrimitives[a._renderOrder],t=e.indexOf(n);t>=0&&e.splice(t,1),(this.renderer._renderPrimitives[o]??=[]).push(n),a._renderOrder=o}}}update(){this.actor&&!this.visual&&(this.visual=this.actor.children.find(e=>e.name===`yowie-visual`)||null),this.visual&&this.appliedSize!==this.size&&(this.visual.scale=new Float32Array([this.size,this.size,this.size]),this.appliedSize=this.size)}clear(){this.actor=null,this.visual=null,this.appliedSize=null}};function Ce(e){let t=[],n=e=>{for(let n of e.renderPrimitives||[])t.push(n);for(let t of e.children||[])n(t)};return n(e),t}var we=class{constructor(e=`tradesight-companion-exposure`,t=0){this.storageKey=e,this.primitives=[],this.ev=t;try{let e=localStorage.getItem(this.storageKey);e!==null&&Number.isFinite(Number(e))&&(this.ev=Math.max(-2,Math.min(3,Number(e))))}catch{}for(let e of document.querySelectorAll(`[data-model-exposure]`))e.addEventListener(`input`,()=>this.set(Number(e.value)));for(let e of document.querySelectorAll(`[data-exposure-reset]`))e.addEventListener(`click`,()=>this.set(0));this.set(this.ev)}bind(e){this.primitives=Ce(e),this.set(this.ev)}set(e){if(!Number.isFinite(e))return;this.ev=Math.max(-2,Math.min(3,e));let t=2**this.ev;for(let e of this.primitives){let n=e.uniforms.modelExposure;n&&(n.value=t)}for(let e of document.querySelectorAll(`[data-model-exposure]`))e.value=String(this.ev);for(let e of document.querySelectorAll(`[data-exposure-value]`))e.textContent=`${this.ev>0?`+`:``}${this.ev.toFixed(1)} EV`;try{localStorage.setItem(this.storageKey,String(this.ev))}catch{}}},Te=class e{static async load(t,n,r=`media/gltf/companion-motion-v1/`,i=!0){let a=await fetch(r+`motion.json`);if(!a.ok)throw Error(`Walk animation metadata could not load`);let o=await a.json(),s;if(i&&typeof DecompressionStream==`function`){let e=await fetch(r+`motion.bin.gz`);if(!e.ok)throw Error(`Walk animation could not load`);s=await new Response(e.headers.get(`Content-Encoding`)===`gzip`?e.body:e.body.pipeThrough(new DecompressionStream(`gzip`))).arrayBuffer()}else{let e=await fetch(r+`motion.bin`);if(!e.ok)throw Error(`Walk animation could not load`);s=await e.arrayBuffer()}return new e(t,n,o,s)}constructor(e,t,n,r){this.renderer=e,this.metadata=n,this.phase=0,this.clip=`Idle`,this.lastTime=null,this.lastSkin=-1/0,this.palette=new Float32Array(n.jointCount*16),this.clips={};for(let[e,t]of Object.entries(n.clips))this.clips[e]={...t,data:new Float32Array(r,t.offset,t.frames*n.jointCount*16)};let i=Ce(t);if(i.length!==n.primitives.length)throw Error(`Animation mesh count mismatch`);this.streams=n.primitives.map((t,n)=>{let a=i[n].vertexStreams;if(!a||a.POSITION.count!==t.count||a.POSITION.stride||a.NORMAL.stride)throw Error(`Animation vertex layout mismatch`);return a.POSITION.buffer._usage=e.gl.DYNAMIC_DRAW,a.NORMAL.buffer._usage=e.gl.DYNAMIC_DRAW,{count:t.count,positions:new Float32Array(r,t.positions,t.count*3),normals:new Float32Array(r,t.normals,t.count*3),joints:new Uint8Array(r,t.joints,t.count*4),weights:new Float32Array(r,t.weights,t.count*4),outputPositions:new Float32Array(t.count*3),outputNormals:new Float32Array(t.count*3),positionStream:a.POSITION,normalStream:a.NORMAL}}),this.applyPose(`Idle`,0)}update(e,t=!1,n=1,r=null){let i=this.lastTime===null?0:Math.max(0,Math.min((e-this.lastTime)/1e3,.1));this.lastTime=e,r&&(t=r.distance>1e-6);let a=t?`Walk`:`Idle`,o=a!==this.clip;o&&(this.clip=a,this.phase=0);let s=t&&r?r.distance/(r.cycleDistance*r.scale)*this.clips.Walk.duration:i*(t?Math.max(.15,n):1);this.phase=(this.phase+s)%this.clips[a].duration,!(!o&&e-this.lastSkin<1e3/30)&&(this.lastSkin=e,this.applyPose(a,this.phase))}applyPose(e,t){let n=this.clips[e],r=this.palette.length,i=t%n.duration*this.metadata.fps,a=Math.floor(i)%n.frames,o=(a+1)%n.frames,s=i-Math.floor(i);for(let e=0;e<r;e++)this.palette[e]=n.data[a*r+e]*(1-s)+n.data[o*r+e]*s;let c=this.palette;for(let e of this.streams){let t=e.positions,n=e.normals,r=e.joints,i=e.weights,a=e.outputPositions,o=e.outputNormals;for(let s=0;s<e.count;s++){let e=s*3,l=s*4,u=t[e],d=t[e+1],f=t[e+2],p=n[e],m=n[e+1],h=n[e+2],g=0,_=0,v=0,y=0,b=0,x=0;for(let e=0;e<4;e++){let t=i[l+e];if(t===0)continue;let n=r[l+e]*16;g+=(c[n]*u+c[n+4]*d+c[n+8]*f+c[n+12])*t,_+=(c[n+1]*u+c[n+5]*d+c[n+9]*f+c[n+13])*t,v+=(c[n+2]*u+c[n+6]*d+c[n+10]*f+c[n+14])*t,y+=(c[n]*p+c[n+4]*m+c[n+8]*h)*t,b+=(c[n+1]*p+c[n+5]*m+c[n+9]*h)*t,x+=(c[n+2]*p+c[n+6]*m+c[n+10]*h)*t}a[e]=g,a[e+1]=_,a[e+2]=v;let S=Math.hypot(y,b,x)||1;o[e]=y/S,o[e+1]=b/S,o[e+2]=x/S}this.renderer.updateRenderBuffer(e.positionStream.buffer,a,e.positionStream.byteOffset),this.renderer.updateRenderBuffer(e.normalStream.buffer,o,e.normalStream.byteOffset)}}},Ee=class{constructor(e){this.element=e,this.knob=e.querySelector(`.joystick-knob`),this.x=0,this.y=0,this.pointer=null,e.addEventListener(`pointerdown`,t=>{this.pointer!==null||t.button>0||(this.onEngage?.(),this.pointer=t.pointerId,e.setPointerCapture(t.pointerId),this.move(t),t.preventDefault())}),e.addEventListener(`pointermove`,e=>{e.pointerId===this.pointer&&(this.move(e),e.preventDefault())});for(let t of[`pointerup`,`pointercancel`,`lostpointercapture`])e.addEventListener(t,e=>{e.pointerId===this.pointer&&this.stop()});window.addEventListener(`blur`,()=>this.stop()),document.addEventListener(`visibilitychange`,()=>{document.hidden&&this.stop()})}move(e){let t=this.element.getBoundingClientRect(),n=t.width*.32,r=(e.clientX-t.left-t.width/2)/n,i=(e.clientY-t.top-t.height/2)/n,a=Math.hypot(r,i);a>1&&(r/=a,i/=a);let o=Math.max(0,(Math.min(a,1)-.12)/.88),s=Math.hypot(r,i)||1;this.x=r/s*o,this.y=-i/s*o,this.knob.style.transform=`translate(${r*n}px,${i*n}px)`,this.element.setAttribute(`aria-valuetext`,o>0?`Walking`:`Stopped`)}stop(){let e=this.pointer;this.pointer=null,this.x=0,this.y=0,this.knob.style.transform=`translate(0px,0px)`,this.element.setAttribute(`aria-valuetext`,`Stopped`),e!==null&&this.element.hasPointerCapture(e)&&this.element.releasePointerCapture(e)}},De=class{constructor(){this.overlay=document.querySelector(`#walking-overlay`),this.status=document.querySelector(`#walking-status`),this.joystick=new Ee(document.querySelector(`#walking-joystick`)),this.node=null,this.placing=!0,this.speed=.75,this.lastTime=null,this.forward=[0,-1],this.active=!1,this.moving=!1,this.motionRatio=0;for(let e of this.overlay.querySelectorAll(`[data-xr-control]`))e.addEventListener(`beforexrselect`,e=>e.preventDefault());document.querySelector(`#walk-stop`).addEventListener(`click`,()=>this.stop()),document.querySelector(`#walk-reposition`).addEventListener(`click`,()=>{this.stop(),this.placing=!0,this.status.textContent=`Aim at the ground and tap the circle to reposition.`}),document.querySelector(`#walk-speed`).addEventListener(`change`,e=>{this.speed=Number(e.target.value),this.stop()}),document.querySelector(`#walk-exit`).addEventListener(`click`,()=>{this.stop(),this.session?.end()})}begin(e){this.session=e,this.active=!0,this.lastTime=null,this.placing=!0,this.overlay.hidden=!1,this.status.textContent=`Move the phone to find the circle. Tap to place your companion.`,e.addEventListener(`visibilitychange`,()=>{e.visibilityState!==`visible`&&this.stop()})}attach(e){this.node=e,this.placing=!1,this.stop(),this.status.textContent=`Drag the joystick to walk. Release to stop.`}stop(){this.moving=!1,this.motionRatio=0,this.joystick.stop(),this.node&&!this.placing&&(this.status.textContent=`Stopped. Drag the joystick to walk.`)}end(){this.stop(),this.active=!1,this.moving=!1,this.motionRatio=0,this.node=null,this.session=null,this.placing=!0,this.lastTime=null,this.overlay.hidden=!0}update(e,t){this.moving=!1,this.motionRatio=0;let n=this.lastTime===null?0:Math.max(0,Math.min((e-this.lastTime)/1e3,.05));if(this.lastTime=e,!this.active)return;if(!t){this.stop(),this.node&&(this.node.visible=!1),this.status.textContent=`Tracking paused. Move the phone slowly.`;return}if(!this.node||(this.node.visible=!0,this.placing))return;let i=t.transform?.matrix;if(!i&&t.views?.[0]?.transform?.inverse?.matrix&&(i=r(),s(i,t.views[0].transform.inverse.matrix)),i){let e=Math.hypot(i[8],i[10]);e>.1&&(this.forward=[-i[8]/e,-i[10]/e])}let a=this.joystick.x,o=this.joystick.y;if(Math.hypot(a,o)<.001)return;this.moving=!0,this.motionRatio=Math.hypot(a,o)*this.speed/.75;let[c,u]=this.forward,d=-u*a+c*o,f=c*a+u*o,p=this.node.matrix,m=[p[12]+d*this.speed*n,p[13],p[14]+f*this.speed*n],h=r();l(h,Math.atan2(d,f)),h[12]=m[0],h[13]=m[1],h[14]=m[2],this.node.matrix=h,this.status.textContent=`Walking. Release the joystick to stop.`}},Oe=class extends De{constructor(e,t,n){super(),this.ground=e,this.walls=t,this.appearance=n}attach(e){let t=e.matrix.slice();super.attach(e),this.ground.place(e,t);let n=r();l(n,Math.atan2(t[8],t[10])),n[12]=t[12],n[13]=t[13],n[14]=t[14],e.matrix=n}end(){this.ground.end(),this.walls.end(),super.end()}update(e,t){this.travelDistance=0,this.navigation?.input(t);let n=this.node?.matrix.slice(),r=this.placing;if(super.update(e,t),!n||!this.node||!t||r||!this.moving)return;let i=this.node.matrix.slice(),a=Math.hypot(i[12]-n[12],i[14]-n[14]),o=i[12]-n[12],s=i[14]-n[14],c=Math.hypot(o,s)||1;this.ground.want={x:i[12]+o/c*.16,y:n[13],z:i[14]+s/c*.16};let l=this.ground.resolve(i[12],i[14],n[13],a);i[13]=l.ok?l.y:n[13],this.travelDistance=Math.hypot(i[12]-n[12],i[13]-n[13],i[14]-n[14]),this.node.matrix=i,this.status.textContent=this.ground.enabled?l.ok?`Walking along detected ground. Release to stop.`:`Walking. Height held until ground is detected.`:`Walking. Release to stop.`}};function ke(e,t=0){if(!e||e.length!==16||!Array.from(e).every(Number.isFinite))return null;let n=Math.hypot(e[4],e[5],e[6]);if(n<.001)return null;let r=e[4]/n,i=e[5]/n,a=e[6]/n;return i<Math.cos(Math.PI/4)?null:{x:e[12],y:e[13],z:e[14],nx:r,ny:i,nz:a,time:t}}function Ae(e,t,n){return e.y-(e.nx*(t-e.x)+e.nz*(n-e.z))/e.ny}var je=class{constructor(){this.enabled=!0,this.samples=[],this.scanMap=/* @__PURE__ */ new Map,this.routeHint=null,this.now=0,this.epoch=0,this.source=null,this.pending=!1,this.session=null,this.space=null,this.actor=null,this.want=null,this.lastRequest=-1/0,this.sourcePoint=null,this.error=``;try{this.enabled=localStorage.getItem(`yowie-follow-slopes`)!==`false`}catch{}for(let e of document.querySelectorAll(`[data-follow-slopes]`))e.checked=this.enabled,e.addEventListener(`change`,()=>{this.enabled=e.checked,this.enabled||(this.epoch++,this.cancel(this.source),this.source=null,this.pending=!1),this.lastRequest=-1/0;for(let e of document.querySelectorAll(`[data-follow-slopes]`))e.checked=this.enabled;try{localStorage.setItem(`yowie-follow-slopes`,String(this.enabled))}catch{}})}cancel(e){try{e?.cancel()}catch{}}start(e,t){this.end(),this.session=e,this.space=t,this.error=``}place(e,t){this.actor=e,this.want=null,this.samples=[];let n=ke(t,this.now);n&&(this.samples.push(n),this.remember(n))}end(){this.epoch++,this.cancel(this.source),this.source=null,this.pending=!1,this.session=null,this.space=null,this.actor=null,this.want=null,this.samples=[],this.lastRequest=-1/0,this.sourcePoint=null,this.scanMap.clear(),this.routeHint=null}add(e){let t=ke(e,this.now);return t?(this.samples=this.samples.filter(e=>this.now-e.time<1600&&Math.hypot(e.x-t.x,e.z-t.z)>.025),this.samples.push(t),this.remember(t),this.samples.length>24&&this.samples.shift(),!0):!1}remember(e){let t=Math.floor(e.x/.2)+`,`+Math.floor(e.z/.2)+`,`+Math.round(e.y/.25),n=!this.scanMap.has(t);return this.scanMap.set(t,e),this.scanMap.size>1500&&this.scanMap.delete(this.scanMap.keys().next().value),n}recordScan(e){let t=ke(e,this.now);return t?{sample:t,fresh:this.remember(t)}:null}update(e,t,n,r=!0){if(this.now=t,!this.enabled||!this.actor||!r||!this.session)return;let i=this.actor.matrix,a=this.want||{x:i[12],y:i[13],z:i[14]};if(n&&Math.hypot(n[12]-a.x,n[14]-a.z)<.35&&this.add(n),this.source)try{for(let t of e.getHitTestResults(this.source)){let e=t.getPose(this.space);if(!e)continue;let n=e.transform.matrix;if(this.sourcePoint&&Math.hypot(n[12]-this.sourcePoint.x,n[14]-this.sourcePoint.z)<.12&&this.add(n))break}}catch{this.cancel(this.source),this.source=null}let o=!this.sourcePoint||Math.hypot(a.x-this.sourcePoint.x,a.z-this.sourcePoint.z)>.06;!this.pending&&t-this.lastRequest>(this.error?1500:150)&&(o||t-this.lastRequest>750)&&this.request(a)}request(e){if(this.lastRequest=this.now,typeof XRRay!=`function`){this.error=`Ground probing is unavailable. Turn off Follow slopes for flat walking.`;return}let t={x:e.x,y:e.y,z:e.z},n=this.epoch;this.pending=!0;try{Promise.resolve(this.session.requestHitTestSource({space:this.space,offsetRay:new XRRay({x:t.x,y:t.y+1.2,z:t.z,w:1},{x:0,y:-1,z:0,w:0})})).then(e=>{n===this.epoch?(this.cancel(this.source),this.source=e,this.sourcePoint=t,this.pending=!1,this.error=``):this.cancel(e)}).catch(()=>{n===this.epoch&&(this.pending=!1,this.error=`Scan the ground ahead. Ground probing is not ready.`)})}catch{this.pending=!1,this.error=`Scan the ground ahead. Ground probing is not ready.`}}resolve(e,t,n,r){if(!this.enabled)return{ok:!0,y:n};let i=this.samples.filter(n=>this.now-n.time<1600&&Math.hypot(n.x-e,n.z-t)<.5).sort((n,r)=>Math.hypot(n.x-e,n.z-t)-Math.hypot(r.x-e,r.z-t));if(!i.length){if(i.push(...[...this.scanMap.values()].filter(n=>Math.hypot(n.x-e,n.z-t)<.65).sort((n,r)=>Math.hypot(n.x-e,n.z-t)-Math.hypot(r.x-e,r.z-t))),!i.length&&this.routeHint){let{a:i,b:a}=this.routeHint,o=a.x-i.x,s=a.z-i.z,c=o*o+s*s,l=Math.max(0,Math.min(1,((e-i.x)*o+(t-i.z)*s)/(c||1)));if(Math.hypot(e-i.x-l*o,t-i.z-l*s)<.2){let e=i.y+(a.y-i.y)*l;if(Math.abs(e-n)<=Math.max(.15,r+.06))return{ok:!0,y:e,interpolated:!0}}}if(!i.length)return{ok:!1,reason:this.error||`Scan the ground ahead to update height.`}}let a=i[0],o=Ae(a,e,t);return Math.abs(o-n)>Math.max(.15,r+.06)?{ok:!1,reason:`Ground level changes sharply here. Scan or reposition.`}:{ok:!0,y:o,angle:Math.acos(a.ny)*180/Math.PI}}},I=class{constructor(e,t,n,r,i,a){this.name=e,this.buffer=t,this.componentCount=n||3,this.componentType=r||5126,this.stride=i||0,this.byteOffset=a||0,this.normalized=!1}},L=class{constructor(e,t,n){this.attributes=e||[],this.elementCount=t||0,this.mode=n||4,this.indexBuffer=null,this.indexByteOffset=0,this.indexType=0,this._min=null,this._max=null}setIndexBuffer(e,t,n){this.indexBuffer=e,this.indexByteOffset=t||0,this.indexType=n||5123}setBounds(e,t){this._min=h(e),this._max=h(t)}},Me=class extends F{constructor(e=!1){super(),this.guide=e,this.state.cullFace=!1,this.state.colorMask=e,this.state.depthMask=!e,this.state.depthTest=!e,this.renderOrder=e?P.ADDITIVE:P.OPAQUE}get materialName(){return this.guide?`YOWIE_WALL_GUIDE`:`YOWIE_DEPTH_WALL`}get vertexSource(){return`in vec3 POSITION; vec4 vertex_main(mat4 proj,mat4 view,mat4 model){return proj*view*model*vec4(POSITION,1.0);}`}get fragmentSource(){return this.guide?`vec4 fragment_main(){return vec4(0.25,1.0,0.65,1.0);}`:`vec4 fragment_main(){return vec4(0.0);}`}},Ne=class extends A{constructor(e,t=!1){super(),this.points=e,this.guide=t}onRendererChanged(e){let t=e.gl,n=new Float32Array(this.points.flatMap(e=>[e.x,e.y,e.z])),r=new Uint16Array(this.guide?[0,1,1,2,2,3,3,0]:[0,1,2,0,2,3]),i=e.createRenderBuffer(t.ARRAY_BUFFER,n),a=e.createRenderBuffer(t.ELEMENT_ARRAY_BUFFER,r),o=new L([new I(`POSITION`,i,3,t.FLOAT,0,0)],r.length,this.guide?t.LINES:t.TRIANGLES);o.setIndexBuffer(a);let s=e.createRenderPrimitive(o,new Me(this.guide));if(this.addRenderPrimitive(s),!this.guide){let t=e._renderPrimitives[P.OPAQUE],n=t.indexOf(s);t.splice(n,1),t.unshift(s)}}};function Pe(e,t,n){return{x:e.x+(t.x-e.x)*n,y:e.y+(t.y-e.y)*n,z:e.z+(t.z-e.z)*n}}function Fe(e){let{a:t,b:n,height:r,door:i}=e,a=Math.hypot(n.x-t.x,n.z-t.z),o=(e,t,n=e.y,i=t.y)=>({a:e,b:t,bottomA:n,bottomB:i,topA:e.y+r,topB:t.y+r,points:[{...e,y:n},{...t,y:i},{...t,y:t.y+r},{...e,y:e.y+r}]});if(!i)return[o(t,n)];let s=Pe(t,n,(a-i.width)/(2*a)),c=Pe(t,n,(a+i.width)/(2*a)),l=(t.y+n.y)/2+i.height;return[o(t,s),o(c,n),o(s,c,l,l)]}var Ie=class{constructor(e){this.scene=e,this.walls=[],this.nodes=[],this.guides=[],this.pendingNode=null,this.first=null,this.building=!1,this.showGuides=!1,this.status=document.querySelector(`#wall-status`),document.querySelector(`#wall-add`)?.addEventListener(`click`,()=>{this.building=!this.building,this.first=null;let e=document.querySelector(`#environment-tools`);e&&(e.open=!1),this.refreshPending(),this.status.textContent=this.building?`Tap the circle at the first wall corner.`:`Wall editing stopped.`;let t=document.querySelector(`#walking-status`);t&&(t.textContent=this.status.textContent),this.updateVisibility()}),document.querySelector(`#wall-undo`)?.addEventListener(`click`,()=>{this.walls.pop(),this.rebuild(),this.status.textContent=`Last wall removed.`}),document.querySelector(`#wall-clear`)?.addEventListener(`click`,()=>{this.walls=[],this.cancelBuild(),this.rebuild(),this.status.textContent=`Walls cleared.`}),document.querySelector(`#wall-guides`)?.addEventListener(`change`,e=>{this.showGuides=e.target.checked,this.updateVisibility()});for(let e of document.querySelectorAll(`[data-wall-dimension]`))e.addEventListener(`input`,()=>{let t=document.querySelector(`[data-wall-value="`+e.id+`"]`);t&&(t.textContent=Number(e.value).toFixed(2)+` m`)})}settings(){return{height:Number(document.querySelector(`#wall-height`)?.value||2.4),door:document.querySelector(`#wall-door`)?.checked?{width:Number(document.querySelector(`#door-width`)?.value||1.5),height:Number(document.querySelector(`#door-height`)?.value||2.1)}:null}}select(e){let t={x:e[12],y:e[13],z:e[14]};if(!this.first){this.first=t,this.refreshPending(),this.status.textContent=`First corner saved. Tap the circle at the other end of the wall.`;return}let n=Math.hypot(t.x-this.first.x,t.z-this.first.z),r=this.settings();if(n<.25)this.status.textContent=`Choose wall endpoints at least 25 cm apart.`;else if(r.door&&(n<r.door.width+.24||r.door.height>=r.height-.05))this.status.textContent=`Allow space for both jambs and a lintel. Increase wall length or height.`;else{if(r.door){let e=Math.abs(t.y-this.first.y)*r.door.width/(2*n);if(r.door.height+e>r.height-.05){this.status.textContent=`Increase wall height for this doorway on sloping ground.`;return}}this.walls.push({a:this.first,b:t,...r}),this.first=null,this.building=!1,this.refreshPending(),this.rebuild(),this.status.textContent=r.door?`Invisible wall with doorway added.`:`Invisible wall added.`}}dispose(e){if(!e)return;let t=e._renderer;if(t)for(let n of e.renderPrimitives||[]){let e=t._renderPrimitives[n._material._renderOrder],r=e?.indexOf(n);r>=0&&e.splice(r,1);let i=new Set(n._attributeBuffers.map(e=>e._buffer._buffer));n._indexBuffer&&i.add(n._indexBuffer._buffer);for(let e of i)e&&t.gl.deleteBuffer(e);n._vao&&t.gl.deleteVertexArray(n._vao)}e.clearRenderPrimitives(),this.scene.removeNode(e)}refreshPending(){if(this.dispose(this.pendingNode),this.pendingNode=null,this.first){let e=this.first,t=this.settings().height;this.pendingNode=new Ne([{x:e.x-.04,y:e.y,z:e.z},{x:e.x+.04,y:e.y,z:e.z},{x:e.x+.04,y:e.y+t,z:e.z},{x:e.x-.04,y:e.y+t,z:e.z}],!0),this.scene.addNode(this.pendingNode)}}cancelBuild(){this.building=!1,this.first=null,this.refreshPending(),this.updateVisibility()}updateVisibility(){for(let e of this.guides)e.visible=this.showGuides||this.building;let e=document.querySelector(`#wall-add`);e&&(e.textContent=this.building?`Cancel wall`:`Add invisible wall`)}rebuild(){for(let e of[...this.nodes,...this.guides])this.dispose(e);this.nodes=[],this.guides=[];for(let e of this.walls)for(let t of Fe(e)){let e=new Ne(t.points),n=new Ne(t.points,!0);this.nodes.push(e),this.guides.push(n),this.scene.addNode(e),this.scene.addNode(n)}this.updateVisibility()}end(){this.walls=[],this.cancelBuild(),this.rebuild()}};let Le=.8,Re={},ze=(e,t)=>{let n=t*Le;return`<button class="${e}-button">
          <div class="${e}-title"></div>
          <div class="${e}-logo" >${He(e,n)+Ue(e,n)}</div>
        </button>`},Be=e=>{let t=document.createElement(`style`);t.innerHTML=e;let n=document.getElementsByTagName(`head`)[0];n.insertBefore(t,n.firstChild)},Ve=e=>{let t=e.height/3;e.injectCSS&&(Re[e.cssprefix]||(Be(We(e,t)),Re[e.cssprefix]=!0));let n=document.createElement(`div`);return n.innerHTML=ze(e.cssprefix,t),n.firstChild},He=(e,t)=>`<svg class="${e}-svg" version="1.1" x="0px" y="0px"
        width="${28/18*t}px" height="${t}px" viewBox="0 0 28 18" xml:space="preserve">
        <path d="M26.8,1.1C26.1,0.4,25.1,0,24.2,0H3.4c-1,0-1.7,0.4-2.4,1.1C0.3,1.7,0,2.7,0,3.6v10.7
        c0,1,0.3,1.9,0.9,2.6C1.6,17.6,2.4,18,3.4,18h5c0.7,0,1.3-0.2,1.8-0.5c0.6-0.3,1-0.8,1.3-1.4l
        1.5-2.6C13.2,13.1,13,13,14,13v0h-0.2 h0c0.3,0,0.7,0.1,0.8,0.5l1.4,2.6c0.3,0.6,0.8,1.1,1.3,
        1.4c0.6,0.3,1.2,0.5,1.8,0.5h5c1,0,2-0.4,2.7-1.1c0.7-0.7,1.2-1.6,1.2-2.6 V3.6C28,2.7,27.5,
        1.7,26.8,1.1z M7.4,11.8c-1.6,0-2.8-1.3-2.8-2.8c0-1.6,1.3-2.8,2.8-2.8c1.6,0,2.8,1.3,2.8,2.8
        C10.2,10.5,8.9,11.8,7.4,11.8z M20.1,11.8c-1.6,0-2.8-1.3-2.8-2.8c0-1.6,1.3-2.8,2.8-2.8C21.7
        ,6.2,23,7.4,23,9 C23,10.5,21.7,11.8,20.1,11.8z"/>
    </svg>`,Ue=(e,t)=>{let n=28/18;return`<svg class="${e}-svg-error" x="0px" y="0px"
        width="${n*t}px" height="${n*t}px" viewBox="0 0 28 28" xml:space="preserve">
        <path d="M17.6,13.4c0-0.2-0.1-0.4-0.1-0.6c0-1.6,1.3-2.8,2.8-2.8s2.8,1.3,2.8,2.8s-1.3,2.8-2.8,2.8
        c-0.2,0-0.4,0-0.6-0.1l5.9,5.9c0.5-0.2,0.9-0.4,1.3-0.8
        c0.7-0.7,1.1-1.6,1.1-2.5V7.4c0-1-0.4-1.9-1.1-2.5c-0.7-0.7-1.6-1-2.5-1
        H8.1 L17.6,13.4z"/>
        <path d="M10.1,14.2c-0.5,0.9-1.4,1.4-2.4,1.4c-1.6,0-2.8-1.3-2.8-2.8c0-1.1,0.6-2,1.4-2.5
        L0.9,5.1 C0.3,5.7,0,6.6,0,7.5v10.7c0,1,0.4,1.8,1.1,2.5c0.7,0.7,1.6,1,2.5,1
        h5c0.7,0,1.3-0.1,1.8-0.5c0.6-0.3,1-0.8,1.3-1.4l1.3-2.6 L10.1,14.2z"/>
        <path d="M25.5,27.5l-25-25C-0.1,2-0.1,1,0.5,0.4l0,0C1-0.1,2-0.1,2.6,0.4l25,25c0.6,0.6,0.6,1.5
        ,0,2.1l0,0 C27,28.1,26,28.1,25.5,27.5z"/>
    </svg>`},We=(e,t=18)=>{let n=e.height,r=e.background?e.background:e.color,i=e.cssprefix,a;return a=e.corners==`round`?e.height/2:e.corners==`square`?2:e.corners,`
    
    

    button.${i}-button {
        font-family: 'Karla', sans-serif;

        border: ${r} 2px solid;
        border-radius: ${a}px;
        box-sizing: border-box;
        background: ${e.background?e.background:`none`};

        height: ${n}px;
        min-width: ${t*9.6}px;
        display: inline-block;
        position: relative;

        cursor: pointer;
        transition: border 0.5s;
    }

    button.${i}-button:focus {
      outline: none;
    }

    /*
    * Logo
    */

    .${i}-logo {
        width: ${n}px;
        height: ${n}px;
        position: absolute;
        top:0px;
        left:0px;
        width: ${n-4}px;
        height: ${n-4}px;
    }
    .${i}-svg {
        fill: ${e.color};
        margin-top: ${(n-t*Le)/2-2}px;
        margin-left: ${n/3}px;
    }
    .${i}-svg-error {
        fill: ${e.color};
        display:none;
        margin-top: ${(n-28/18*t*Le)/2-2}px;
        margin-left: ${n/3}px;
    }


    /*
    * Title
    */

    .${i}-title {
        color: ${e.color};
        position: relative;
        font-size: ${t}px;
        padding-left: ${n*1.05}px;
        padding-right: ${a-10<5?n/3:a-10}px;
        transition: color 0.5s;
    }

    /*
    * disabled
    */

    button.${i}-button[disabled=true] {
        opacity: ${e.disabledOpacity};
    }

    button.${i}-button[disabled=true] > .${i}-logo > .${i}-svg {
        display:none;
    }

    button.${i}-button[disabled=true] > .${i}-logo > .${i}-svg-error {
        display:initial;
    }

    /*
    * error
    */

    button.${i}-button[error=true] {
        animation: errorShake 0.4s;
    }

    @keyframes errorShake {
      0% { transform: translate(1px, 0) }
      10% { transform: translate(-2px, 0) }
      20% { transform: translate(2px, 0) }
      30% { transform: translate(-2px, 0) }
      40% { transform: translate(2px, 0) }
      50% { transform: translate(-2px, 0) }
      60% { transform: translate(2px, 0) }
      70% { transform: translate(-2px, 0) }
      80% { transform: translate(2px, 0) }
      90% { transform: translate(-1px, 0) }
      100% { transform: translate(0px, 0) }
    }
  `};var Ge=class{constructor(e){e||={},e.color=e.color||`rgb(80,168,252)`,e.background=e.background||!1,e.disabledOpacity=e.disabledOpacity||.5,e.height=e.height||55,e.corners=e.corners||`square`,e.cssprefix=e.cssprefix||`webvr-ui`,e.textEnterXRTitle=e.textEnterXRTitle||`ENTER VR`,e.textXRNotFoundTitle=e.textXRNotFoundTitle||`VR NOT FOUND`,e.textExitXRTitle=e.textExitXRTitle||`EXIT VR`,e.onRequestSession=e.onRequestSession||(function(){}),e.onEndSession=e.onEndSession||(function(){}),e.injectCSS=e.injectCSS!==!1,this.options=e,this._enabled=!1,this.session=null,this.domElement=e.domElement||Ve(e),this.__defaultDisplayStyle=this.domElement.style.display||`initial`,this.domElement.addEventListener(`click`,()=>this.__onXRButtonClick()),this.__forceDisabled=!1,this.__setDisabledAttribute(!0),this.setTitle(this.options.textXRNotFoundTitle)}set enabled(e){return this._enabled=e,this.__updateButtonState(),this}get enabled(){return this._enabled}setSession(e){return this.session=e,this.__updateButtonState(),this}setTitle(e){return this.domElement.title=e,Ke(this.domElement,this.options.cssprefix,`title`,t=>{e?(t.innerText=e,t.style.display=`initial`):t.style.display=`none`}),this}setTooltip(e){return this.domElement.title=e,this}show(){return this.domElement.style.display=this.__defaultDisplayStyle,this}hide(){return this.domElement.style.display=`none`,this}enable(){return this.__setDisabledAttribute(!1),this.__forceDisabled=!1,this}disable(){return this.__setDisabledAttribute(!0),this.__forceDisabled=!0,this}remove(){this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement)}__setDisabledAttribute(e){e||this.__forceDisabled?this.domElement.setAttribute(`disabled`,`true`):this.domElement.removeAttribute(`disabled`)}__onXRButtonClick(){if(this.session)this.options.onEndSession(this.session);else if(this._enabled){let e=this.options.onRequestSession();e&&e.catch(e=>{let t=`XRSession creation failed: ${e.message}`;this.setTooltip(t),console.error(t),this.__setDisabledAttribute(!0),this.domElement.setAttribute(`error`,`true`),setTimeout(()=>{this.__setDisabledAttribute(!1),this.domElement.setAttribute(`error`,`false`)},1e3)})}}__updateButtonState(){this.session?(this.setTitle(this.options.textExitXRTitle),this.setTooltip(`Exit XR presentation`),this.__setDisabledAttribute(!1)):this._enabled?(this.setTitle(this.options.textEnterXRTitle),this.setTooltip(`Enter XR`),this.__setDisabledAttribute(!1)):(this.setTitle(this.options.textXRNotFoundTitle),this.setTooltip(`No XR headset found.`),this.__setDisabledAttribute(!0))}};let Ke=(e,t,n,r)=>{let i=e.querySelector(`.`+t+`-`+n);i&&r(i)};var qe=class{constructor(e,t,n,r,i,a,o){this._gl=e,this.program=e.createProgram(),this.attrib=null,this.uniform=null,this.defines={},this.extensions=[],this.layouts=[],this._firstUse=!0,this._nextUseCallbacks=[];let s=``;if(a)for(let e of a)this.extensions.push(e),s+=`#extension ${e} : require\n`;let c=``;if(o)for(let e of o)this.layouts.push(e),c+=`layout(${e}) in;\n`;let l=``;if(i)for(let e in i)this.defines[e]=i[e],l+=`#define ${e} ${i[e]}\n`;if(this._vertShader=e.createShader(e.VERTEX_SHADER),e.attachShader(this.program,this._vertShader),e.shaderSource(this._vertShader,`#version 300 es
`+s+c+l+t),e.compileShader(this._vertShader),this._fragShader=e.createShader(e.FRAGMENT_SHADER),e.attachShader(this.program,this._fragShader),e.shaderSource(this._fragShader,`#version 300 es
`+s+l+n),e.compileShader(this._fragShader),r){this.attrib={};for(let t in r)e.bindAttribLocation(this.program,r[t],t),this.attrib[t]=r[t]}e.linkProgram(this.program)}onNextUse(e){this._nextUseCallbacks.push(e)}use(){let e=this._gl;if(this._firstUse){if(this._firstUse=!1,!e.getProgramParameter(this.program,e.LINK_STATUS))e.getShaderParameter(this._vertShader,e.COMPILE_STATUS)?e.getShaderParameter(this._fragShader,e.COMPILE_STATUS)?console.error(`Program link error: `+e.getProgramInfoLog(this.program)):console.error(`Fragment shader compile error: `+e.getShaderInfoLog(this._fragShader)):console.error(`Vertex shader compile error: `+e.getShaderInfoLog(this._vertShader)),e.deleteProgram(this.program),this.program=null;else{if(!this.attrib){this.attrib={};let t=e.getProgramParameter(this.program,e.ACTIVE_ATTRIBUTES);for(let n=0;n<t;n++){let t=e.getActiveAttrib(this.program,n);this.attrib[t.name]=e.getAttribLocation(this.program,t.name)}}this.uniform={};let t=e.getProgramParameter(this.program,e.ACTIVE_UNIFORMS),n=``;for(let r=0;r<t;r++)n=e.getActiveUniform(this.program,r).name.replace(`[0]`,``),this.uniform[n]=e.getUniformLocation(this.program,n)}e.deleteShader(this._vertShader),e.deleteShader(this._fragShader)}if(e.useProgram(this.program),this._nextUseCallbacks.length){for(let e of this._nextUseCallbacks)e(this);this._nextUseCallbacks=[]}}};let Je=WebGLRenderingContext,Ye=0;var Xe=class{constructor(){this.minFilter=null,this.magFilter=null,this.wrapS=null,this.wrapT=null}},Ze=class{constructor(){this.sampler=new Xe,this.mipmap=!0}get format(){return Je.RGBA}get width(){return 0}get height(){return 0}get textureKey(){return null}get isExternal(){return!1}},Qe=class extends Ze{constructor(e){super(),this._img=e,this._imgBitmap=null,this._manualKey=null,this._promise=e.src&&e.complete?e.naturalWidth?this._finishImage():Promise.reject(`Image provided had failed to load.`):new Promise((t,n)=>{e.addEventListener(`load`,()=>t(this._finishImage())),e.addEventListener(`error`,n)})}_finishImage(){return window.createImageBitmap?window.createImageBitmap(this._img).then(e=>(this._imgBitmap=e,Promise.resolve(this))):Promise.resolve(this)}get format(){return Je.RGBA}get width(){return this._img.width}get height(){return this._img.height}waitForComplete(){return this._promise}get textureKey(){return this._manualKey||this._img.src}get source(){return this._imgBitmap||this._img}genDataKey(){this._manualKey=`DATA_${Ye}`,Ye++}},$e=class extends Ze{constructor(e){super(),this._video=e,this._promise=e.readyState>=2?Promise.resolve(this):e.error?Promise.reject(e.error):new Promise((t,n)=>{e.addEventListener(`loadeddata`,()=>t(this)),e.addEventListener(`error`,n)})}get format(){return Je.RGBA}get width(){return this._video.videoWidth}get height(){return this._video.videoHeight}waitForComplete(){return this._promise}get textureKey(){return this._video.src}get source(){return this._video}},et=class extends Ze{constructor(e,t,n,r=Je.RGBA,i=Je.UNSIGNED_BYTE){super(),this._data=e,this._width=t,this._height=n,this._format=r,this._type=i,this._key=`DATA_${Ye}`,Ye++}get format(){return this._format}get width(){return this._width}get height(){return this._height}get textureKey(){return this._key}},tt=class extends Ze{constructor(e){super(),this._key=e}get textureKey(){return this._key}get isExternal(){return!0}},nt=class extends et{constructor(e,t,n,r){let i=new Uint8Array([e*255,t*255,n*255,r*255]);super(i,1,1),this.mipmap=!1,this._key=`COLOR_${i[0]}_${i[1]}_${i[2]}_${i[3]}`}};let rt={POSITION:1,NORMAL:2,TANGENT:3,TEXCOORD_0:4,TEXCOORD_1:5,COLOR_0:6},R={POSITION:1,NORMAL:2,TANGENT:4,TEXCOORD_0:8,TEXCOORD_1:16,COLOR_0:32},it=WebGLRenderingContext,at=new Float32Array([-.1,-1,-.2]),ot=new Float32Array([3,3,3]),st=/* @__PURE__ */ RegExp(`precision (lowp|mediump|highp) float;`);function ct(e){return!(e&e-1)}function lt(e){e||={alpha:!1};let t=document.createElement(`canvas`),n=[`webgl2`],r=null;for(let i of n)if(r=t.getContext(i,e),r)break;if(!r){let t=e.webgl2?`WebGL 2`:`WebGL`;return console.error(`This browser does not support `+t+`.`),null}return r}var ut=class{constructor(e,t,n=null,r=`left`,a=null){this.projectionMatrix=e,this.viewport=n,this._eye=r,this._eyeIndex=r==`left`?0:1,this.depthdata=a,t instanceof Float32Array?(this._viewMatrix=i(t),this.viewTransform=new XRRigidTransform):(this.viewTransform=t,this._viewMatrix=t.inverse.matrix)}get viewMatrix(){return this._viewMatrix}get eye(){return this._eye}set eye(e){this._eye=e,this._eyeIndex=e==`left`?0:1}get eyeIndex(){return this._eyeIndex}set depthTexture(e){this._depthTexture=e}},dt=class{constructor(e,t,n,r=0){this._target=e,this._usage=t,this._length=r,n instanceof Promise?(this._buffer=null,this._promise=n.then(e=>(this._buffer=e,this))):(this._buffer=n,this._promise=Promise.resolve(this))}waitForComplete(){return this._promise}},ft=class{constructor(e){this._attrib_index=rt[e.name],this._componentCount=e.componentCount,this._componentType=e.componentType,this._stride=e.stride,this._byteOffset=e.byteOffset,this._normalized=e.normalized}},pt=class{constructor(e){this._buffer=e,this._attributes=[]}},mt=class{constructor(e){this._activeFrameId=0,this._instances=[],this._material=null,this.setPrimitive(e)}setPrimitive(e){this._mode=e.mode,this._elementCount=e.elementCount,this._promise=null,this._vao=null,this._complete=!1,this._attributeBuffers=[],this._attributeMask=0;for(let t of e.attributes){this._attributeMask|=R[t.name];let e=new ft(t),n=!1;for(let r of this._attributeBuffers)if(r._buffer==t.buffer){r._attributes.push(e),n=!0;break}if(!n){let n=new pt(t.buffer);n._attributes.push(e),this._attributeBuffers.push(n)}}this._indexBuffer=null,this._indexByteOffset=0,this._indexType=0,e.indexBuffer&&(this._indexByteOffset=e.indexByteOffset,this._indexType=e.indexType,this._indexBuffer=e.indexBuffer),e._min?(this._min=h(e._min),this._max=h(e._max)):(this._min=null,this._max=null),this._material!=null&&this.waitForComplete()}setRenderMaterial(e){this._material=e,this._promise=null,this._complete=!1,this._material!=null&&this.waitForComplete()}markActive(e){if(this._complete&&this._activeFrameId!=e){if(this._material&&!this._material.markActive(e))return;this._activeFrameId=e}}get samplers(){return this._material._samplerDictionary}get uniforms(){return this._material._uniform_dictionary}waitForComplete(){if(!this._promise){if(!this._material)return Promise.reject(`RenderPrimitive does not have a material`);let e=[];for(let t of this._attributeBuffers)t._buffer._buffer||e.push(t._buffer._promise);this._indexBuffer&&!this._indexBuffer._buffer&&e.push(this._indexBuffer._promise),this._promise=Promise.all(e).then(()=>(this._complete=!0,this))}return this._promise}},ht=class{constructor(e){this._texture=e,this._complete=!1,this._activeFrameId=0,this._activeCallback=null,this._isExternalTexture=!1,this._isArray=!1}markActive(e){this._activeCallback&&this._activeFrameId!=e&&(this._activeFrameId=e,this._activeCallback(this))}};r();function gt(e,t,n,r,i){let a=(i&n)-(r&n);a&&(a>0?e.enable(t):e.disable(t))}var _t=class{constructor(e,t,n){this._renderer=e,this._uniformName=t._uniformName,this._renderTexture=e._getRenderTexture(t._texture),this._index=n}set texture(e){this._renderTexture=this._renderer._getRenderTexture(e)}},vt=class{constructor(e){this._uniformName=e._uniformName,this._uniform=null,this._length=e._length,this._value=e._value instanceof Array?new Float32Array(e._value):new Float32Array([e._value])}set value(e){if(this._value.length==1)this._value[0]=e;else for(let t=0;t<this._value.length;++t)this._value[t]=e[t]}},yt=class{constructor(e,t,n){this._program=n,this._state=t.state._state,this._activeFrameId=0,this._completeForActiveFrame=!1,this._samplerDictionary={},this._samplers=[];for(let n=0;n<t._samplers.length;++n){let r=new _t(e,t._samplers[n],n);this._samplers.push(r),this._samplerDictionary[r._uniformName]=r}this._uniform_dictionary={},this._uniforms=[];for(let e of t._uniforms){let t=new vt(e);this._uniforms.push(t),this._uniform_dictionary[t._uniformName]=t}this._firstBind=!0,this._renderOrder=t.renderOrder,this._renderOrder==P.DEFAULT&&(this._renderOrder=this._state&M.BLEND?P.TRANSPARENT:P.OPAQUE)}bind(e){if(this._firstBind){for(let e=0;e<this._samplers.length;){let t=this._samplers[e];this._program.uniform[t._uniformName]?++e:this._samplers.splice(e,1)}for(let e=0;e<this._uniforms.length;){let t=this._uniforms[e];t._uniform=this._program.uniform[t._uniformName],t._uniform?++e:this._uniforms.splice(e,1)}this._firstBind=!1}for(let t of this._samplers){let n=t._renderTexture._isArray?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D;e.activeTexture(e.TEXTURE0+t._index),t._renderTexture&&t._renderTexture._complete?e.bindTexture(n,t._renderTexture._texture):e.bindTexture(n,null)}for(let t of this._uniforms)switch(t._length){case 1:e.uniform1fv(t._uniform,t._value);break;case 2:e.uniform2fv(t._uniform,t._value);break;case 3:e.uniform3fv(t._uniform,t._value);break;case 4:e.uniform4fv(t._uniform,t._value)}}markActive(e){if(this._activeFrameId!=e){this._activeFrameId=e,this._completeForActiveFrame=!0;for(let t=0;t<this._samplers.length;++t){let n=this._samplers[t];if(n._renderTexture){if(!n._renderTexture._complete){this._completeForActiveFrame=!1;break}n._renderTexture.markActive(e)}}}return this._completeForActiveFrame}get cullFace(){return!!(this._state&M.CULL_FACE)}get blend(){return!!(this._state&M.BLEND)}get depthTest(){return!!(this._state&M.DEPTH_TEST)}get stencilTest(){return!!(this._state&M.STENCIL_TEST)}get colorMask(){return!!(this._state&M.COLOR_MASK)}get depthMask(){return!!(this._state&M.DEPTH_MASK)}get stencilMask(){return!!(this._state&M.STENCIL_MASK)}get depthFunc(){return((this._state&N.DEPTH_FUNC_RANGE)>>N.DEPTH_FUNC_SHIFT)+it.NEVER}get blendFuncSrc(){return ve(this._state,N.BLEND_SRC_RANGE,N.BLEND_SRC_SHIFT)}get blendFuncDst(){return ve(this._state,N.BLEND_DST_RANGE,N.BLEND_DST_SHIFT)}_capsDiff(e){return e&N.CAPS_RANGE^this._state&N.CAPS_RANGE}_blendDiff(e){return this._state&M.BLEND?e&N.BLEND_FUNC_RANGE^this._state&N.BLEND_FUNC_RANGE:0}_depthFuncDiff(e){return this._state&M.DEPTH_TEST?e&N.DEPTH_FUNC_RANGE^this._state&N.DEPTH_FUNC_RANGE:0}},bt=class{constructor(e,t,n,r,i){let a=typeof t==`object`?t:{multiview:t,multisampledMultiview:n,useDepth:r,motionVectorPass:i};this._gl=e||lt(),this._frameId=0,this._programCache={},this._textureCache={},this._renderPrimitives=Array(P.DEFAULT),this._cameraPositions=[],this._vaoExt=e.getExtension(`OES_vertex_array_object`);let o=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT);this._defaultFragPrecision=o.precision>0?`highp`:`mediump`,this._depthMaskNeedsReset=!1,this._colorMaskNeedsReset=!1,this._globalLightColor=h(ot),this._globalLightDir=h(at),this._mv_ext=e.getExtension(`OCULUS_multiview`)||e.getExtension(`OVR_multiview2`),this._multiview=a.multiview&&this._mv_ext,this._multisampledMultiview=a.multisampledMultiview,this._useDepth=a.useDepth,this._motionVectorPass=a.motionVectorPass}get gl(){return this._gl}get multiview(){return this._multiview}get multisampledMultiview(){return this._multisampledMultiview&&this._multiview}get multiviewExtension(){return this._mv_ext}get motionVectorPass(){return this._motionVectorPass}get useDepth(){return this._useDepth}get xrFramebuffer(){return this._xrFramebuffer||=this._gl.createFramebuffer(),this._xrFramebuffer}getXrBinding(e){return this._xrBindingSession!=e&&(this._xrBinding=new XRWebGLBinding(e,this._gl),this._xrBindingSession=e),this._xrBinding}get maxSamples(){return this._maxSamples||=this._gl.getParameter(this._gl.MAX_SAMPLES),this._maxSamples}set globalLightColor(e){v(this._globalLightColor,e)}get globalLightColor(){return h(this._globalLightColor)}set globalLightDir(e){v(this._globalLightDir,e)}get globalLightDir(){return h(this._globalLightDir)}createRenderBuffer(e,t,n=it.STATIC_DRAW){let r=this._gl,i=r.createBuffer();if(t instanceof Promise){let a=new dt(e,n,t.then(t=>(r.bindBuffer(e,i),r.bufferData(e,t,n),a._length=t.byteLength,i)));return a}return r.bindBuffer(e,i),r.bufferData(e,t,n),new dt(e,n,i,t.byteLength)}updateRenderBuffer(e,t,n=0){if(e._buffer){let r=this._gl;r.bindBuffer(e._target,e._buffer),n==0&&e._length==t.byteLength?r.bufferData(e._target,t,e._usage):r.bufferSubData(e._target,n,t)}else e.waitForComplete().then(e=>{this.updateRenderBuffer(e,t,n)})}createRenderPrimitive(e,t){let n=new mt(e),r=this._getMaterialProgram(t,n),i=new yt(this,t,r);return n.setRenderMaterial(i),this._renderPrimitives[i._renderOrder]||(this._renderPrimitives[i._renderOrder]=[]),this._renderPrimitives[i._renderOrder].push(n),n}createMesh(e,t){let n=new A;return n.addRenderPrimitive(this.createRenderPrimitive(e,t)),n}drawViews(e,t,n){if(!t)return;let r=this._gl;if(this._frameId++,t.markActive(this._frameId),e.length==1&&e[0].viewport){let t=e[0].viewport;this._gl.viewport(t.x,t.y,t.width,t.height)}for(let t=0;t<e.length;++t){this._cameraPositions.length<=t&&this._cameraPositions.push(m());let n=e[t].viewTransform.position;this._cameraPositions[t][0]=n.x,this._cameraPositions[t][1]=n.y,this._cameraPositions[t][2]=n.z}for(let t of this._renderPrimitives)t&&t.length&&this._drawRenderPrimitiveSet(e,t,n);this._vaoExt&&this._vaoExt.bindVertexArrayOES(null),this._depthMaskNeedsReset&&r.depthMask(!0),this._colorMaskNeedsReset&&r.colorMask(!0,!0,!0,!0)}_drawRenderPrimitiveSet(e,t,n){let r=this._gl,i=null,a=null,o=0;for(let s of t)if(s._activeFrameId==this._frameId){i!=s._material._program&&(i=s._material._program,i.use(),i.uniform.LIGHT_DIRECTION&&r.uniform3fv(i.uniform.LIGHT_DIRECTION,this._globalLightDir),i.uniform.LIGHT_COLOR&&r.uniform3fv(i.uniform.LIGHT_COLOR,this._globalLightColor),e.length==1&&(r.uniformMatrix4fv(i.uniform.PROJECTION_MATRIX,!1,e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.VIEW_MATRIX,!1,e[0].viewMatrix),this._motionVectorPass&&(r.uniformMatrix4fv(i.uniform.PREV_PROJECTION_MATRIX,!1,e[0].previousProjectionMatrix||e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_VIEW_MATRIX,!1,e[0].previousViewMatrix||e[0].viewMatrix)),i.uniform.CAMERA_POSITION&&r.uniform3fv(i.uniform.CAMERA_POSITION,this._cameraPositions[0]),i.uniform.EYE_INDEX&&r.uniform1i(i.uniform.EYE_INDEX,e[0].eyeIndex))),a!=s._material&&(this._bindMaterialState(s._material,a),s._material.bind(r,i,a),a=s._material),this._vaoExt?s._vao?this._vaoExt.bindVertexArrayOES(s._vao):(s._vao=this._vaoExt.createVertexArrayOES(),this._vaoExt.bindVertexArrayOES(s._vao),this._bindPrimitive(s)):(this._bindPrimitive(s,o),o=s._attributeMask);for(let t=0;t<e.length;++t){let o=e[t];if(e.length>1){if(o.viewport){let e=o.viewport;r.viewport(e.x,e.y,e.width,e.height)}this.multiview?(t==0&&(r.uniformMatrix4fv(i.uniform.LEFT_PROJECTION_MATRIX,!1,e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.LEFT_VIEW_MATRIX,!1,e[0].viewMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_PROJECTION_MATRIX,!1,e[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_VIEW_MATRIX,!1,e[1].viewMatrix),this._motionVectorPass&&(r.uniformMatrix4fv(i.uniform.PREV_LEFT_PROJECTION_MATRIX,!1,e[0].previousProjectionMatrix||e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_LEFT_VIEW_MATRIX,!1,e[0].previousViewMatrix||e[0].viewMatrix),r.uniformMatrix4fv(i.uniform.PREV_RIGHT_PROJECTION_MATRIX,!1,e[1].previousProjectionMatrix||e[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_RIGHT_VIEW_MATRIX,!1,e[1].previousViewMatrix||e[1].viewMatrix))),i.uniform.CAMERA_POSITION&&r.uniform3fv(i.uniform.CAMERA_POSITION,this._cameraPositions[t]),i.uniform.EYE_INDEX&&r.uniform1i(i.uniform.EYE_INDEX,o.eyeIndex)):(r.uniformMatrix4fv(i.uniform.PROJECTION_MATRIX,!1,o.projectionMatrix),r.uniformMatrix4fv(i.uniform.VIEW_MATRIX,!1,o.viewMatrix),this._motionVectorPass&&(r.uniformMatrix4fv(i.uniform.PREV_PROJECTION_MATRIX,!1,o.previousProjectionMatrix||o.projectionMatrix),r.uniformMatrix4fv(i.uniform.PREV_VIEW_MATRIX,!1,o.previousViewMatrix||o.viewMatrix)),i.uniform.CAMERA_POSITION&&r.uniform3fv(i.uniform.CAMERA_POSITION,this._cameraPositions[t]),i.uniform.EYE_INDEX&&r.uniform1i(i.uniform.EYE_INDEX,o.eyeIndex),n&&n.length&&r.uniform1ui(i.uniform.VIEW_ID,t)),n&&r.uniform1i(i.uniform.sortDepth,n.length>0),t==0&&n&&n.length&&(r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_PROJECTION_MATRIX,!1,e[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_VIEW_MATRIX,!1,e[0].viewMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_PROJECTION_MATRIX,!1,e[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_VIEW_MATRIX,!1,e[1].viewMatrix),r.uniform1f(i.uniform.rawValueToMeters,n[0].rawValueToMeters),n[0].projectionMatrix&&(r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_PROJECTION_MATRIX,!1,n[0].projectionMatrix),r.uniformMatrix4fv(i.uniform.LEFT_DEPTH_VIEW_MATRIX,!1,n[0].transform.inverse.matrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_PROJECTION_MATRIX,!1,n[1].projectionMatrix),r.uniformMatrix4fv(i.uniform.RIGHT_DEPTH_VIEW_MATRIX,!1,n[1].transform.inverse.matrix)),r.activeTexture(r.TEXTURE0+a._samplers.length),r.bindTexture(r.TEXTURE_2D_ARRAY,n[0].texture),r.uniform1i(i.uniform.depthColor,a._samplers.length))}for(let e of s._instances)e._activeFrameId==this._frameId&&(this._motionVectorPass&&(this._prepareMotionVectorInstance(e),r.uniformMatrix4fv(i.uniform.PREV_MODEL_MATRIX,!1,e._motionVectorPreviousWorldMatrix)),r.uniformMatrix4fv(i.uniform.MODEL_MATRIX,!1,e.worldMatrix),s._indexBuffer?r.drawElements(s._mode,s._elementCount,s._indexType,s._indexByteOffset):r.drawArrays(s._mode,0,s._elementCount));if(this.multiview)break}}}_prepareMotionVectorInstance(e){e._motionVectorFrameId!=this._frameId&&(e._motionVectorPreviousWorldMatrix?(a(e._motionVectorPreviousWorldMatrix,e._motionVectorCurrentWorldMatrix),a(e._motionVectorCurrentWorldMatrix,e.worldMatrix)):(e._motionVectorPreviousWorldMatrix=i(e.worldMatrix),e._motionVectorCurrentWorldMatrix=i(e.worldMatrix)),e._motionVectorFrameId=this._frameId)}addExternalTexture(e,t,n){this._textureCache[e]===void 0&&(this._textureCache[e]={}),this._textureCache[e]._complete=!0,this._textureCache[e]._texture=t,this._textureCache[e]._isArray=n}_getRenderTexture(e){if(!e)return null;let t=e.textureKey;if(!t)throw Error(`Texure does not have a valid key`);if(t in this._textureCache)return this._textureCache[t];{let n=this._gl,r=n.createTexture(),i=new ht(r);return this._textureCache[t]=i,e instanceof tt?i._isExternalTexture=!0:e instanceof et?(n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,e.format,e.width,e.height,0,e.format,e._type,e._data),this._setSamplerParameters(e),i._complete=!0):e.waitForComplete().then(()=>{n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,e.format,e.format,n.UNSIGNED_BYTE,e.source),this._setSamplerParameters(e),i._complete=!0,e instanceof $e&&e._video.addEventListener(`playing`,()=>{i._activeCallback=()=>{!e._video.paused&&!e._video.waiting&&(n.bindTexture(n.TEXTURE_2D,r),n.texImage2D(n.TEXTURE_2D,0,e.format,e.format,n.UNSIGNED_BYTE,e.source))}})}),i}}_setSamplerParameters(e){let t=this._gl,n=e.sampler,r=ct(e.width)&&ct(e.height),i=r&&e.mipmap;i&&t.generateMipmap(t.TEXTURE_2D);let a=n.minFilter||(i?t.LINEAR_MIPMAP_LINEAR:t.LINEAR),o=n.wrapS||(r?t.REPEAT:t.CLAMP_TO_EDGE),s=n.wrapT||(r?t.REPEAT:t.CLAMP_TO_EDGE);t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,n.magFilter||t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,a),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,o),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,s)}_getProgramKey(e,t){let n=`${e}:`;for(let e in t)n+=`${e}=${t[e]},`;return n}_getMaterialProgram(e,t){let n=e.materialName;e.useDepth=this.useDepth;let r=e.vertexSource,i=this._motionVectorPass?`
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
`;let n=(i.match(st)?``:`precision ${this._defaultFragPrecision} float;\n`)+i;this._motionVectorPass||(this._useDepth?n+=this.multiview?`
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
`));let u=new qe(this._gl,t,n,rt,a,c,l);return this._programCache[s]=u,u.onNextUse(t=>{for(let n=0;n<e._samplers.length;++n){let r=e._samplers[n],i=t.uniform[r._uniformName];i&&this._gl.uniform1i(i,n)}}),u}}_bindPrimitive(e,t){let n=this._gl;if(t!=e._attributeMask)for(let t in rt)e._attributeMask&R[t]?n.enableVertexAttribArray(rt[t]):n.disableVertexAttribArray(rt[t]);for(let t of e._attributeBuffers){n.bindBuffer(n.ARRAY_BUFFER,t._buffer._buffer);for(let e of t._attributes)n.vertexAttribPointer(e._attrib_index,e._componentCount,e._componentType,e._normalized,e._stride,e._byteOffset)}e._indexBuffer?n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e._indexBuffer._buffer):n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,null)}_bindMaterialState(e,t=null){let n=this._gl,r=e._state,i=t?t._state:~r;if(r!=i){if(e._capsDiff(i)){gt(n,n.CULL_FACE,M.CULL_FACE,i,r),gt(n,n.BLEND,M.BLEND,i,r),gt(n,n.DEPTH_TEST,M.DEPTH_TEST,i,r),gt(n,n.STENCIL_TEST,M.STENCIL_TEST,i,r);let e=(r&M.COLOR_MASK)-(i&M.COLOR_MASK);if(e){let t=e>1;this._colorMaskNeedsReset=!t,n.colorMask(t,t,t,t)}let t=(r&M.DEPTH_MASK)-(i&M.DEPTH_MASK);t&&(this._depthMaskNeedsReset=!(t>1),n.depthMask(t>1));let a=(r&M.STENCIL_MASK)-(i&M.STENCIL_MASK);a&&n.stencilMask(a>1?255:0)}e._blendDiff(i)&&n.blendFuncSeparate(e.blendFuncSrc,e.blendFuncDst,n.ONE,n.ONE_MINUS_SRC_ALPHA),e._depthFuncDiff(i)&&n.depthFunc(e.depthFunc)}}},xt=class extends F{constructor(){super(),this.baseColor=this.defineSampler(`baseColorTex`),this.metallicRoughness=this.defineSampler(`metallicRoughnessTex`),this.normal=this.defineSampler(`normalTex`),this.occlusion=this.defineSampler(`occlusionTex`),this.emissive=this.defineSampler(`emissiveTex`),this.baseColorFactor=this.defineUniform(`baseColorFactor`,[1,1,1,1]),this.metallicRoughnessFactor=this.defineUniform(`metallicRoughnessFactor`,[1,1]),this.occlusionStrength=this.defineUniform(`occlusionStrength`,1),this.modelExposure=this.defineUniform(`modelExposure`,1),this.modelOpacity=this.defineUniform(`modelOpacity`,1),this.emissiveFactor=this.defineUniform(`emissiveFactor`,[0,0,0])}get materialName(){return`PBR`}get vertexSource(){return`
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
}`}get positionOnlyMotionVector(){return!0}getProgramDefines(e){let t={};return e._attributeMask&R.COLOR_0&&(t.USE_VERTEX_COLOR=1),e._attributeMask&R.TEXCOORD_0&&(this.baseColor.texture&&(t.USE_BASE_COLOR_MAP=1),this.normal.texture&&e._attributeMask&R.TANGENT&&(t.USE_NORMAL_MAP=1),this.metallicRoughness.texture&&(t.USE_METAL_ROUGH_MAP=1),this.occlusion.texture&&(t.USE_OCCLUSION=1),this.emissive.texture&&(t.USE_EMISSIVE_TEXTURE=1)),(!this.metallicRoughness.texture||!(e._attributeMask&R.TEXCOORD_0))&&this.metallicRoughnessFactor.value[1]==1&&(t.FULLY_ROUGH=1),t}};let St=WebGLRenderingContext,Ct={JSON:1313821514,BIN:5130562};function wt(e){let t=RegExp(`^`+window.location.protocol,`i`);return!!e.match(t)}function Tt(e){return!!e.match(/^data:/)}function Et(e,t){return wt(e)||Tt(e)?e:t+e}function Dt(e){switch(e){case`SCALAR`:return 1;case`VEC2`:return 2;case`VEC3`:return 3;case`VEC4`:return 4;default:return 0}}var Ot=class{constructor(e){this.renderer=e,this._gl=e._gl}loadFromUrl(e){return fetch(e).then(t=>{let n=e.lastIndexOf(`/`),r=n===0?``:e.substring(0,n+1);if(e.endsWith(`.gltf`))return t.json().then(e=>this.loadFromJson(e,r));if(e.endsWith(`.glb`))return t.arrayBuffer().then(e=>this.loadFromBinary(e,r));throw Error(`Unrecognized file extension`)})}loadFromBinary(e,t){let n=new DataView(e,0,12),r=n.getUint32(0,!0),i=n.getUint32(4,!0),a=n.getUint32(8,!0);if(r!=1179937895)throw Error(`Invalid magic string in binary header.`);if(i!=2)throw Error(`Incompatible version in binary header.`);let o={},s=12;for(;s<a;){let t=new DataView(e,s,8),n=t.getUint32(0,!0),r=t.getUint32(4,!0);o[r]=e.slice(s+8,s+8+n),s+=n+8}if(!o[Ct.JSON])throw Error(`File contained no json chunk.`);let c=new TextDecoder(`utf-8`).decode(o[Ct.JSON]),l=JSON.parse(c);return this.loadFromJson(l,t,o[Ct.BIN])}loadFromJson(e,t,n){if(!e.asset)throw Error(`Missing asset description.`);if(e.asset.minVersion!=`2.0`&&e.asset.version!=`2.0`)throw Error(`Incompatible asset version.`);let r=[];if(n)r[0]=new jt({},t,n);else for(let n of e.buffers)r.push(new jt(n,t));let i=[];for(let t of e.bufferViews)i.push(new At(t,r));let a=[];if(e.images)for(let n of e.images)a.push(new jt(n,t));let o=[];if(e.textures)for(let t of e.textures){let e=a[t.source].texture(i);if(t.sampler){let n=n[t.sampler];e.sampler.minFilter=n.minFilter,e.sampler.magFilter=n.magFilter,e.sampler.wrapS=n.wrapS,e.sampler.wrapT=n.wrapT}o.push(e)}function s(e){return e?o[e.index]:null}let c=[];if(e.materials)for(let t of e.materials){let e=new xt,n=t.pbrMetallicRoughness||{};switch(e.baseColorFactor.value=n.baseColorFactor||[1,1,1,1],e.baseColor.texture=s(n.baseColorTexture),e.metallicRoughnessFactor.value=[n.metallicFactor??1,n.roughnessFactor??1],e.metallicRoughness.texture=s(n.metallicRoughnessTexture),e.normal.texture=s(t.normalTexture),e.occlusion.texture=s(t.occlusionTexture),e.occlusionStrength.value=t.occlusionTexture&&t.occlusionTexture.strength?t.occlusionTexture.strength:1,e.emissiveFactor.value=t.emissiveFactor||[0,0,0],e.emissive.texture=s(t.emissiveTexture),!e.emissive.texture&&t.emissiveFactor&&(e.emissive.texture=new nt(1,1,1,1)),t.alphaMode){case`BLEND`:e.state.blend=!0;break;case`MASK`:e.state.blend=!0;break;default:e.state.blend=!1}e.state.cullFace=!t.doubleSided,c.push(e)}let l=e.accessors,u=[];for(let t of e.meshes){let e=new kt;u.push(e);for(let n of t.primitives){let t=null;t=`material`in n?c[n.material]:new xt;let r=[],a=0,o=null,s=null;for(let e in n.attributes){let t=l[n.attributes[e]],c=i[t.bufferView];a=t.count;let u=new I(e,c.renderBuffer(this.renderer,St.ARRAY_BUFFER),Dt(t.type),t.componentType,c.byteStride||0,t.byteOffset||0);u.normalized=t.normalized||!1,e==`POSITION`&&(o=t.min,s=t.max),r.push(u)}let u=new L(r,a,n.mode);if(`indices`in n){let e=l[n.indices],t=i[e.bufferView];u.setIndexBuffer(t.renderBuffer(this.renderer,St.ELEMENT_ARRAY_BUFFER),e.byteOffset||0,e.componentType),u.indexType=e.componentType,u.indexByteOffset=e.byteOffset||0,u.elementCount=e.count}o&&s&&u.setBounds(o,s);let d=this.renderer.createRenderPrimitive(u,t);d.vertexStreams=Object.fromEntries(r.map(e=>[e.name,{buffer:e.buffer,byteOffset:e.byteOffset,stride:e.stride,count:l[n.attributes[e.name]].count}])),e.primitives.push(d)}}let d=new A,f=e.scenes[e.scene];for(let t of f.nodes){let n=e.nodes[t];d.addNode(this.processNodes(n,e.nodes,u))}return d}processNodes(e,t,n){let r=new A;if(r.name=e.name,`mesh`in e){let t=n[e.mesh];for(let e of t.primitives)r.addRenderPrimitive(e)}if(e.matrix?r.matrix=new Float32Array(e.matrix):(e.translation||e.rotation||e.scale)&&(e.translation&&(r.translation=new Float32Array(e.translation)),e.rotation&&(r.rotation=new Float32Array(e.rotation)),e.scale&&(r.scale=new Float32Array(e.scale))),e.children)for(let i of e.children){let e=t[i];r.addNode(this.processNodes(e,t,n))}return r}},kt=class{constructor(){this.primitives=[]}},At=class{constructor(e,t){this.buffer=t[e.buffer],this.byteOffset=e.byteOffset||0,this.byteLength=e.byteLength||null,this.byteStride=e.byteStride,this._viewPromise=null,this._renderBuffer=null}dataView(){return this._viewPromise||=this.buffer.arrayBuffer().then(e=>new DataView(e,this.byteOffset,this.byteLength)),this._viewPromise}renderBuffer(e,t){return this._renderBuffer||=e.createRenderBuffer(t,this.dataView()),this._renderBuffer}},jt=class{constructor(e,t,n){this.json=e,this.baseUrl=t,this._dataPromise=null,this._texture=null,n&&(this._dataPromise=Promise.resolve(n))}arrayBuffer(){if(!this._dataPromise){if(Tt(this.json.uri)){let e=this.json.uri.replace(`data:application/octet-stream;base64,`,``),t=Uint8Array.from(atob(e),e=>e.charCodeAt(0));return this._dataPromise=Promise.resolve(t.buffer),this._dataPromise}this._dataPromise=fetch(Et(this.json.uri,this.baseUrl)).then(e=>e.arrayBuffer())}return this._dataPromise}texture(e){if(!this._texture){let t=new Image;this._texture=new Qe(t),this.json.uri?t.src=Tt(this.json.uri)?this.json.uri:`${this.baseUrl}${this.json.uri}`:(this._texture.genDataKey(),e[this.json.bufferView].dataView().then(e=>{let n=new Blob([e],{type:this.json.mimeType});t.src=window.URL.createObjectURL(n)}))}return this._texture}};let Mt=/* @__PURE__ */ new WeakMap;var Nt=class extends A{constructor(e){super(),this._url=e.url,this._promise=null,this._resolver=null,this._rejecter=null}onRendererChanged(e){let t=Mt.get(e);t||(t=new Ot(e),Mt.set(e,t)),!this._resolver&&this._promise&&(this._promise=null),this._ensurePromise(),t.loadFromUrl(this._url).then(e=>{this.addNode(e),this._resolver(e.waitForComplete()),this._resolver=null,this._rejecter=null}).catch(e=>{this._rejecter&&this._rejecter(e),this._resolver=null,this._rejecter=null})}_ensurePromise(){return this._promise||=new Promise((e,t)=>{this._resolver=e,this._rejecter=t}),this._promise}waitForComplete(){return this._ensurePromise()}};let Pt={Handedness:Object.freeze({NONE:`none`,LEFT:`left`,RIGHT:`right`}),ComponentState:Object.freeze({DEFAULT:`default`,TOUCHED:`touched`,PRESSED:`pressed`}),ComponentProperty:Object.freeze({BUTTON:`button`,X_AXIS:`xAxis`,Y_AXIS:`yAxis`,STATE:`state`}),ComponentType:Object.freeze({TRIGGER:`trigger`,SQUEEZE:`squeeze`,TOUCHPAD:`touchpad`,THUMBSTICK:`thumbstick`,BUTTON:`button`}),ButtonTouchThreshold:.05,AxisTouchThreshold:.1,VisualResponseProperty:Object.freeze({TRANSFORM:`transform`,VISIBILITY:`visibility`})};async function Ft(e){let t=await fetch(e);if(t.ok)return t.json();throw Error(t.statusText)}async function It(e){if(!e)throw Error(`No basePath supplied`);return await Ft(`${e}/profilesList.json`)}async function Lt(e,t,n=null,r=!0){if(!e)throw Error(`No xrInputSource supplied`);if(!t)throw Error(`No basePath supplied`);let i=await It(t),a;if(e.profiles.some(e=>{let n=i[e];return n&&(a={profileId:e,profilePath:`${t}/${n.path}`,deprecated:!!n.deprecated}),!!a}),!a){if(!n)throw Error(`No matching profile name found`);let e=i[n];if(!e)throw Error(`No matching profile name found and default profile "${n}" missing.`);a={profileId:n,profilePath:`${t}/${e.path}`,deprecated:!!e.deprecated}}let o=await Ft(a.profilePath),s;if(r){let t;if(t=e.handedness===`any`?o.layouts[Object.keys(o.layouts)[0]]:o.layouts[e.handedness],!t)throw Error(`No matching handedness, ${e.handedness}, in profile ${a.profileId}`);t.assetPath&&(s=a.profilePath.replace(`profile.json`,t.assetPath))}return{profile:o,assetPath:s}}Pt.ComponentState.DEFAULT;let Rt=WebGLRenderingContext,zt=new Uint8Array([255,255,255,1,255,255,255,2,191,191,191,4,204,204,204,5,219,219,219,7,204,204,204,10,216,216,216,13,210,210,210,17,206,206,206,21,206,206,206,26,206,206,206,31,205,205,205,36,200,200,200,42,201,201,201,47,201,201,201,52,201,201,201,57,201,201,201,61,200,200,200,65,203,203,203,68,238,238,238,135,250,250,250,200,249,249,249,201,249,249,249,201,250,250,250,201,250,250,250,201,249,249,249,201,249,249,249,201,250,250,250,200,238,238,238,135,203,203,203,68,200,200,200,65,201,201,201,61,201,201,201,57,201,201,201,52,201,201,201,47,200,200,200,42,205,205,205,36,206,206,206,31,206,206,206,26,206,206,206,21,210,210,210,17,216,216,216,13,204,204,204,10,219,219,219,7,204,204,204,5,191,191,191,4,255,255,255,2,255,255,255,1]),Bt=[1,1,1,.25],Vt=.004,Ht=.007,Ut=[1,1,1,1],Wt=[.5,.5,.5,.25],Gt={controllers:!0,lasers:!0,cursors:!0};var Kt=class extends F{constructor(){super(),this.renderOrder=P.ADDITIVE,this.state.cullFace=!1,this.state.blend=!0,this.state.blendFuncSrc=Rt.ONE,this.state.blendFuncDst=Rt.ONE,this.state.depthMask=!1,this.laser=this.defineSampler(`diffuse`),this.laser.texture=new et(zt,48,1),this.laserColor=this.defineUniform(`laserColor`,Bt)}get materialName(){return`INPUT_LASER`}get vertexSource(){return`
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
    }`}};let qt=`
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
}`,Jt=`
precision mediump float;

uniform vec4 cursorColor;
in float vLuminance;
in float vOpacity;

vec4 fragment_main() {
  vec3 color = cursorColor.rgb * vLuminance;
  float opacity = cursorColor.a * vOpacity;
  return vec4(color * opacity, opacity);
}`;var Yt=class extends F{constructor(){super(),this.renderOrder=P.ADDITIVE,this.state.cullFace=!1,this.state.blend=!0,this.state.blendFuncSrc=Rt.ONE,this.state.depthMask=!1,this.cursorColor=this.defineUniform(`cursorColor`,Ut)}get materialName(){return`INPUT_CURSOR`}get vertexSource(){return qt}get fragmentSource(){return Jt}},Xt=class extends F{constructor(){super(),this.renderOrder=P.ADDITIVE,this.state.cullFace=!1,this.state.blend=!0,this.state.blendFuncSrc=Rt.ONE,this.state.depthFunc=Rt.GEQUAL,this.state.depthMask=!1,this.cursorColor=this.defineUniform(`cursorColor`,Wt)}get materialName(){return`INPUT_CURSOR_2`}get vertexSource(){return qt}get fragmentSource(){return Jt}},Zt=class extends A{constructor(){super(),this._maxInputElements=32,this._controllers=null,this._lasers=null,this._cursors=null,this._activeControllers=0,this._activeLasers=0,this._activeCursors=0,this._blurred=!1}onRendererChanged(e){this._controllers=null,this._lasers=null,this._cursors=null,this._activeControllers=0,this._activeLasers=0,this._activeCursors=0}useProfileControllerMeshes(e){e.addEventListener(`inputsourceschange`,e=>{for(let t of e.added)t.targetRayMode==`tracked-pointer`&&Lt(t,`https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles`).then(({profile:e,assetPath:n})=>{this.setControllerMesh(new Nt({url:n}),t.handedness,t.profiles[0])})}),e.addEventListener(`visibilitychange`,e=>{e.session.visibilityState===`visible-blurred`?this._blurred=!0:e.session.visibilityState===`visible`&&(this._blurred=!1)})}setControllerMesh(e,t=`right`,n=``){this._controllers||={},this._controllers[n+`_`+t]={nodes:[e],activeCount:0},e.visible=!1,this.addNode(e)}addController(e,t=`right`,n=``){if(!this._controllers||this._blurred)return;let r=this._controllers[n+`_`+t];if(!r)return;let i=null;r.activeCount<r.nodes.length?i=r.nodes[r.activeCount]:(i=r.nodes[0].clone(),this.addNode(i),r.nodes.push(i)),r.activeCount=(r.activeCount+1)%this._maxInputElements,i.matrix=e,i.visible=!0}hideController(e=`right`,t=``){this._controllers&&this._controllers[t+`_`+e]&&(controllerNode.visible=!0)}addLaserPointer(e){if(this._blurred)return;!this._lasers&&this._renderer&&(this._lasers=[this._createLaserMesh()],this.addNode(this._lasers[0]));let t=null;this._activeLasers<this._lasers.length?t=this._lasers[this._activeLasers]:(t=this._lasers[0].clone(),this.addNode(t),this._lasers.push(t)),this._activeLasers=(this._activeLasers+1)%this._maxInputElements,t.matrix=e.matrix,t.visible=!0}addCursor(e){if(this._blurred)return;!this._cursors&&this._renderer&&(this._cursors=[this._createCursorMesh()],this.addNode(this._cursors[0]));let t=null;this._activeCursors<this._cursors.length?t=this._cursors[this._activeCursors]:(t=this._cursors[0].clone(),this.addNode(t),this._cursors.push(t)),this._activeCursors=(this._activeCursors+1)%this._maxInputElements,t.translation=e,t.visible=!0}reset(e){if(e||=Gt,this._controllers&&e.controllers)for(let e in this._controllers){let t=this._controllers[e];t.activeCount=0;for(let e of t.nodes)e.visible=!1}if(this._lasers&&e.lasers){for(let e of this._lasers)e.visible=!1;this._activeLasers=0}if(this._cursors&&e.cursors){for(let e of this._cursors)e.visible=!1;this._activeCursors=0}}_createLaserMesh(){let e=this._renderer._gl,t=.005,n=[0,t,0,0,1,0,t,-1,0,0,0,-.005,0,1,1,0,-.005,-1,1,0,t,0,0,0,1,t,0,-1,0,0,-.005,0,0,1,1,-.005,0,-1,1,0,0,-.005,0,0,1,0,-.005,-1,0,0,0,t,0,1,1,0,t,-1,1,0,-.005,0,0,0,1,-.005,0,-1,0,0,t,0,0,1,1,t,0,-1,1,0],r=[0,1,2,1,3,2,4,5,6,5,7,6,8,9,10,9,11,10,12,13,14,13,15,14],i=this._renderer.createRenderBuffer(e.ARRAY_BUFFER,new Float32Array(n)),a=this._renderer.createRenderBuffer(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(r)),o=r.length,s=new L([new I(`POSITION`,i,3,e.FLOAT,20,0),new I(`TEXCOORD_0`,i,2,e.FLOAT,20,12)],o);s.setIndexBuffer(a);let c=new Kt,l=this._renderer.createRenderPrimitive(s,c),u=new A;return u.addRenderPrimitive(l),u}_createCursorMesh(){let e=this._renderer._gl,t=[],n=[],r=2*Math.PI/16;for(let e=0;e<16;++e){let i=e*r,a=Math.cos(i),o=Math.sin(i);t.push(a*Vt,o*Vt,1,.9),e>1&&n.push(0,e-1,e)}for(let e=0;e<16;++e){let i=e*r,a=Math.cos(i),o=Math.sin(i);if(t.push(a*Vt,o*Vt,.5,.75),t.push(a*Ht,o*Ht,0,0),e>0){let t=16+e*2;n.push(t-2,t-1,t),n.push(t-1,t+1,t)}}n.push(46,47,16),n.push(47,17,16);let i=this._renderer.createRenderBuffer(e.ARRAY_BUFFER,new Float32Array(t)),a=this._renderer.createRenderBuffer(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(n)),o=n.length,s=new L([new I(`POSITION`,i,4,e.FLOAT,16,0)],o);s.setIndexBuffer(a);let c=new Yt,l=new Xt,u=this._renderer.createRenderPrimitive(s,c),d=this._renderer.createRenderPrimitive(s,l),f=new A;return f.addRenderPrimitive(u),f.addRenderPrimitive(d),f}},Qt=class extends F{get materialName(){return`SEVEN_SEGMENT_TEXT`}get vertexSource(){return`
    in vec2 POSITION;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      return proj * view * model * vec4(POSITION, 0.0, 1.0);
    }`}get fragmentSource(){return`
    precision mediump float;
    const vec4 fragColor = vec4(0.0, 1.0, 0.0, 1.0);

    vec4 fragment_main() {
      return fragColor;
    }`}},$t=class extends A{constructor(){super(),this._text=``,this._charNodes=[]}onRendererChanged(e){this.clearNodes(),this._charNodes=[];let t=[],n={},r=[],i=.5,a=.25;function o(e,r,i,a,o){let s=t.length/2;t.push(r,i,a,i,a,o,r,o),n[e]=[s,s+2,s+1,s,s+3,s+2]}let s={};function c(e,t){let i={character:e,offset:r.length*2,count:0};for(let e=0;e<t.length;++e){let a=t[e],o=n[a];i.count+=o.length,r.push(...o)}s[e]=i}o(0,-1,1,i,.75),o(1,-1,a*.5,i,-.125),o(2,-1,-.75,i,-1),o(3,-1,1,-.75,-.125),o(4,.25,1,i,-.125),o(5,-1,a*.5,-.75,-1),o(6,.25,a*.5,i,-1),c(`0`,[0,2,3,4,5,6]),c(`1`,[4,6]),c(`2`,[0,1,2,4,5]),c(`3`,[0,1,2,4,6]),c(`4`,[1,3,4,6]),c(`5`,[0,1,2,3,6]),c(`6`,[0,1,2,3,5,6]),c(`7`,[0,4,6]),c(`8`,[0,1,2,3,4,5,6]),c(`9`,[0,1,2,3,4,6]),c(`A`,[0,1,3,4,5,6]),c(`B`,[1,2,3,5,6]),c(`C`,[0,2,3,5]),c(`D`,[1,2,4,5,6]),c(`E`,[0,1,2,4,6]),c(`F`,[0,1,3,5]),c(`P`,[0,1,3,4,5]),c(`-`,[1]),c(` `,[]),c(`_`,[2]);let l=e.gl,u=e.createRenderBuffer(l.ARRAY_BUFFER,new Float32Array(t)),d=e.createRenderBuffer(l.ELEMENT_ARRAY_BUFFER,new Uint16Array(r)),f=new L([new I(`POSITION`,u,2,l.FLOAT,8,0)],r.length);f.setIndexBuffer(d);let p=new Qt;this._charPrimitives={};for(let t in s){let n=s[t];f.elementCount=n.count,f.indexByteOffset=n.offset,this._charPrimitives[t]=e.createRenderPrimitive(f,p)}this.text=this._text}get text(){return this._text}set text(e){this._text=e;let t=0,n=null;for(;t<e.length;++t)if(n=e[t]in this._charPrimitives?this._charPrimitives[e[t]]:this._charPrimitives._,this._charNodes.length<=t){let e=new A;e.addRenderPrimitive(n),e.translation=[t*2,0,0],this._charNodes.push(e),this.addNode(e)}else this._charNodes[t].clearRenderPrimitives(),this._charNodes[t].addRenderPrimitive(n),this._charNodes[t].visible=!0;for(;t<this._charNodes.length;++t)this._charNodes[t].visible=!1}},en=class extends F{get materialName(){return`STATS_VIEWER`}get vertexSource(){return`
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
    }`}};function z(e){return .9/30*e-.45}function B(e){return .7/90*Math.min(e,90)-.45}function tn(e){return{r:Math.max(0,Math.min(1,1-e/60)),g:Math.max(0,Math.min(1,(e-15)/75)),b:Math.max(0,Math.min(1,(e-15)/75))}}let nn=window.performance&&performance.now?performance.now.bind(performance):Date.now;var rn=class extends A{constructor(){super(),this._performanceMonitoring=!1,this._startTime=nn(),this._prevFrameTime=this._startTime,this._prevGraphUpdateTime=this._startTime,this._frames=0,this._fpsAverage=0,this._fpsMin=0,this._fpsStep=this._performanceMonitoring?1e3:250,this._lastSegment=0,this._fpsVertexBuffer=null,this._fpsRenderPrimitive=null,this._fpsNode=null,this._sevenSegmentNode=new $t,this._sevenSegmentNode.matrix=new Float32Array([.075,0,0,0,0,.075,0,0,0,0,1,0,-.3625,.3625,.02,1])}onRendererChanged(e){this.clearNodes();let t=e.gl,n=[],r=[];for(let e=0;e<30;++e){n.push(z(e),B(0),.02,0,1,1),n.push(z(e+1),B(0),.02,0,1,1),n.push(z(e),B(0),.02,0,1,1),n.push(z(e+1),B(0),.02,0,1,1);let t=e*4;r.push(t,t+3,t+1,t+3,t,t+2)}function i(e,t,i,a,o,s,c,l){let u=n.length/6;n.push(e,t,o,s,c,l),n.push(i,a,o,s,c,l),n.push(e,a,o,s,c,l),n.push(i,t,o,s,c,l),r.push(u,u+1,u+2,u,u+3,u+1)}i(-.5,-.5,.5,.5,0,0,0,.125),i(-.45,-.45,.45,.25,.01,0,0,.4),i(-.45,B(30),.45,B(32),.015,.5,0,.5),i(-.45,B(60),.45,B(62),.015,.2,0,.75),this._fpsVertexBuffer=e.createRenderBuffer(t.ARRAY_BUFFER,new Float32Array(n),t.DYNAMIC_DRAW);let a=e.createRenderBuffer(t.ELEMENT_ARRAY_BUFFER,new Uint16Array(r)),o=new L([new I(`POSITION`,this._fpsVertexBuffer,3,t.FLOAT,24,0),new I(`COLOR_0`,this._fpsVertexBuffer,3,t.FLOAT,24,12)],r.length);o.setIndexBuffer(a),o.setBounds([-.5,-.5,0],[.5,.5,.015]),this._fpsRenderPrimitive=e.createRenderPrimitive(o,new en),this._fpsNode=new A,this._fpsNode.addRenderPrimitive(this._fpsRenderPrimitive),this.addNode(this._fpsNode),this.addNode(this._sevenSegmentNode)}get performanceMonitoring(){return this._performanceMonitoring}set performanceMonitoring(e){this._performanceMonitoring=e,this._fpsStep=e?1e3:250}begin(){this._startTime=nn()}end(){let e=nn(),t=1e3/(e-this._prevFrameTime);if(this._prevFrameTime=e,this._fpsMin=this._frames?Math.min(this._fpsMin,t):t,this._frames++,e>this._prevGraphUpdateTime+this._fpsStep){let t=e-this._prevGraphUpdateTime;this._fpsAverage=Math.round(1e3/(t/this._frames)),this._updateGraph(this._fpsMin,this._fpsAverage),this._performanceMonitoring&&console.log(`Average FPS: ${this._fpsAverage} Min FPS: ${this._fpsMin}`),this._prevGraphUpdateTime=e,this._frames=0,this._fpsMin=0}}_updateGraph(e,t){let n=tn(e),r=B(e-1),i=B(t+1),a=[z(this._lastSegment),i,.02,n.r,n.g,n.b,z(this._lastSegment+1),i,.02,n.r,n.g,n.b,z(this._lastSegment),r,.02,n.r,n.g,n.b,z(this._lastSegment+1),r,.02,n.r,n.g,n.b];n.r=.2,n.g=1,n.b=.2,this._lastSegment==29?(this._renderer.updateRenderBuffer(this._fpsVertexBuffer,new Float32Array(a),this._lastSegment*24*4),a=[z(0),B(90),.02,n.r,n.g,n.b,z(.25),B(90),.02,n.r,n.g,n.b,z(0),B(0),.02,n.r,n.g,n.b,z(.25),B(0),.02,n.r,n.g,n.b],this._renderer.updateRenderBuffer(this._fpsVertexBuffer,new Float32Array(a),0)):(a.push(z(this._lastSegment+1),B(90),.02,n.r,n.g,n.b,z(this._lastSegment+1.25),B(90),.02,n.r,n.g,n.b,z(this._lastSegment+1),B(0),.02,n.r,n.g,n.b,z(this._lastSegment+1.25),B(0),.02,n.r,n.g,n.b),this._renderer.updateRenderBuffer(this._fpsVertexBuffer,new Float32Array(a),this._lastSegment*24*4)),this._lastSegment=(this._lastSegment+1)%30,this._sevenSegmentNode.text=`${this._fpsAverage.toString().padEnd(3)}FP5`}},an=class extends ut{constructor(e,t,n,r){super(e?e.projectionMatrix:null,e?e.transform:null,n||(t&&e?t.getViewport(e):null),e?e.eye:`left`,r)}},on=class extends A{constructor(){super(),this._timestamp=-1,this._frameDelta=0,this._statsStanding=!1,this._stats=null,this._statsEnabled=!1,this.enableStats(!0),this._inputRenderer=null,this._resetInputEndFrame=!0,this._lastTimestamp=0,this._hoverFrame=0,this._hoveredNodes=[],this.clear=!0}setRenderer(e){this._setRenderer(e)}loseRenderer(){this._renderer&&(this._stats=null,this._renderer=null,this._inputRenderer=null)}get inputRenderer(){return this._inputRenderer||(this._inputRenderer=new Zt,this.addNode(this._inputRenderer)),this._inputRenderer}updateInputSources(e,t){let n=[],r=this._hoverFrame;this._hoverFrame++;for(let i of e.session.inputSources){let a=e.getPose(i.targetRaySpace,t);if(!a)continue;i.targetRayMode==`tracked-pointer`&&this.inputRenderer.addLaserPointer(a.transform);let o=this.hitTest(a.transform);if(o)this.inputRenderer.addCursor(o.intersection),o.node._hoverFrameId!=r&&o.node.onHoverStart(),o.node._hoverFrameId=this._hoverFrame,n.push(o.node);else{let e=new fe(a.transform.matrix),t=_(e.origin[0],e.origin[1],e.origin[2]);y(t,t,[e.direction[0]*1,e.direction[1]*1,e.direction[2]*1]),this.inputRenderer.addCursor(t)}if(i.gripSpace){let n=e.getPose(i.gripSpace,t);n&&this.inputRenderer.addController(n.transform.matrix,i.handedness,i.profiles[0])}}for(let e of this._hoveredNodes)e._hoverFrameId!=this._hoverFrame&&e.onHoverEnd();this._hoveredNodes=n}handleSelect(e,t,n){let r=t.getPose(e.targetRaySpace,n);r&&this.handleSelectPointer(r.transform)}handleSelectPointer(e){if(e){let t=this.hitTest(e);t&&t.node.handleSelect()}}enableStats(e){e!=this._statsEnabled&&(this._statsEnabled=e,e?(this._stats=new rn,this._stats.selectable=!0,this.addNode(this._stats),this._statsStanding?this._stats.translation=[0,1.4,-.75]:this._stats.translation=[0,-.3,-.5],this._stats.scale=[.3,.3,.3],oe(this._stats.rotation,-45,0,0)):e||(this._stats&&=(this.removeNode(this._stats),null)))}standingStats(e){this._statsStanding=e,this._stats&&(this._statsStanding?this._stats.translation=[0,1.4,-.75]:this._stats.translation=[0,-.3,-.5],this._stats.scale=[.3,.3,.3],oe(this._stats.rotation,-45,0,0))}draw(e,t,n){let r=new ut(e,t);n&&(r.eye=n),this.drawViewArray([r])}drawXRFrame(e,t,n,r){if(!this._renderer||!t)return;let i=this._renderer.gl,a=this._renderer,o=e.session,s=o.renderState.baseLayer,c=[];if(s){i.bindFramebuffer(i.FRAMEBUFFER,s.framebuffer);for(let e of t.views)c.push(new an(e,s))}else{if(s=n||o.renderState.layers[0],i.bindFramebuffer(i.FRAMEBUFFER,a.xrFramebuffer),s.usingTextureArray??!1){var l=0;for(let e of t.views){let t=a.getXrBinding(o).getViewSubImage(s,e);i.framebufferTextureLayer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,t.colorTexture,0,l),i.framebufferTextureLayer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,t.depthStencilTexture,0,l),c=[new an(e,t,t.viewport)],this.clear&&i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT),this.drawViewArray(c,r),++l}return}for(let e of t.views){let n=a.getXrBinding(o).getViewSubImage(s,e);e==t.views[0]&&(a.multisampledMultiview?a.multiviewExtension.framebufferTextureMultisampleMultiviewOVR(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,n.colorTexture,0,a.maxSamples,0,2):a.multiview?a.multiviewExtension.framebufferTextureMultiviewOVR(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,n.colorTexture,0,0,2):i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,n.colorTexture,0),n.depthStencilTexture&&(a.multisampledMultiview?a.multiviewExtension.framebufferTextureMultisampleMultiviewOVR(i.DRAW_FRAMEBUFFER,i.DEPTH_ATTACHMENT,n.depthStencilTexture,0,a.maxSamples,0,2):a.multiview?a.multiviewExtension.framebufferTextureMultiviewOVR(i.DRAW_FRAMEBUFFER,i.DEPTH_ATTACHMENT,n.depthStencilTexture,0,0,2):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,n.depthStencilTexture,0))),c.push(new an(e,n,n.viewport))}}this.clear&&i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT),this.drawViewArray(c,r)}drawViewArray(e,t){this._renderer&&this._renderer.drawViews(e,this,t)}startFrame(){let e=this._timestamp;return this._timestamp=performance.now(),this._stats&&this._stats.begin(),this._frameDelta=e>=0?this._timestamp-e:0,this._update(this._timestamp,this._frameDelta),this._frameDelta}endFrame(){this._inputRenderer&&this._resetInputEndFrame&&this._inputRenderer.reset(),this._stats&&this._stats.end()}onLoadScene(e){return Promise.resolve()}};m();let V=null,sn=null,cn=null,H=null,U=null,W=null,G=new on;if(G.enableStats(!1),new URLSearchParams(location.search).get(`reset`)===`1`)try{localStorage.removeItem(`bellbrook-yowie-appearance`),localStorage.removeItem(`tradesight-yowie-exposure`)}catch{}let ln=new je,K=new Ie(G),q=new Oe(ln,K,null),J=new Se;q.appearance=J;let un=new we(`tradesight-yowie-exposure`,1.5),dn=null,Y=new A;Y.visible=!1,G.addNode(Y);let X=(new URLSearchParams(location.search).get(`model`)||`companion`)!==`sunflower`,Z=!1,fn=!1,pn=!1,mn=new Nt({url:X?`media/gltf/yowie-v1/yowie.gltf`:`media/gltf/sunflower/sunflower.gltf`}),hn=document.querySelector(`#model-status`);document.querySelector(`#model-choice`).value=X?`companion`:`sunflower`,document.querySelector(`#model-choice`).addEventListener(`change`,e=>{let t=new URL(location.href);t.searchParams.set(`model`,e.target.value),location.href=t.href}),hn.textContent=`Loading `+(X?`Bellbrook Yowie`:`sunflower`)+` preview before AR...`,Y.addNode(mn);let Q=new Nt({url:`media/gltf/reticle/reticle.gltf`});Q.visible=!1,G.addNode(Q);let $=new _e(G,Q,ln,q,K);q.navigation=$;let gn=[];G.clear=!1;async function _n(){try{if(U=lt({xrCompatible:!0}),!U)throw Error(`WebGL 2 is unavailable`);U.canvas.width=420,U.canvas.height=320,U.canvas.setAttribute(`aria-label`,`Loaded model preview`),document.querySelector(`#preview`).append(U.canvas),W=new bt(U),G.setRenderer(W),await Promise.all([mn.waitForComplete(),Q.waitForComplete()]),X&&(hn.textContent=`Loading walk animation...`,dn=await Te.load(W,mn,`media/gltf/yowie-motion-v1/`,!1),un.bind(mn),J.bind(W,mn)),Z=!0,Y.visible=!0,hn.textContent=(X?`Bellbrook Yowie loaded. Idle and Walk animations ready.`:`Sunflower loaded.`)+` Start AR when you can see it below.`,V.enabled=fn,requestAnimationFrame(vn)}catch(e){Z=!1,V.enabled=!1,hn.textContent=`Model load failed: `+(e?.message||String(e)),document.querySelector(`#preview`).textContent=`No model loaded. AR is disabled.`}}function vn(e){if(requestAnimationFrame(vn),pn||!Z)return;let t=r(),n=r();d(t,Math.PI/3,420/320,.05,100),f(n,X?[0,1,2]:[0,.3,1.1],X?[0,.93,0]:[0,.25,0],[0,1,0]),dn?.update(e,!1,1),G.startFrame(),U.bindFramebuffer(U.FRAMEBUFFER,null),U.viewport(0,0,420,320),U.clearColor(.12,.17,.2,1),U.clear(U.COLOR_BUFFER_BIT|U.DEPTH_BUFFER_BIT),G.drawViewArray([new ut(t,{inverse:{matrix:n},position:{x:0,y:1,z:2.5}})]),G.endFrame()}function yn(){V=new Ge({onRequestSession:bn,onEndSession:Sn,textEnterXRTitle:`START AR`,textXRNotFoundTitle:`AR NOT FOUND`,textExitXRTitle:`EXIT  AR`}),document.querySelector(`header`).insertBefore(V.domElement,hn),navigator.xr&&navigator.xr.isSessionSupported(`immersive-ar`).then(e=>{fn=e,V.enabled=e&&Z})}function bn(){return Z?(pn=!0,Y.visible=!1,navigator.xr.requestSession(`immersive-ar`,X?{requiredFeatures:[`local`,`hit-test`],optionalFeatures:[`dom-overlay`],domOverlay:{root:document.querySelector(`#walking-overlay`)}}:{requiredFeatures:[`local`,`hit-test`]}).then(e=>{V.setSession(e),xn(e)}).catch(e=>{throw pn=!1,Y.visible=!0,hn.textContent=`AR could not start: `+(e?.message||String(e)),e})):Promise.reject(/* @__PURE__ */ Error(`Wait for the model preview before starting AR.`))}function xn(e){e.addEventListener(`end`,Cn),X&&(q.begin(e),$.begin(e)),e.addEventListener(`select`,Tn),U||(U=lt({xrCompatible:!0}),W=new bt(U),G.setRenderer(W)),e.updateRenderState({baseLayer:new XRWebGLLayer(e,U)}),e.requestReferenceSpace(`viewer`).then(t=>{cn=t,e.requestHitTestSource({space:cn}).then(e=>{H=e})}),e.requestReferenceSpace(`local`).then(t=>{sn=t,X&&ln.start(e,t),e.requestAnimationFrame(En)})}function Sn(e){try{H?.cancel()}catch{}H=null,e.end()}function Cn(e){V.setSession(null),q.end(),$.end(),J.clear();try{H?.cancel()}catch{}H=null,Q.visible=!1;for(let e of gn)G.removeNode(e);gn=[],pn=!1,Y.visible=!0}function wn(e){let t=Y.clone();if(t.visible=!0,t.matrix=e,G.addNode(t),gn.push(t),J.attach(t),X&&(q.attach(t),$.attach(t)),gn.length>1){let e=gn.shift();G.removeNode(e)}}m(),m();function Tn(e){if(Q.visible&&Z){if(X&&K.building){K.select(Q.matrix),q.status.textContent=K.status?.textContent||`Wall updated.`;return}if(X&&$.marking){$.addStop(Q.matrix);return}if(X&&$.scanning&&!q.placing){ln.recordScan(Q.matrix),$.sync();return}wn(Q.matrix)}}function En(e,t){let n=t.session,r=t.getViewerPose(sn);if(Q.visible=!1,H&&r){let e=t.getHitTestResults(H);if(e.length>0){let t=e[0].getPose(sn);Q.visible=!0,Q.matrix=t.transform.matrix}}X&&(ln.update(t,e,Q.visible?Q.matrix:null,!!r),Q.visible&&!ke(Q.matrix,e)&&(Q.visible=!1)),X&&$.observe(e,r,Q.visible?Q.matrix:null),J.update(),q.update(e,r),r&&dn?.update(e,q.moving,q.motionRatio,{distance:q.travelDistance||0,scale:J.size,cycleDistance:.72511}),X&&!q.placing&&!K.building&&!$.scanning&&!$.marking&&(Q.visible=!1),G.startFrame(),n.requestAnimationFrame(En),G.drawXRFrame(t,r),G.endFrame()}yn(),_n(),window.dispatchEvent(new Event(`reference-ready`))})();