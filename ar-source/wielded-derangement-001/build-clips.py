"""Build small cyclic screen derivatives; never modify the four source MP4s.
Usage: python build-clips.py SOURCE_DIR --ffmpeg PATH
Requires NumPy. Output in the project's public assets/clips directory.
"""
from pathlib import Path
import argparse,subprocess,json,hashlib
import numpy as np
parser=argparse.ArgumentParser();parser.add_argument('source_dir',type=Path);parser.add_argument('--ffmpeg',default='ffmpeg');args=parser.parse_args()
repo=Path(__file__).resolve().parents[2];dest=repo/'public/ar-experiments/mayhem-ar/wielded-derangement-001/assets/clips';dest.mkdir(exist_ok=True)
names=['Mercury_Loom','Hydraulic_Bloom','Suspended_Foundry','Pressure_Skin'];report=[]
expected=['ca06718402ce9e3772f93447d992996e26b96c31e200959ffe2a381c341e5cd4','d5a908c06b6f5e438e275e61cf3d12713e61040e43bd756c4ed5e3eb2b78962d','53aa087899712a1a0433b63ecd5041bc98072be103bf179918b84ccbcb122fbe','51d90437bb7bcf9e50a8009bddc9236a1743f7f9dd5a795561829d8487f3fdf2']
for name in names:
 src=args.source_dir/(name+'.mp4');target=dest/src.name
 assert src.resolve()!=target.resolve()
 assert hashlib.sha256(src.read_bytes()).hexdigest()==expected[names.index(name)],'Unexpected source bytes: '+name
 # Fixed 512x384 letterbox retains the full source composition and simplifies
 # decoder re-use. Black pillar/letterbox pixels are intentional, not cropping.
 raw=subprocess.check_output([args.ffmpeg,'-v','error','-i',str(src),'-vf','scale=512:384:force_original_aspect_ratio=decrease,pad=512:384:(ow-iw)/2:(oh-ih)/2','-pix_fmt','rgb24','-f','rawvideo','-'])
 frames=np.frombuffer(raw,dtype=np.uint8).reshape(-1,384,512,3);count=len(frames);blend=12
 assert count==157
 a=((np.arange(blend)+.5)/blend).reshape(-1,1,1,1)
 join=np.rint(frames[-blend:].astype(float)*(1-a)+frames[:blend].astype(float)*a).astype(np.uint8)
 cyclic=np.concatenate([frames[blend:-blend],join])
 subprocess.run([args.ffmpeg,'-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','512x384','-r','24','-i','-','-an','-c:v','libx264','-crf','20','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart','-video_track_timescale','24000',str(target)],input=cyclic.tobytes(),check=True)
 decoded=subprocess.check_output([args.ffmpeg,'-v','error','-i',str(target),'-vf','scale=128:96','-f','rawvideo','-pix_fmt','rgb24','-']);small=np.frombuffer(decoded,dtype=np.uint8).reshape(-1,96,128,3).astype(float)
 adjacent=np.abs(np.diff(small,axis=0)).mean(axis=(1,2,3));seam=float(np.abs(small[-1]-small[0]).mean())
 report.append({'name':src.name,'source_bytes':src.stat().st_size,'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_frames':count,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'width':512,'height':384,'frames':len(small),'fps':24,'duration':len(small)/24,'join_blend_frames':blend,'seam_pixel_delta':seam,'adjacent_mean_pixel_delta':float(adjacent.mean()),'adjacent_max_pixel_delta':float(adjacent.max()),'decode':'passed'})
manifest=dest/'manifest.json';manifest.write_text(json.dumps({'build':'recovered-clips-011','clips':report},indent=2),encoding='utf-8');print(manifest.read_text())
