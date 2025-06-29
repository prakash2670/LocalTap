const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Listen for key press events
  onKeyPressed: (callback) => {
    ipcRenderer.on('key-pressed', callback);
  },
  
  // Listen for mouse click events
  onMouseClick: (callback) => {
    ipcRenderer.on('mouse-click', callback);
  },
  
  // Get current statistics
  getStats: () => ipcRenderer.invoke('get-stats'),
  
  // Reset statistics
  resetStats: () => ipcRenderer.invoke('reset-stats'),
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});