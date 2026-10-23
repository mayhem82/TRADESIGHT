"""Run: PYTHONPATH=/usr/lib/freecad/lib /usr/bin/python3 tools/stone-room/architecture.py.
Illustrative dimensions in millimetres. No site measurements supplied.
"""
import FreeCAD as App, Part
from pathlib import Path
root=Path(__file__).resolve().parents[2]
doc=App.newDocument('StoneRoom')
doc.Label='TRADESIGHT — illustrative 8 × 6 × 3 m'
groups={n:doc.addObject('App::DocumentObjectGroup',n) for n in ['Structure','Walls','Windows','Ceiling']}
def box(name,x,y,z,w,d,h,group):
 o=doc.addObject('Part::Feature',name);o.Shape=Part.makeBox(w,d,h,App.Vector(x,y,z));groups[group].addObject(o)
 o.addProperty('App::PropertyString','DimensionBasis').DimensionBasis='Illustrative design; not surveyed'
 return o
box('Floor',-4000,-3000,-120,8000,6000,120,'Structure')
openings=[('North',-3000,[(-2900,-700),(700,2900)]),('South',3000,[(-1200,1200)])]
for name,y,holes in openings:
 wall=box(name+'Wall',-4150,y-150,0,8300,300,3000,'Walls')
 for i,(a,b) in enumerate(holes):
  wall.Shape=wall.Shape.cut(Part.makeBox(b-a,600,1800,App.Vector(a,y-300,700)))
  for tag,x,z,w,h in [('JambL',a-65,700,65,1800),('JambR',b,700,65,1800),('Lintel',a-65,2500,b-a+130,130),('Sill',a-65,630,b-a+130,70)]:
   box(name+str(i)+tag,x,y-180,z,w,360,h,'Windows')
west=box('WestWall',-4150,-3000,0,300,6000,3000,'Walls');west.Shape=west.Shape.cut(Part.makeBox(600,2000,1800,App.Vector(-4300,-1500,700)))
for tag,y,z,d,h in [('JambL',-1565,700,65,1800),('JambR',500,700,65,1800),('Lintel',-1565,2500,2130,130),('Sill',-1565,630,2130,70)]:box('West'+tag,-4180,y,z,360,d,h,'Windows')
box('EastWall',3850,-3000,0,300,6000,3000,'Walls')
box('CeilingDeck',-4150,-3150,3030,8300,6300,80,'Ceiling')
for i,y in enumerate([-2850,0,2850]):box('Beam'+str(i),-4000,y-100,2800,8000,200,250,'Ceiling')
doc.recompute();doc.saveAs(str(root/'design/stone-room/StoneRoom.FCStd'))
Part.export([o for o in doc.Objects if hasattr(o,'Shape')],str(root/'design/stone-room/StoneRoom.step'))
print('Saved editable architectural model; four walls, four open windows, floor and ceiling.')
