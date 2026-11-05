"""Find musical contrast cues from the intact WAV; no lyric/section guesses.
Requires NumPy. Outputs reproducible spectral-band envelopes and cue evidence.
"""
from pathlib import Path
import sys,json,hashlib,wave
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root.parent/'vendor'))
import numpy as np
assets=root/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets';wav=assets.parent/'WIELDED-DERANGEMENT.wav';digest=hashlib.sha256(wav.read_bytes()).hexdigest();assert digest.upper()=='52364F8DD70F4A149974C2350693DD09F122D67D60D4CBA64FF4FF36271AC214'
with wave.open(str(wav)) as f:rate=f.getframerate();audio=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).astype('f4').mean(axis=1)/32768
hop=2400;size=4096;freq=np.fft.rfftfreq(size,1/rate);bands=[(freq>=35)&(freq<190),(freq>=190)&(freq<2000),(freq>=2000)&(freq<9000)];hann=np.hanning(size);raw=[];rms=[]
for centre in range(0,len(audio),hop):
 frame=np.zeros(size);a=max(0,centre-size//2);b=min(len(audio),centre+size//2);offset=a-(centre-size//2);frame[offset:offset+b-a]=audio[a:b];spectrum=np.abs(np.fft.rfft(frame*hann));raw.append([float(np.sqrt(np.mean(spectrum[band]**2))) for band in bands]);rms.append(float(np.sqrt(np.mean(frame**2))))
raw=np.array(raw);rms=np.array(rms);log=np.log(raw+1e-5);scale=np.maximum(np.quantile(log,.9,axis=0)-np.quantile(log,.1,axis=0),.1);descriptors=log/scale
dt=hop/rate;novelty=np.zeros(len(raw));context=int(3/dt);gap=int(.4/dt)
for i in range(context+gap,len(raw)-context-gap):
 before=np.mean(descriptors[i-context-gap:i-gap],axis=0);after=np.mean(descriptors[i+gap:i+gap+context],axis=0);novelty[i]=np.linalg.norm(after-before)
# Greedy strongest isolated contrast peaks, avoiding intro/end fade and keeping
# enough space for each extended transformation to read as a musical phrase.
candidates=[i for i in range(1,len(raw)-1) if 15<=i*dt<=249 and novelty[i]>novelty[i-1] and novelty[i]>=novelty[i+1]];selected=[]
for i in sorted(candidates,key=lambda i:novelty[i],reverse=True):
 if all(abs(i-j)*dt>=28 for j in selected):selected.append(i)
 if len(selected)==5:break
selected.sort();modes=['compression','crown','counterwave','surge','cascade'];events=[]
for i,mode in zip(selected,modes):events.append({'time':round(i*dt,2),'mode':mode,'novelty':round(float(novelty[i]),5),'beforeRms':round(float(np.mean(rms[i-context-gap:i-gap])),6),'afterRms':round(float(np.mean(rms[i+gap:i+gap+context])),6)})
normalised={}
for j,name in enumerate(['low','mid','high']):
 envelope=np.convolve(raw[:,j],np.ones(5)/5,mode='same');denom=max(1e-8,np.quantile(envelope,.96));normalised[name]=np.round(np.clip(envelope/denom,0,1),4).tolist()
score={'sourceSha256':digest,'duration':len(audio)/rate,'secondsPerSample':dt,'method':'Three spectral-band envelopes; five strongest isolated 3 s before/after timbral contrasts, at least 28 s apart. Analysis-selected editorial cues, not verified lyric/chorus timestamps.','bands':normalised,'events':events}
(assets/'wall-score.json').write_text(json.dumps(score,separators=(',',':')))
report={k:v for k,v in score.items() if k!='bands'};report.update(samples=len(raw),bandRangesHz=[[35,190],[190,2000],[2000,9000]],bytes=(assets/'wall-score.json').stat().st_size)
(root/'ar-source/wielded-derangement-001/wall-score-analysis.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))

