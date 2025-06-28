const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => {
    const validChannels = [
      'key-pressed',
      'mouse-click',
      'mouse-scroll',
      'stats-update'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  invoke: (channel, data) => ipcRenderer.invoke(channel, data)
});