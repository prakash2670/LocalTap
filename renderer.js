// This file will be loaded in the HTML and uses the exposed electronAPI
let keyStats = {};
let mouseStats = { left: 0, right: 0, middle: 0 };

// Key code to key name mapping (common keys)
const keyCodeMap = {
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Ctrl',
  18: 'Alt',
  27: 'Escape',
  32: 'Space',
  37: 'Left Arrow',
  38: 'Up Arrow',
  39: 'Right Arrow',
  40: 'Down Arrow',
  46: 'Delete',
  65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G', 72: 'H',
  73: 'I', 74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 80: 'P',
  81: 'Q', 82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 88: 'X',
  89: 'Y', 90: 'Z',
  48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9'
};

const mouseButtonMap = {
  1: 'Left',
  2: 'Right', 
  3: 'Middle'
};

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
  
  // Get top 10 keys
  const sortedKeys = Object.entries(keyStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  keyList.innerHTML = '';
  
  if (sortedKeys.length === 0) {
    keyList.innerHTML = '<li>No keys pressed yet</li>';
    return;
  }
  
  sortedKeys.forEach(([keycode, count]) => {
    const li = document.createElement('li');
    const keyName = keyCodeMap[keycode] || `Key ${keycode}`;
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
  // Load initial stats
  window.electronAPI.getStats().then(stats => {
    keyStats = stats.keys || {};
    mouseStats = stats.mouse || { left: 0, right: 0, middle: 0 };
    updateDisplay();
  });
  
  // Listen for key press events
  window.electronAPI.onKeyPressed((event, data) => {
    keyStats = data.stats;
    updateDisplay();
  });
  
  // Listen for mouse click events
  window.electronAPI.onMouseClick((event, data) => {
    mouseStats = data.stats;
    updateDisplay();
  });
  
  // Add reset button event listener
  document.getElementById('reset-btn').addEventListener('click', resetStats);
  
  // Update display initially
  updateDisplay();
});

// Clean up listeners when page unloads
window.addEventListener('beforeunload', () => {
  window.electronAPI.removeAllListeners('key-pressed');
  window.electronAPI.removeAllListeners('mouse-click');
});