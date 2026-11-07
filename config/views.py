"""
Serves the React single-page app (frontend/dist/index.html) for every non-API route.
Build it with:  cd frontend && npm install && npm run build
"""
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie

INDEX = settings.FRONTEND_DIST / 'index.html'

MISSING = """<!doctype html><meta charset="utf-8"><title>agkAInakem</title>
<body style="font-family:system-ui;padding:3rem;background:#F7F4EF;color:#263A38">
<h1>Frontend not built yet</h1>
<p>Run <code>cd frontend &amp;&amp; npm install &amp;&amp; npm run build</code>, then reload.
During development you can also run <code>npm run dev</code> and open http://localhost:5173.</p>
<p>The API is available at <a href="/api/dictionary/search/">/api/dictionary/search/</a>.</p></body>"""


@ensure_csrf_cookie
def spa(request, *args, **kwargs):
    try:
        return HttpResponse(INDEX.read_text(encoding='utf-8'))
    except FileNotFoundError:
        return HttpResponse(MISSING, status=503)


def service_worker(request):
    """Serve the build's sw.js from the site root so it can control every page (offline help)."""
    try:
        resp = HttpResponse((settings.FRONTEND_DIST / 'sw.js').read_text(encoding='utf-8'), content_type='application/javascript')
    except FileNotFoundError:
        resp = HttpResponse('// no service worker in this build', content_type='application/javascript')
    resp['Cache-Control'] = 'no-cache'
    resp['Service-Worker-Allowed'] = '/'
    return resp
