const keyboardStats = {};
const mouseStats = {};

const keyboardTopEl = document.getElementById('keyboard-top');
const mouseTopEl = document.getElementById('mouse-top');
const keyboardStatsEl = document.getElementById('keyboard-stats');
const mouseStatsEl = document.getElementById('mouse-stats');

function updateDisplay() {
  const topKeys = Object.entries(keyboardStats).sort((a,b)=>b[1]-a[1]).slice(0, 5);
  keyboardTopEl.innerHTML = topKeys.map(([k, c]) => `<li><b>${k}</b>: ${c}</li>`).join('');
  keyboardStatsEl.innerHTML = Object.entries(keyboardStats).map(([k, c]) => `<div class="key-entry"><span>${k}</span><span>${c}</span></div>`).join('');

  const topMouse = Object.entries(mouseStats).sort((a,b)=>b[1]-a[1]).slice(0, 5);
  mouseTopEl.innerHTML = topMouse.map(([k, c]) => `<li><b>${k}</b>: ${c}</li>`).join('');
  mouseStatsEl.innerHTML = Object.entries(mouseStats).map(([k, c]) => `<div class="key-entry"><span>${k}</span><span>${c}</span></div>`).join('');
}

const socket = new WebSocket('ws://localhost:8765');
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  const source = data.source;
  const name = data.name;

  if (source === 'keyboard') {
    keyboardStats[name] = (keyboardStats[name] || 0) + 1;
  } else if (source === 'mouse') {
    mouseStats[name] = (mouseStats[name] || 0) + 1;
  }

  updateDisplay();
};
