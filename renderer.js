const keyboardStats = {};
const mouseStats = {};
const topKeysEl = document.getElementById('topKeysList');
const topMouseEl = document.getElementById('mouseTopList');
const statsEl = document.getElementById('realtimeStats');
const usernameEl = document.getElementById('username');

const socket = new WebSocket('ws://localhost:8765');

socket.onopen = () => {
  console.log('[WS] Connected');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('[WS] Message:', data);
  if (data.source === 'keyboard') {
    const key = data.name;
    keyboardStats[key] = (keyboardStats[key] || 0) + 1;
  } else if (data.source === 'mouse') {
    const m = data.name;
    mouseStats[m] = (mouseStats[m] || 0) + 1;
  }
  updateDisplay();
};

function updateDisplay() {
  const topKeys = Object.entries(keyboardStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topKeysEl.innerHTML = topKeys
    .map(([k, c]) => `
      <li class="flex justify-between border-b border-gray-700 py-1">
        <span>${k}</span><span class="text-blue-400 font-semibold">${c}</span>
      </li>
    `).join('');

  const topMouse = Object.entries(mouseStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  topMouseEl.innerHTML = topMouse
    .map(([k, c]) => `
      <li class="flex justify-between border-b border-gray-700 py-1">
        <span>${k}</span><span class="text-yellow-400 font-semibold">${c}</span>
      </li>
    `).join('');

  const totalKeys = Object.values(keyboardStats).reduce((a, b) => a + b, 0);
  const totalMouse = Object.values(mouseStats).reduce((a, b) => a + b, 0);
  statsEl.innerHTML = `
    <p class="mb-2">🧮 Keystrokes: <span class="text-green-400 font-bold">${totalKeys}</span></p>
    <p class="mb-2">🖱️ Mouse Events: <span class="text-yellow-400 font-bold">${totalMouse}</span></p>
    <p class="text-sm text-gray-400 italic">Updated in real-time</p>
  `;
}