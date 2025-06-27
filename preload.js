const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onUpdateTopKeys: (callback) => ipcRenderer.on('update-top-keys', (event, data) => callback(data))
});
