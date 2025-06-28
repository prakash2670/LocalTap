import keyboard
from pynput import mouse
import json
import sys
import time
from threading import Thread

class LocalTapLogger:
    def __init__(self):
        self.running = True
        self.stats = {
            "keystrokes": {},
            "total_keystrokes": 0,
            "mouse_clicks": 0,
            "mouse_scrolls": 0
        }

    def send_event(self, event_type, data):
        try:
            event = {"type": event_type, "data": data}
            sys.stdout.write(json.dumps(event) + "\n")
            sys.stdout.flush()
        except Exception as e:
            error = {"type": "error", "data": {"message": str(e)}}
            sys.stdout.write(json.dumps(error) + "\n")
            sys.stdout.flush()

    def on_key(self, event):
        try:
            key = event.name.upper() if event.name else str(event.scan_code)
            if key == 'SPACE':
                key = 'Space'
            elif key == 'ENTER':
                key = 'Enter'

            self.stats["keystrokes"][key] = self.stats["keystrokes"].get(key, 0) + 1
            self.stats["total_keystrokes"] += 1

            self.send_event("key_press", {
                "key": key,
                "count": self.stats["keystrokes"][key],
                "total": self.stats["total_keystrokes"]
            })

        except Exception as e:
            self.send_event("error", {"message": str(e)})

    def on_click(self, x, y, button, pressed):
        if pressed:
            try:
                btn_name = str(button).replace('Button.', '')
                self.stats["mouse_clicks"] += 1
                self.send_event("mouse_click", {
                    "button": btn_name,
                    "total": self.stats["mouse_clicks"]
                })
            except Exception as e:
                self.send_event("error", {"message": str(e)})

    def on_scroll(self, x, y, dx, dy):
        try:
            direction = "up" if dy > 0 else "down"
            self.stats["mouse_scrolls"] += 1
            self.send_event("mouse_scroll", {
                "direction": direction,
                "total": self.stats["mouse_scrolls"]
            })
        except Exception as e:
            self.send_event("error", {"message": str(e)})

    def send_stats(self):
        try:
            sorted_keys = sorted(self.stats["keystrokes"].items(), 
                             key=lambda x: x[1], reverse=True)
            top_keys = [{"key": k, "count": v} for k, v in sorted_keys[:10]]
            
            self.send_event("stats_update", {
                "total_keystrokes": self.stats["total_keystrokes"],
                "top_keys": top_keys,
                "key_of_the_day": sorted_keys[0][0] if sorted_keys else None,
                "total_clicks": self.stats["mouse_clicks"],
                "total_scrolls": self.stats["mouse_scrolls"]
            })
        except Exception as e:
            self.send_event("error", {"message": str(e)})

    def start(self):
        # Start keyboard listener
        keyboard.hook(self.on_key)
        
        # Start mouse listener
        mouse_listener = mouse.Listener(
            on_click=self.on_click,
            on_scroll=self.on_scroll
        )
        mouse_listener.start()

        # Handle stdin commands
        def read_stdin():
            while self.running:
                try:
                    line = sys.stdin.readline().strip()
                    if line == 'request_stats':
                        self.send_stats()
                except:
                    break

        stdin_thread = Thread(target=read_stdin)
        stdin_thread.daemon = True
        stdin_thread.start()

        # Main loop
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            mouse_listener.stop()
            keyboard.unhook_all()
            self.send_event("status", {"message": "Logger stopped"})

if __name__ == "__main__":
    logger = LocalTapLogger()
    try:
        logger.start()
    except Exception as e:
        sys.stderr.write(f"Error: {str(e)}\n")
        sys.exit(1)