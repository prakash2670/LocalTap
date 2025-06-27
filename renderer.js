const { ipcRenderer } = require('electron');

ipcRenderer.on('top-keys', (event, keys) => {
    const list = document.getElementById('key-list');
    list.innerHTML = '';
    keys.forEach(([key, count]) => {
        const li = document.createElement('li');
        li.textContent = `${key} — ${count}`;
        list.appendChild(li);
    });
});
