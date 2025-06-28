import keyboard
from pynput import mouse
import json
import os
import time
from datetime import datetime
from threading import Thread

class LocalTapLogger:
    def __init__(self):
        self.LOG_DIR = os.path.expanduser("~/.localtap/logs")
        os.makedirs(self.LOG_DIR, exist_ok=True)
        
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        self.current_log = {
            "date": self.current_date,
            "keystrokes": {},
            "total_keystrokes": 0,
            "mouse_clicks": 0,
            "mouse_scrolls": 0
        }
        
        self.running = True
        self.keyboard_listener = None
        self.mouse_listener = None

    def _send_event(self, event_type, data):
        """Send properly formatted JSON to Electron"""
        event = {"type": event_type, "data": data}
        print(json.dumps(event))
        sys.stdout.flush()

    def _save_log(self):
        """Save current log to file"""
        log_file = os.path.join(self.LOG_DIR, f"{self.current_date}.json")
        with open(log_file, "w") as f:
            json.dump(self.current_log, f, indent=2)

    def on_key(self, event):
        try:
            key = event.name.upper() if event.name else str(event.scan_code)
            if key == 'SPACE':
                key = 'Space'
            elif key == 'ENTER':
                key = 'Enter'

            # Update counts
            self.current_log["keystrokes"][key] = self.current_log["keystrokes"].get(key, 0) + 1
            self.current_log["total_keystrokes"] += 1

            # Send update
            self._send_event("key_press", {
                "key": key,
                "count": self.current_log["keystrokes"][key],
                "total": self.current_log["total_keystrokes"]
            })

        except Exception as e:
            self._send_event("error", {"message": str(e)})

    def on_click(self, x, y, button, pressed):
        if pressed:
            btn_name = str(button).replace('Button.', '')
            self.current_log["mouse_clicks"] += 1
            self._send_event("mouse_click", {
                "button": btn_name,
                "total": self.current_log["mouse_clicks"]
            })

    def on_scroll(self, x, y, dx, dy):
        direction = "up" if dy > 0 else "down"
        self.current_log["mouse_scrolls"] += 1
        self._send_event("mouse_scroll", {
            "direction": direction,
            "total": self.current_log["mouse_scrolls"]
        })

    def start(self):
        # Keyboard listener
        self.keyboard_listener = keyboard.hook(self.on_key)
        
        # Mouse listener
        self.mouse_listener = mouse.Listener(
            on_click=self.on_click,
            on_scroll=self.on_scroll
        )
        self.mouse_listener.start()

        # Periodic save
        while self.running:
            time.sleep(60)
            self._save_log()
            self._send_stats_update()

    def _send_stats_update(self):
        """Send periodic stats update"""
        sorted_keys = sorted(self.current_log["keystrokes"].items(), 
                           key=lambda x: x[1], reverse=True)
        top_keys = [{"key": k, "count": v} for k, v in sorted_keys[:10]]
        
        self._send_event("stats_update", {
            "total_keystrokes": self.current_log["total_keystrokes"],
            "top_keys": top_keys,
            "key_of_the_day": sorted_keys[0][0] if sorted_keys else None,
            "total_clicks": self.current_log["mouse_clicks"],
            "total_scrolls": self.current_log["mouse_scrolls"]
        })

    def stop(self):
        self.running = False
        keyboard.unhook(self.keyboard_listener)
        self.mouse_listener.stop()
        self._save_log()
        self._send_event("status", {"message": "Logger stopped"})

if __name__ == "__main__":
    import sys
    logger = LocalTapLogger()
    try:
        logger.start()
    except KeyboardInterrupt:
        logger.stop()