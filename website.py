import socketio
import eventlet
import time, threading
import json

port = 6969
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'docs/index.html'},
    '/socket.io.min.js': {'content_type': 'text/javascript', 'filename': 'docs/socket.io.min.js'},
    '/main.js': {'content_type': 'text/javascript', 'filename': 'docs/main.js'},
    '/game': {'content_type': 'text/html', 'filename': 'docs/game.html'},
    '/particles.js': {'content_type': 'text/javascript', 'filename': 'docs/particles.js'},
    '/jqeruy.js': {'content_type': 'text/javascript', 'filename': 'docs/jqeruy.js'},
    '/builds.json': {'content_type': 'text/javascript', 'filename': 'builds.json'},
})

def run():
    eventlet.wsgi.server(eventlet.listen(('', port)), app, debug=True) # Note this line

run()