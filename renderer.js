// This file will be loaded in the HTML and uses the exposed electronAPI
let keyStats = {};
let mouseStats = { left: 0, right: 0, middle: 0 };

// Uiohook key code to key name mapping
const keyCodeMap = {
  // Function keys
  59: 'F1', 60: 'F2', 61: 'F3', 62: 'F4', 63: 'F5', 64: 'F6',
  65: 'F7', 66: 'F8', 67: 'F9', 68: 'F10', 87: 'F11', 88: 'F12',
  
  // Number row (main keyboard)
  41: '`', 2: '1', 3: '2', 4: '3', 5: '4', 6: '5', 7: '6', 8: '7', 9: '8', 10: '9', 11: '0', 12: '-', 13: '=',
  
  // Letters
  16: 'Q', 17: 'W', 18: 'E', 19: 'R', 20: 'T', 21: 'Y', 22: 'U', 23: 'I', 24: 'O', 25: 'P', 26: '[', 27: ']',
  30: 'A', 31: 'S', 32: 'D', 33: 'F', 34: 'G', 35: 'H', 36: 'J', 37: 'K', 38: 'L', 39: ';', 40: "'",
  44: 'Z', 45: 'X', 46: 'C', 47: 'V', 48: 'B', 49: 'N', 50: 'M', 51: ',', 52: '.', 53: '/',
  
  // Special characters
  43: '\\',
  
  // Control keys
  1: 'Esc', 14: 'Backspace', 15: 'Tab', 28: 'Enter', 29: 'Ctrl', 42: 'Shift', 54: 'Right Shift',
  56: 'Alt', 57: 'Space', 58: 'Caps Lock',
  
  // Arrow keys
  72: 'Up Arrow', 75: 'Left Arrow', 77: 'Right Arrow', 80: 'Down Arrow',
  
  // Other navigation keys
  71: 'Home', 73: 'Page Up', 79: 'End', 81: 'Page Down', 82: 'Insert', 83: 'Delete',
  
  // Numpad keys (these will be normalized to regular numbers)
  69: 'Num Lock',
  55: 'Numpad *', 74: 'Numpad -', 78: 'Numpad +',
  96: 'Numpad Enter', 83: 'Numpad .',
  // Note: Numpad numbers 0-9 will be normalized to regular numbers
  
  // Windows/Cmd keys
  3675: 'Left Cmd', 3676: 'Right Cmd', 3677: 'Menu',
  
  // Print Screen, Scroll Lock, Pause
  3639: 'Print Screen', 70: 'Scroll Lock', 3653: 'Pause'
};

const mouseButtonMap = {
  1: 'Left',
  2: 'Right', 
  3: 'Middle'
};

// Function to normalize key codes (combine regular and numpad numbers)
function normalizeKeyCode(keycode) {
  // Map numpad numbers to regular numbers
  const numpadToRegular = {
    82: 11,  // Numpad 0 -> 0
    79: 2,   // Numpad 1 -> 1
    80: 3,   // Numpad 2 -> 2
    81: 4,   // Numpad 3 -> 3
    75: 5,   // Numpad 4 -> 4
    76: 6,   // Numpad 5 -> 5
    77: 7,   // Numpad 6 -> 6
    71: 8,   // Numpad 7 -> 7
    72: 9,   // Numpad 8 -> 8
    73: 10   // Numpad 9 -> 9
  };
  
  return numpadToRegular[keycode] || keycode;
}

// Function to get display name for a key
function getKeyDisplayName(keycode) {
  const keyName = keyCodeMap[keycode];
  
  if (keyName) {
    return keyName;
  }
  
  // Fallback for unknown keys
  return `Key ${keycode}`;
}

function updateDisplay() {
  // Update key statistics
  updateKeyStats();
  
  // Update mouse statistics
  updateMouseStats();
  
  // Update last activity
  document.getElementById('last-activity').textContent = new Date().toLocaleTimeString();
}

function updateKeyStats() {
  const keyList = document.getElementById('key-list');
  
  // Normalize key stats (combine numpad and regular numbers)
  const normalizedStats = {};
  Object.entries(keyStats).forEach(([keycode, count]) => {
    const normalizedKey = normalizeKeyCode(parseInt(keycode));
    normalizedStats[normalizedKey] = (normalizedStats[normalizedKey] || 0) + count;
  });
  
  // Get top 10 keys
  const sortedKeys = Object.entries(normalizedStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  keyList.innerHTML = '';
  
  if (sortedKeys.length === 0) {
    keyList.innerHTML = '<li>No keys pressed yet</li>';
    return;
  }
  
  sortedKeys.forEach(([keycode, count]) => {
    const li = document.createElement('li');
    const keyName = getKeyDisplayName(parseInt(keycode));
    li.innerHTML = `<span class="key-name">${keyName}</span> <span class="key-count">${count}</span>`;
    keyList.appendChild(li);
  });
  
  // Update total key count
  const totalKeys = Object.values(keyStats).reduce((sum, count) => sum + count, 0);
  document.getElementById('total-keys').textContent = totalKeys;
}

function updateMouseStats() {
  document.getElementById('left-clicks').textContent = mouseStats.left;
  document.getElementById('right-clicks').textContent = mouseStats.right;
  document.getElementById('middle-clicks').textContent = mouseStats.middle;
  
  const totalClicks = mouseStats.left + mouseStats.right + mouseStats.middle;
  document.getElementById('total-clicks').textContent = totalClicks;
}

function resetStats() {
  if (confirm('Are you sure you want to reset all statistics?')) {
    window.electronAPI.resetStats().then(() => {
      keyStats = {};
      mouseStats = { left: 0, right: 0, middle: 0 };
      updateDisplay();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  // Check if electronAPI is available
  if (!window.electronAPI) {
    console.error('electronAPI not available!');
    return;
  }
  
  // Load initial stats
  window.electronAPI.getStats().then(stats => {
    console.log('Initial stats loaded:', stats);
    keyStats = stats.keys || {};
    mouseStats = stats.mouse || { left: 0, right: 0, middle: 0 };
    updateDisplay();
  }).catch(err => {
    console.error('Error loading initial stats:', err);
  });
  
  // Listen for key press events
  window.electronAPI.onKeyPressed((event, data) => {
    console.log('Key press received in renderer:', data);
    keyStats = data.stats;
    updateDisplay();
  });
  
  // Listen for mouse click events
  window.electronAPI.onMouseClick((event, data) => {
    console.log('Mouse click received in renderer:', data);
    mouseStats = data.stats;
    updateDisplay();
  });
  
  // Add reset button event listener
  document.getElementById('reset-btn').addEventListener('click', resetStats);
  
  // Update display initially
  updateDisplay();
  
  console.log('Renderer initialized successfully');
});

// Clean up listeners when page unloads
window.addEventListener('beforeunload', () => {
  window.electronAPI.removeAllListeners('key-pressed');
  window.electronAPI.removeAllListeners('mouse-click');
});