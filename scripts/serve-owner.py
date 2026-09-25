"""Serve the owner's journey on loopback only, outside the published tree."""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import mimetypes

ROOT = Path(__file__).resolve().parents[1]
PRIVATE_NAMES = {'places.html', 'places.js', 'journey.json', 'places.json'}
SHARED_NAMES = {'index.html', 'style.css', 'theme.css', 'places.css', 'render-utils.js',
                'journey.js', 'residence.js', 'trip-routes.js', 'script.js', 'photos.json'}

def make_handler(private_dir):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.headers.get('Host', '').split(':')[0] not in {'127.0.0.1', 'localhost'}:
                self.send_error(403); return
            name = unquote(urlsplit(self.path).path).lstrip('/') or 'places.html'
            if '\\' in name or any(part in {'.', '..'} for part in name.split('/')):
                self.send_error(404); return
            base = private_dir if name in PRIVATE_NAMES else ROOT
            if name not in PRIVATE_NAMES | SHARED_NAMES and not name.startswith('assets/'):
                self.send_error(404); return
            file = (base / name).resolve()
            if not file.is_relative_to(base) or not file.is_file():
                self.send_error(404); return
            content = file.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.end_headers()
            self.wfile.write(content)
    return Handler

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--private-dir', type=Path, default=Path.home() / 'Documents/Codex-private/subright-journey')
    parser.add_argument('--port', type=int, default=8001)
    args = parser.parse_args()
    private_dir = args.private_dir.expanduser().resolve()
    if not all((private_dir / name).is_file() for name in PRIVATE_NAMES):
        parser.error('Missing local owner files; see JOURNEY.md.')
    server = ThreadingHTTPServer(('127.0.0.1', args.port), make_handler(private_dir))
    print(f'Owner view: http://127.0.0.1:{args.port}/', flush=True)
    server.serve_forever()
