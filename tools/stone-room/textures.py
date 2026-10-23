"""Original deterministic procedural PBR maps; no third-party texture licenses."""
from PIL import Image
import numpy as np
from pathlib import Path
out=Path(__file__).resolve().parents[2]/'public/stone-room/assets/textures';out.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(9403);N=512
def noise(scale):
 a=Image.fromarray(np.uint8(rng.random((scale,scale))*255)).resize((N,N),Image.Resampling.BICUBIC)
 return np.asarray(a,dtype=float)/255
Y,X=np.mgrid[:N,:N]/N
for kind in ['limestone','oak','denim','jacket','skin']:
 n=sum(noise(s)*w for s,w in [(4,.35),(16,.28),(64,.22),(256,.15)])
 if kind=='limestone':
  h=n+np.maximum(0,.055-abs(noise(12)-.5))*2
  rgb=np.array([143,132,112])[None,None,:]*(.66+n[:,:,None]*.65)
  rgb+=np.maximum(0,noise(64)-.7)[:,:,None]*80;rough=.78+n*.2
 elif kind=='oak':
  grain=np.sin(X*390+np.sin(Y*14)*2+noise(8)*11)
  pores=np.maximum(0,np.sin(X*1600+noise(16)*4)-.85)
  h=n*.18+grain*.05-pores*.1
  rgb=np.array([153,104,58])[None,None,:]*(.69+n[:,:,None]*.62+grain[:,:,None]*.1-pores[:,:,None]*.22);rough=.48+n*.28
 elif kind=='skin':
  h=n*.05;rgb=np.array([171,115,87])[None,None,:]*(.9+n[:,:,None]*.2);rough=.57+n*.25
 else:
  weave=np.sin(X*1608)*np.sin(Y*1608)
  h=n*.1+weave*.025
  base=[41,57,75] if kind=='denim' else [24,27,30]
  rgb=np.array(base)[None,None,:]*(.65+n[:,:,None]*.65+weave[:,:,None]*.12);rough=.7+n*.25
 Image.fromarray(np.uint8(np.clip(rgb,0,255))).save(out/(kind+'-albedo.jpg'),quality=90)
 dy,dx=np.gradient(h);normal=np.dstack((-dx*18,-dy*18,np.ones_like(h)));normal/=np.linalg.norm(normal,axis=2)[:,:,None]
 Image.fromarray(np.uint8((normal*.5+.5)*255)).save(out/(kind+'-normal.png'))
 # glTF metallic-roughness: G=roughness, B=metallic=0.
 mr=np.zeros((N,N,3),dtype=np.uint8);mr[:,:,0]=255;mr[:,:,1]=np.uint8(np.clip(rough,0,1)*255)
 Image.fromarray(mr).save(out/(kind+'-roughness.png'))
print('15 original 512px PBR textures saved')
