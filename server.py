import asyncio
import websockets

clients = set()

async def handler(websocket, path):
    clients.add(websocket)
    try:
        while True:
            msg = await websocket.recv()
            for client in clients:
                if client != websocket:
                    await client.send(msg)
    except:
        pass
    finally:
        clients.remove(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()  # run forever

asyncio.run(main())
