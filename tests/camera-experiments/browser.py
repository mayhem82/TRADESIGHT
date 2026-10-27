"""CI-only camera-free browser checks; no permission grants or physical tracking claim."""
import functools
import http.server
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

root = Path(os.environ.get('CAMERA_EXPERIMENTS_ROOT', 'dist')).resolve()
evidence = Path(__file__).parent
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/ar-experiments/mayhem-ar/experiments'
report = {'physical_phone_tracking': 'not tested', 'camera_permission': 'never granted', 'cases': []}
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for name, viewport in [('phone', {'width': 390, 'height': 844}), ('desktop', {'width': 1280, 'height': 900})]:
            context = browser.new_context(viewport=viewport)
            # Instrument the permission request, denying it without touching any real camera.
            context.add_init_script("""window.cameraRequests=0; navigator.mediaDevices.getUserMedia=async()=>{window.cameraRequests++;throw new DOMException('Synthetic permission denial','NotAllowedError');};""")
            page = context.new_page()
            errors=[]
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base+'/opencv-outline/', wait_until='networkidle')
            assert page.evaluate('cameraRequests') == 0
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.locator('summary').click()
            page.wait_for_function("document.querySelector('summary').textContent.startsWith('Hide')")
            page.locator('summary').click()
            page.get_by_role('button', name='Try sample, no camera').click()
            page.wait_for_function("document.querySelector('#status').textContent.includes('Sample processed')", timeout=60000)
            assert page.evaluate('cameraRequests') == 0
            assert page.evaluate("document.querySelector('#outline').getContext('2d').getImageData(0,0,480,360).data.some((v,i)=>i%4!==3 && v>0)")
            page.get_by_role('button', name='Capture comparison').click()
            page.get_by_role('link', name='Save captured PNG').wait_for(state='visible')
            page.screenshot(path=str(evidence/f'opencv-{name}.png'), full_page=True)
            page.get_by_role('button', name='Start camera').click()
            page.wait_for_function("document.querySelector('#status').textContent.includes('NotAllowedError')")
            assert page.evaluate('cameraRequests') == 1
            report['cases'].append({'viewport': name, 'opencv': 'sample rendered, capture offered, button-only request and denial handled'})
            page.goto(base+'/ar-marker/', wait_until='networkidle')
            assert page.evaluate('cameraRequests') == 0
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.locator('summary').click()
            page.wait_for_function("document.querySelector('summary').textContent.startsWith('Hide')")
            assert page.get_by_role('link', name='Open printable Hiro marker').get_attribute('href') == 'print-marker.html'
            page.screenshot(path=str(evidence/f'ar-marker-{name}.png'), full_page=True)
            page.get_by_role('button', name='Start camera').click()
            page.wait_for_function("document.querySelector('#status').textContent.includes('NotAllowedError')", timeout=60000)
            assert page.evaluate('cameraRequests') == 1
            assert page.locator('#start').is_enabled()
            pending=[]
            page.route('**/patt.hiro', lambda route: pending.append(route))
            with page.expect_request('**/patt.hiro'):
                page.get_by_role('button', name='Start camera').click()
            page.get_by_role('button', name='Stop', exact=True).click()
            for route in pending:
                route.continue_()
            page.wait_for_timeout(500)
            assert page.evaluate('cameraRequests') == 1, 'Stopped marker load must not request a camera later'
            assert not errors, errors
            report['cases'].append({'viewport': name, 'ar': 'actual renderer/tracker initialized; button-only request and synthetic denial handled; physical detection untested'})
            page.goto(base+'/ar-marker/print-marker.html', wait_until='networkidle')
            assert page.locator('img').evaluate('(img)=>img.complete && img.naturalWidth>0')
            page.emulate_media(media='print')
            assert page.locator('.controls').is_hidden()
            assert not errors, errors
            context.close()
        browser.close()
    report['result']='passed'
finally:
    server.shutdown()
    (evidence/'browser-report.json').write_text(json.dumps(report, indent=2)+'\n')
