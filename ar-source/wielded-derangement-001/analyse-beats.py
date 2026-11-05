"""Deterministic low-frequency onset features from the intact original WAV.
Not lyric timing or a claim of beat-grid transcription. Requires NumPy.
"""
from pathlib import Path
import wave,json,hashlib,sys
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root.parent/'vendor'))
import numpy as np
assets=root/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets';wav=assets.parent/'WIELDED-DERANGEMENT.wav';digest=hashlib.sha256(wav.read_bytes()).hexdigest();assert digest.upper()=='52364F8DD70F4A149974C2350693DD09F122D67D60D4CBA64FF4FF36271AC214'
with wave.open(str(wav)) as f:rate=f.getframerate();audio=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).astype('f4').mean(axis=1)/32768
hop=960;window=4096;hann=np.hanning(window);freq=np.fft.rfftfreq(window,1/rate);band=(freq>=35)&(freq<=190);values=[]
for start in range(0,len(audio),hop):
 frame=np.zeros(window);chunk=audio[max(0,start-window//2):min(len(audio),start+window//2)];frame[:len(chunk)]=chunk;spectrum=np.abs(np.fft.rfft(frame*hann));values.append(float(np.sqrt(np.mean(spectrum[band]**2))))
bass=np.array(values);level=np.convolve(bass,np.ones(31)/31,mode='same');flux=np.maximum(0,bass-level*.9)+np.maximum(0,np.diff(bass,prepend=bass[0]))*2
floor=np.quantile(flux,.45);positive=np.maximum(0,flux-floor);normal=max(1e-9,np.quantile(positive,.985));transient=np.clip(positive/normal,0,1)
# Fast attack, 110 ms release. Fixed analysed time gives reversible seeking.
decay=np.exp(-hop/rate/.11);envelope=[];value=0
for hit in transient:value=max(float(hit),value*decay);envelope.append(round(value,4))
data={'secondsPerSample':hop/rate,'sourceSha256':digest,'technique':'35-190 Hz spectral onset with fast attack and 110 ms release; not a beat-grid transcription','response':envelope}
(assets/'beats.json').write_text(json.dumps(data,separators=(',',':')));peaks=[i for i in range(1,len(envelope)-1) if envelope[i]>=.65 and envelope[i]>envelope[i-1] and envelope[i]>=envelope[i+1]]
report={'samples':len(envelope),'seconds_per_sample':hop/rate,'source_seconds':len(audio)/rate,'strong_transient_peaks':len(peaks),'examples_seconds':[round(i*hop/rate,2) for i in peaks[:12]],'max':max(envelope),'median':float(np.median(envelope)),'bytes':(assets/'beats.json').stat().st_size}
(root/'ar-source/wielded-derangement-001/beat-analysis-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
