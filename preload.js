// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('localtapAPI', {
    getUsername: () => ipcRenderer.invoke('get-username'),
    setUsername: (name) => ipcRenderer.invoke('set-username', name),
    getKeyStats: () => ipcRenderer.invoke('get-keystats')
});
