import asyncio
import websockets

clients = set()

async def handler(websocket):
    clients.add(websocket)
    try:
        async for msg in websocket:
            print(f"[WS] Received: {msg}")
            for client in clients:
                if client != websocket:
                    await client.send(msg)
    except Exception as e:
        print(f"[WS] Error: {e}")
    finally:
        clients.remove(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("[WS] Server listening on ws://localhost:8765")
        await asyncio.Future()

asyncio.run(main())