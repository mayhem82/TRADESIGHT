"""Run with FreeCAD's bundled python.exe, isolated from the user's live documents."""
import os
os.environ['QT_QPA_PLATFORM'] = 'offscreen'
import csv
import base64
import html
import json
import math
from pathlib import Path
import sys
import traceback
import textwrap
import zipfile
import FreeCAD as App
import Part
import TechDraw
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QByteArray, QRectF
from PySide6.QtGui import QImage, QPainter, QColor, QPdfWriter, QPageSize, QFontDatabase
from PySide6.QtSvg import QSvgRenderer
from contract import validate
from gltf import export_glb

E = html.escape
COLORS = ['#39a58e', '#4a98d0', '#d9a340', '#bd7fc8', '#db7b66']

def metadata(obj, c):
    for key, value in [('DimensionSource', c['source']), ('Description', c.get('description', '')), ('Material', c.get('material', '')), ('Role', c.get('kind', 'box'))]:
        if key not in obj.PropertiesList:
            obj.addProperty('App::PropertyString', key, 'TradeSight')
        setattr(obj, key, value)

def create(job, folder):
    if job['mode'] == 'existing':
        doc = App.openDocument(str(folder / 'source.FCStd'))
        for o in doc.Objects:
            if hasattr(o, 'Shape') and not o.Shape.isNull() and 'DimensionSource' not in o.PropertiesList:
                metadata(o, {'source': 'unknown', 'description': str(getattr(o,'Description','') or getattr(o,'Notes','') or 'Imported model: dimensions preserved; site measurement provenance not supplied.'), 'material':str(getattr(o,'Material',''))})
        return doc
    doc = App.newDocument('TradeSightJob')
    doc.Label = job['title']
    for i, c in enumerate(job['components']):
        kind = c.get('kind', 'box')
        origin = App.Vector(c['x'], c['y'], c['z'])
        if kind == 'service':
            points = [App.Vector(*p) for p in c['points']]
            segments = []
            for a, b in zip(points, points[1:]):
                direction = b-a
                if direction.Length > 0.01:
                    segments.append(Part.makeCylinder(c['radius'], direction.Length, a, direction))
            if not segments:
                raise ValueError('Service route has no length.')
            shape = Part.makeCompound(segments)
        elif kind == 'cylinder':
            shape = Part.makeCylinder(c['width']/2, c['height'], origin)
        else:
            shape = Part.makeBox(c['width'], c['depth'], c['height'], origin)
        if kind == 'opening':
            host = doc.getObject(c['host'])
            if host.Shape.common(shape).Volume < 0.01:
                raise ValueError(f"Opening {c['label']} does not intersect its host.")
            host.Shape = host.Shape.cut(shape).removeSplitter()
            # Opening retained as metadata rather than another filled solid.
            obj = doc.addObject('App::FeaturePython', c['id'])
        else:
            obj = doc.addObject('PartDesign::Feature', c['id'])
            obj.Shape = shape
            if obj.ViewObject:
                obj.ViewObject.ShapeColor = tuple(int(COLORS[i % len(COLORS)][k:k+2], 16)/255 for k in (1, 3, 5))
        obj.Label = c.get('label') or c['id']
        metadata(obj, c)
        if 'InputDimensionsJSON' not in obj.PropertiesList:
            obj.addProperty('App::PropertyString', 'InputDimensionsJSON', 'TradeSight')
        obj.InputDimensionsJSON = json.dumps(c)
    doc.recompute()
    return doc

def objects(doc):
    # Groups/compound parents duplicate child geometry. Preserve geometry leaves.
    candidates = [o for o in doc.Objects if hasattr(o, 'Shape') and not o.Shape.isNull()]
    return [o for o in candidates if not any(child in candidates for child in getattr(o, 'Group', []))]

def make_mesh(items):
    result = []
    for i, o in enumerate(items):
        verts, faces = o.Shape.tessellate(max(0.5, o.Shape.BoundBox.DiagonalLength/1800))
        if len(faces) > 150000:
            raise ValueError('Model is too dense for the phone viewer. Simplify it first.')
        role = getattr(o, 'Role', '')
        label = o.Label
        group = next((g.Label for g in o.InList if 'Group' in g.PropertiesList), '')
        color = COLORS[i % len(COLORS)]
        if o.ViewObject and hasattr(o.ViewObject, 'ShapeColor'):
            rgb = o.ViewObject.ShapeColor
            color = '#'+''.join(f'{int(max(0,min(1,n))*255):02x}' for n in rgb[:3])
        if role == 'service' or 'service' in group.lower():
            color = '#1485bd'
        bb = o.Shape.BoundBox
        result.append({'id': o.Name, 'label': label, 'description': getattr(o, 'Description', ''), 'material': getattr(o, 'Material', ''), 'source': getattr(o, 'DimensionSource', 'unknown'), 'group': group, 'role': role, 'color': color,
                       'roof': 'roof' in (o.Name+' '+label).lower(), 'wall': any(w in (o.Name+' '+label).lower() for w in ['wall', 'partition']),
                       'positions': [[round(v.x,4), round(v.z,4), round(-v.y,4)] for v in verts], 'faces': faces,
                       'bounds': [bb.XLength, bb.YLength, bb.ZLength], 'initiallyHidden':bool(o.ViewObject and not o.ViewObject.Visibility)})
    if sum(len(o['faces']) for o in result) > 250000:
        raise ValueError('Model exceeds 250,000 viewer triangles. Simplify it first.')
    return result

def sheet(title, subtitle, items, axes, fullbb):
    u, v = axes
    paths = []
    pts = []
    for i, o in enumerate(items):
        for edge in o.Shape.Edges:
            points = edge.discretize(Deflection=max(.5, fullbb.DiagonalLength/2000))
            xy = [(p.dot(u), -p.dot(v)) for p in points]
            if len(xy) > 1:
                paths.append((o, xy))
                pts.extend(xy)
    if not pts:
        raise ValueError('Drawing has no geometry.')
    xmin, xmax = min(p[0] for p in pts), max(p[0] for p in pts)
    ymin, ymax = min(p[1] for p in pts), max(p[1] for p in pts)
    s = min(1200/max(xmax-xmin,1), 520/max(ymax-ymin,1))
    tx, ty = 790-(xmin+xmax)*s/2, 420-(ymin+ymax)*s/2
    geometry = ''
    for o, xy in paths:
        color = '#1485bd' if getattr(o, 'Role', '') == 'service' or 'service' in ' '.join(g.Label.lower() for g in o.InList) else '#233b49'
        geometry += '<path d="M '+' L '.join(f'{x*s+tx:.2f} {y*s+ty:.2f}' for x,y in xy)+f'" stroke="{color}" fill="none" stroke-width="1.2"/>'
    left, right, top, bottom = xmin*s+tx, xmax*s+tx, ymin*s+ty, ymax*s+ty
    # Overall projected dimensions from geometry; do not imply field measurement.
    dimensions = f'<path d="M{left} {bottom+10} V{bottom+40} H{right} V{bottom+10} M{left-10} {top} H{left-45} V{bottom} H{left-10}" fill="none" stroke="#1485bd"/>'
    dimensions += f'<text x="{(left+right)/2}" y="{bottom+63}" text-anchor="middle">{xmax-xmin:.1f} mm</text><text x="{left-55}" y="{(top+bottom)/2}" text-anchor="middle" transform="rotate(-90 {left-55} {(top+bottom)/2})">{ymax-ymin:.1f} mm</text>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="white"/><g font-family="Arial" fill="#173244" font-size="20"><text x="55" y="55" font-size="30">{E(title[:85])}</text><text x="55" y="90">{E(subtitle)}</text>{geometry}{dimensions}<path d="M55 820 H1545" stroke="#9aabb4"/><text x="55" y="855">TRADESIGHT | Model coordinates in mm | View fitted to page; do not scale from print</text><text x="55" y="890">Overall model dimensions shown. Component dimensions and provenance: components.csv.</text><text x="55" y="925">Photo-derived geometry requires site confirmation. Transparent line projection shows rear edges.</text><text x="55" y="960">Services are schematic routes supplied by the user; hidden construction is not inferred.</text></g></svg>'''

def render(svg, png, writer=None):
    renderer = QSvgRenderer(QByteArray(svg.encode('utf-8')))
    if not renderer.isValid():
        raise ValueError('Invalid drawing SVG.')
    image = QImage(1600,1000,QImage.Format_ARGB32)
    image.fill(QColor('white'))
    painter = QPainter(image)
    renderer.render(painter)
    painter.end()
    image.save(str(png))
    if writer:
        renderer.render(writer, QRectF(0,0,writer.device().width(),writer.device().height()))

def run(jobfile, destination):
    app = QApplication.instance() or QApplication([])
    # Initialize view providers in an offscreen process to preserve FCStd colours.
    import FreeCADGui as Gui
    Gui.showMainWindow()
    QFontDatabase.addApplicationFont('C:/Windows/Fonts/arial.ttf')
    folder = Path(destination)
    job = validate(json.loads(Path(jobfile).read_text(encoding='utf-8')))
    doc = create(job, folder)
    items = objects(doc)
    if not items or len(items) > 300:
        raise ValueError('Model must contain 1–300 geometric objects.')
    invalid = [o.Label for o in items if not o.Shape.isValid()]
    if invalid:
        raise ValueError('Invalid geometry: '+', '.join(invalid[:5]))
    bb = Part.makeCompound([o.Shape for o in items]).BoundBox
    mesh = make_mesh(items)
    textured_count=0
    if job.get('photoTexture',True) and (folder/'photo.jpg').is_file() and job['mode']=='components':
        inputs={c['id']:c for c in job['components']}
        for exported in mesh:
            c=inputs.get(exported['id'],{})
            if c.get('kind','box')!='box' or not c.get('photoRect'): continue
            left,top,right,bottom=c['photoRect']
            # Texture only the actual front plane. Sides/rear retain base colours.
            uv=[]
            for x,z,negative_y in exported['positions']:
                uv.append([left+(x-c['x'])/c['width']*(right-left),bottom-(z-c['z'])/c['height']*(bottom-top)])
            front=[i for i,f in enumerate(exported['faces']) if all(abs(exported['positions'][v][2]+c['y'])<.01 for v in f)]
            if front:
                exported['texture']={'image':'photo.jpg','uv':uv,'faces':front,'mapping':'front-plane-photo-crop'}
                textured_count+=1
    (folder/'mesh.json').write_text(json.dumps(mesh, separators=(',',':')), encoding='utf-8')
    (folder/'model.glb').write_bytes(export_glb(mesh,(folder/'photo.jpg').read_bytes() if (folder/'photo.jpg').exists() else None))
    Part.export(items, str(folder/'model.step'))
    Part.makeCompound([o.Shape for o in items]).exportStl(str(folder/'model.stl'))
    fields = ['id','label','width_mm','depth_mm','height_mm','volume_mm3','dimension_source','material','description']
    schedule=[]
    with (folder/'components.csv').open('w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f); writer.writerow(fields)
        for o in items:
            b=o.Shape.BoundBox
            row=[o.Name,o.Label,round(b.XLength,2),round(b.YLength,2),round(b.ZLength,2),round(o.Shape.Volume,2),getattr(o,'DimensionSource','unknown'),getattr(o,'Material',''),getattr(o,'Description','')]
            schedule.append(row)
            writer.writerow([("'"+v if isinstance(v,str) and v[:1] in '=+-@' else v) for v in row])
        for c in job.get('components',[]):
            if c.get('kind')=='opening':
                row=[c['id'],c.get('label',c['id']),c['width'],c['depth'],c['height'],0,c['source'],c.get('material',''),c.get('description','')+' | Opening in '+c['host']]
                schedule.append(row); writer.writerow(row)
    specs = [('front','Front elevation',App.Vector(1,0,0),App.Vector(0,0,1)),('plan','Plan',App.Vector(1,0,0),App.Vector(0,-1,0)),('side','Side elevation',App.Vector(0,1,0),App.Vector(0,0,1))]
    # Native TechDraw view objects are saved alongside exported drawing sheets.
    templatefile=folder/'drawing-template.svg'
    templatefile.write_text('<svg xmlns="http://www.w3.org/2000/svg" xmlns:freecad="http://www.freecadweb.org/wiki/index.php?title=Svg_Namespace" width="420mm" height="297mm" viewBox="0 0 420 297"><rect x="10" y="10" width="400" height="277" fill="none" stroke="black" stroke-width="0.35"/><text x="15" y="279" font-size="4">TRADESIGHT | Model dimensions in mm | Verify on site</text></svg>',encoding='utf-8')
    for slug, label, u, v in specs:
        page=doc.addObject('TechDraw::DrawPage','Drawing_'+slug)
        template=doc.addObject('TechDraw::DrawSVGTemplate','Template_'+slug)
        template.Template=str(templatefile)
        page.Template=template
        view=doc.addObject('TechDraw::DrawViewPart','View_'+slug)
        view.Source=items
        view.Direction=u.cross(v)
        if 'XDirection' in view.PropertiesList:
            view.XDirection=u
        view.Scale=min(220/max(bb.XLength,1),130/max(bb.ZLength,1))
        view.X=145; view.Y=100
        page.addView(view)
    doc.recompute()
    doc.saveAs(str(folder/'model.FCStd'))
    pdf=QPdfWriter(str(folder/'drawings.pdf')); pdf.setResolution(96)
    pdf.setPageSize(QPageSize(QPageSize.A3)); pdf.setPageOrientation(__import__('PySide6.QtGui',fromlist=['QPageLayout']).QPageLayout.Landscape)
    painter=QPainter(pdf)
    drawings=[]
    for idx,(slug,label,u,v) in enumerate(specs):
        svg=sheet(job['title'],label,items,(u,v),bb)
        (folder/f'{slug}.svg').write_text(svg,encoding='utf-8')
        if idx: pdf.newPage()
        render(svg,folder/f'{slug}.png',painter)
        drawings.append({'id':slug,'label':label})
    # A real section of the BRep model, cut at the centre of its Y extent.
    plane=Part.makePlane(max(bb.XLength*1.2,1),max(bb.ZLength*1.2,1),App.Vector(bb.XMin-bb.XLength*.1,bb.YMin+bb.YLength/2,bb.ZMin-bb.ZLength*.1),App.Vector(0,-1,0),App.Vector(1,0,0))
    section=doc.addObject('PartDesign::Feature','ExportSection')
    section.Label='Section A-A at model mid-depth'
    section.Shape=Part.makeCompound([o.Shape for o in items]).section(plane)
    if not section.Shape.isNull() and len(section.Shape.Edges):
        svg=sheet(job['title'],'Section A-A at mid-depth (Y = %.1f mm)'%(bb.YMin+bb.YLength/2),[section],(App.Vector(1,0,0),App.Vector(0,0,1)),bb)
        (folder/'section.svg').write_text(svg,encoding='utf-8'); pdf.newPage(); render(svg,folder/'section.png',painter)
        drawings.append({'id':'section','label':'Section A-A'})
    doc.removeObject(section.Name)
    services=[o for o in items if getattr(o,'Role','')=='service' or 'service' in ' '.join(g.Label.lower() for g in o.InList)]
    if services:
        svg=sheet(job['title'],'Services schematic — supplied routes only',services,(App.Vector(1,0,0),App.Vector(0,0,1)),bb)
        (folder/'services.svg').write_text(svg,encoding='utf-8'); pdf.newPage(); render(svg,folder/'services.png',painter)
        drawings.append({'id':'services','label':'Services schematic'})
    # Every component gets readable dimensions and descriptions in the PDF,
    # including opening records whose host has been cut rather than filled.
    for start in range(0,len(schedule),7):
        slug='schedule_'+str(start//7+1)
        text=f'<text x="55" y="55" font-size="30">{E(job["title"][:85])}</text><text x="55" y="95">Component dimensions, materials and descriptions — {start+1} to {min(start+7,len(schedule))}</text>'
        for index,row in enumerate(schedule[start:start+7]):
            y=145+index*107
            label=f'{row[0]} | {row[1]}'
            text+=f'<text x="55" y="{y}" font-size="19">{E(label[:125])}</text>'
            text+=f'<text x="55" y="{y+25}" font-size="18">XYZ size: {row[2]} × {row[3]} × {row[4]} mm | Source: {E(str(row[6]))} | {E(str(row[7])[:60])}</text>'
            for n,line in enumerate(textwrap.wrap(str(row[8]),145)[:2]):
                text+=f'<text x="55" y="{y+49+n*20}" font-size="16">{E(line)}</text>'
            text+=f'<path d="M55 {y+85} H1545" stroke="#ccd8de"/>'
        svg='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect width="1600" height="1000" fill="white"/><g font-family="Arial" fill="#173244" font-size="20">'+text+'<text x="55" y="960" font-size="17">Model sizes, not independent site measurements. Full descriptions are retained in components.csv and the CAD file.</text></g></svg>'
        (folder/(slug+'.svg')).write_text(svg,encoding='utf-8');pdf.newPage();render(svg,folder/(slug+'.png'),painter)
        drawings.append({'id':slug,'label':'Component schedule '+str(start//7+1)})
    painter.end()
    script=(Path(__file__).parent.parent/'web/viewer.js').read_text(encoding='utf-8')
    safe_mesh=json.dumps(mesh,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
    embedded_photos={}
    if textured_count:
        embedded_photos['photo.jpg']='data:image/jpeg;base64,'+base64.b64encode((folder/'photo.jpg').read_bytes()).decode()
    viewer='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+E(job['title'])+'</title><style>body{font:16px Arial;background:#edf2f4;color:#173244;margin:0;padding:16px}button,select{padding:10px;margin:3px;border:1px solid #aabac4;border-radius:6px;background:white;color:#173244}#viewer{height:65vh;min-height:330px;touch-action:none}canvas{width:100%;height:100%}#selection{white-space:pre-wrap}#layers{display:flex;gap:8px;flex-wrap:wrap}label{padding:7px}h1{font-size:24px}</style><h1>'+E(job['title'])+'</h1><p>Drag to rotate · pinch or scroll to zoom · tap a component for dimensions and descriptions</p><div id="controls"></div><div id="viewer"></div><p id="selection" role="status">Select a component.</p><div id="layers"></div><p>Dimension provenance is recorded per component. Photo-inferred geometry needs site confirmation.</p><script id="mesh" type="application/json">'+safe_mesh+'</script><script>'+script+'</script></html>'
    viewer=viewer.replace('<script id="mesh"','<script id="texture-data" type="application/json">'+json.dumps(embedded_photos)+'</script><script id="mesh"')
    (folder/'viewer.html').write_text(viewer,encoding='utf-8')
    outputs=['model.FCStd','model.step','model.stl','model.glb','drawings.pdf','components.csv','mesh.json','viewer.html','drawing-template.svg']+[d['id']+ext for d in drawings for ext in ('.svg','.png')]
    if (folder/'photo.jpg').exists(): outputs.append('photo.jpg')
    manifest={'title':job['title'],'engine':'FreeCAD '+'.'.join(App.Version()[:3]),'components':len(items),'photoTexturedComponents':textured_count,'geometryValid':True,'units':'mm','drawings':drawings,'outputs':outputs+['job.json'],'boundary':'Dimensions preserve supplied or inferred model geometry; this is not a site measurement or engineering approval.'}
    (folder/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    with zipfile.ZipFile(folder/'package.zip','w',zipfile.ZIP_DEFLATED) as archive:
        for name in outputs+['manifest.json','job.json']:
            archive.write(folder/name,name)
    App.closeDocument(doc.Name)
    print(json.dumps(manifest))

if __name__=='__main__':
    try:
        run(sys.argv[1],sys.argv[2])
    except Exception:
        traceback.print_exc()
        sys.exit(1)
