from pynput import keyboard, mouse
import json
import time
import websocket

NUMPAD_NUMBERS = {
    96: '0', 97: '1', 98: '2', 99: '3', 100: '4',
    101: '5', 102: '6', 103: '7', 104: '8', 105: '9'
}

WS_URL = "ws://localhost:8765"
ws = None

def connect_ws():
    global ws
    while True:
        try:
            ws = websocket.create_connection(WS_URL)
            print("[WS] Connected to server.")
            break
        except Exception as e:
            print(f"[WS] Connection failed: {e}. Retrying in 2 seconds...")
            time.sleep(2)

def emit(data):
    global ws
    try:
        if ws:
            ws.send(json.dumps(data))
    except Exception as e:
        print(f"[WS] Send failed: {e}. Reconnecting...")
        connect_ws()

def get_key_name(key):
    if hasattr(key, 'char') and key.char is not None:
        return key.char
    elif hasattr(key, 'vk') and key.vk in NUMPAD_NUMBERS:
        return NUMPAD_NUMBERS[key.vk]
    elif hasattr(key, 'name'):
        return f"Key.{key.name}"
    elif hasattr(key, 'vk'):
        return f"Key.vk_{key.vk}"
    return "Unknown"

def on_key_press(key):
    key_name = get_key_name(key)
    emit({ "source": "keyboard", "name": key_name })

def on_click(x, y, button, pressed):
    if pressed:
        name = str(button).replace('Button.', 'Mouse.')
        emit({ "source": "mouse", "name": name })

def on_scroll(x, y, dx, dy):
    emit({ "source": "mouse", "name": f"Scroll {dx},{dy}" })

# Start WebSocket
connect_ws()

# Start listeners
keyboard.Listener(on_press=on_key_press).start()
mouse.Listener(on_click=on_click, on_scroll=on_scroll).start()

# Keep alive
while True:
    time.sleep(10)
