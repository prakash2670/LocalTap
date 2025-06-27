from pynput import keyboard, mouse
import sys
import json
import time

NUMPAD_NUMBERS = {
    96: '0', 97: '1', 98: '2', 99: '3', 100: '4',
    101: '5', 102: '6', 103: '7', 104: '8', 105: '9'
}

def emit(data):
    print(json.dumps(data), flush=True)

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
    emit({ "key": key_name })

def on_click(x, y, button, pressed):
    if pressed:
        name = str(button).replace('Button.', 'Mouse.')
        emit({ "mouse": name })

def on_scroll(x, y, dx, dy):
    emit({ "scroll": f"{dx},{dy}" })

keyboard.Listener(on_press=on_key_press).start()
mouse.Listener(on_click=on_click, on_scroll=on_scroll).start()

# Keep alive
while True:
    time.sleep(10)
