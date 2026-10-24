"""Prepare generated source color maps for mobile GLB/runtime use in Blender."""
import bpy
from pathlib import Path
R=Path(__file__).resolve().parents[2];source=R/'design/stone-room/reference-textures';out=R/'public/stone-room/assets'
for name,destination,size in [('oak-generated.png','textures/oak-generated.jpg',1024),('face-neutral-generated.png','textures/face-neutral-generated.jpg',1024),('countryside-generated.png','countryside.jpg',1774)]:
 im=bpy.data.images.load(str(source/name));w,h=im.size
 if w>size:im.scale(size,round(h*size/w))
 im.filepath_raw=str(out/destination);im.file_format='JPEG';im.save()
 print(destination,Path(im.filepath_raw).stat().st_size)
