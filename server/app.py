import asyncio
from aiohttp import web
import socketio
import random, time, json, base64
import threading


queue = asyncio.Queue()  # create queue object
sio = socketio.AsyncServer(async_mode='aiohttp', enable_async=True, cors_allowed_origins='*',  async_handlers=True)
app = web.Application()
sio.attach(app)


@sio.on('connect')
def connect(sid, environ):
    print("connected: ", sid)

@sio.on('disconnect')
def disconnect(sid):
    print('disconnect ', sid)




openIds = {}
connections = {}






@sio.on('open')
async def opening(sid, data):
    print('attemping to open ', sid)
    nId = data

    if openIds.get(nId):
        print("ERROR - id already exists ", nId)
        await sio.emit("returnError", "id already in use", to=sid)
    else:
        openIds[nId] = sid
    
@sio.on('join')
async def joining(sid, data):
    print('attemping to join ', sid)
    aId = data

    if openIds.get(aId):
        print("connected on id ", aId)
        sid1 = sid
        sid2 = openIds[aId]
        connections[sid1] = sid2
        connections[sid2] = sid1
    else:
        print("ERROR - id doesn't exist ", aId)
        await sio.emit("returnError", "id does not exist", to=sid)

@sio.on('send')
async def sending(sid, payload):
    print('sending ', sid)
    if connections.get(sid):
        await sio.emit("returnSend", payload, to=connections[sid])
    else:
        print("ERROR - no connections listed")
        await sio.emit("returnError", "no connections listed", to=sid)
    #clients[sid]["mobile"].bot = True



if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0', port=4545)