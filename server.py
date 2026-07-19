#!/usr/bin/env python3
"""Buttscoot GP dev server: static files + a tiny Claude proxy.

The proxy exists so the API key lives here (in your shell env), never in
browser JS. Run with:

    ANTHROPIC_API_KEY=sk-ant-... python3 server.py

Without a key the game still works — it just uses its built-in roster and
scripted commentary.
"""
import base64
import json
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 4173
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')
API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
MODEL = 'claude-haiku-4-5-20251001'   # fast + cheap: right tier for taunts
MAX_TOKENS_CAP = 1000


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        # keep the console quiet except for API traffic
        if self.path.startswith('/api/'):
            super().log_message(fmt, *args)

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/status':
            return self._json(200, {'ai': bool(API_KEY)})
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/save-og':
            # local-dev helper only (not in the production Worker): save a
            # jpeg data-URL from the page as the social preview image
            length = int(self.headers.get('Content-Length', 0))
            data = self.rfile.read(length).decode()
            prefix = 'data:image/jpeg;base64,'
            if not data.startswith(prefix):
                return self._json(400, {'error': 'expected a jpeg data url'})
            with open(os.path.join(ROOT, 'og.jpg'), 'wb') as f:
                f.write(base64.b64decode(data[len(prefix):]))
            return self._json(200, {'ok': True})
        if self.path != '/api/claude':
            return self._json(404, {'error': 'not found'})
        if not API_KEY:
            return self._json(503, {'error': 'no ANTHROPIC_API_KEY set'})
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            payload = {
                'model': MODEL,
                'max_tokens': min(int(body.get('max_tokens', 400)), MAX_TOKENS_CAP),
                'messages': [
                    {'role': 'user', 'content': str(body.get('prompt', ''))[:6000]},
                ],
            }
            if body.get('system'):
                payload['system'] = str(body['system'])[:4000]
            req = urllib.request.Request(
                ANTHROPIC_URL,
                data=json.dumps(payload).encode(),
                headers={
                    'x-api-key': API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.load(resp)
            text = ''.join(
                block.get('text', '')
                for block in data.get('content', [])
                if block.get('type') == 'text'
            )
            return self._json(200, {'text': text})
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors='replace')[:500]
            return self._json(502, {'error': f'anthropic {e.code}', 'detail': detail})
        except Exception as e:  # noqa: BLE001 — a game server should never crash
            return self._json(500, {'error': str(e)[:300]})


if __name__ == '__main__':
    mode = 'AI ON (key found)' if API_KEY else 'AI OFF (no ANTHROPIC_API_KEY — scripted fallbacks)'
    print(f'Buttscoot GP → http://localhost:{PORT}   [{mode}]')
    ThreadingHTTPServer(('', PORT), Handler).serve_forever()
