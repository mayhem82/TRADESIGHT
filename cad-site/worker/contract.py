"""Bounded CAD job contract. Values are millimetres in FreeCAD's XYZ system."""
import math
import re

PROVENANCE = {'measured', 'product-specification', 'nominal', 'photo-inferred', 'unknown'}

def number(value, name, low=-1000000, high=1000000):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= value <= high:
        raise ValueError(f'{name} must be between {low} and {high}.')
    return float(value)

def validate(job):
    if not isinstance(job, dict):
        raise ValueError('A job object is required.')
    title = job.get('title', 'Site drawing')
    if not isinstance(title, str) or not title.strip() or len(title) > 120:
        raise ValueError('Use a job title of 1–120 characters.')
    job['title'] = title.strip()
    if 'photoTexture' in job and not isinstance(job['photoTexture'],bool):
        raise ValueError('Photo texture must be enabled or disabled.')
    if job.get('mode') == 'existing':
        return job
    job['mode'] = 'components'
    components = job.get('components')
    if not isinstance(components, list) or not 1 <= len(components) <= 150:
        raise ValueError('Add between 1 and 150 components.')
    seen = set()
    for c in components:
        if not isinstance(c, dict):
            raise ValueError('Each component must be an object.')
        name = c.get('id', '')
        if not isinstance(name, str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]{0,49}', name) or name in seen:
            raise ValueError('Each component needs a unique letter/number ID starting with a letter.')
        seen.add(name)
        for key in ('label', 'description', 'material'):
            value = c.get(key, '')
            if not isinstance(value, str) or len(value) > (1000 if key == 'description' else 150):
                raise ValueError(f'Invalid {key}.')
        if c.get('source') not in PROVENANCE:
            raise ValueError('Choose dimension provenance for every component.')
        if c.get('photoRect') is not None:
            rect=c['photoRect']
            if not isinstance(rect,list) or len(rect)!=4:
                raise ValueError('Photo crop must contain left, top, right and bottom coordinates.')
            for n in rect: number(n,'photo crop coordinate',0,1)
            if rect[2]<=rect[0] or rect[3]<=rect[1]:
                raise ValueError('Photo crop must have positive width and height.')
        kind = c.get('kind', 'box')
        if kind not in {'box', 'opening', 'cylinder', 'service'}:
            raise ValueError('Supported components: box, opening, cylinder, service.')
        for key in ('x', 'y', 'z'):
            c[key] = number(c.get(key, 0), key)
        if kind == 'service':
            points = c.get('points', [])
            if not isinstance(points, list) or not 2 <= len(points) <= 100:
                raise ValueError('A service needs 2–100 XYZ points.')
            for p in points:
                if not isinstance(p, list) or len(p) != 3:
                    raise ValueError('Service points must be XYZ triples.')
                for n in p:
                    number(n, 'service coordinate')
            c['radius'] = number(c.get('radius', 10), 'radius', 1, 1000)
        else:
            for key in ('width', 'depth', 'height'):
                c[key] = number(c.get(key), key, 1, 100000)
        if kind == 'opening':
            host = c.get('host')
            if host not in seen or host == name:
                raise ValueError('An opening must refer to a preceding solid component ID.')
            if next(x for x in components if x['id'] == host).get('kind', 'box') not in {'box', 'cylinder'}:
                raise ValueError('An opening host must be a solid.')
    if not any(c.get('kind', 'box') in {'box', 'cylinder'} for c in components):
        raise ValueError('Add at least one solid component.')
    return job
