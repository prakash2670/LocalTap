const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  // Start WebSocket server
  spawn('python', ['server.py'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore'
  });

  // Start input tracker
  spawn('python', ['input_tracker.py'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore'
  });

  createWindow();
});
