const { ipcRenderer } = require('electron');

const usernameInput = document.getElementById('usernameInput');
const saveBtn = document.getElementById('saveUsername');
const welcomeDiv = document.getElementById('welcome');
const keyStatsList = document.getElementById('keyStats');

// Load username on start
ipcRenderer.invoke('get-username').then(name => {
    if (name) {
        welcomeDiv.textContent = `Welcome, ${name}!`;
        usernameInput.value = name;
    }
});

// Save username
saveBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name.length > 0) {
        ipcRenderer.send('set-username', name);
        welcomeDiv.textContent = `Welcome, ${name}!`;
    }
});

// Fetch and render top keys
function updateKeyStats() {
    ipcRenderer.invoke('get-keystats').then(stats => {
        const sorted = Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        keyStatsList.innerHTML = '';

        if (sorted.length === 0) {
            keyStatsList.innerHTML = '<li>No data yet</li>';
            return;
        }

        for (const [key, count] of sorted) {
            const label = key.startsWith('Key.') ? key : `"${key}"`;
            const li = document.createElement('li');
            li.textContent = `${label} — ${count}`;
            keyStatsList.appendChild(li);
        }
    });
}

// Refresh every 3 seconds
setInterval(updateKeyStats, 3000);

// Also update when app is focused
window.addEventListener('focus', updateKeyStats);
