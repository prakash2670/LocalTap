const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let keyloggerProcess = null;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Create tray icon
  tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show App', 
      click: () => {
        if (mainWindow.isDestroyed()) {
          createWindow();
        } else {
          mainWindow.show();
        }
      }
    },
    { 
      label: 'Quit', 
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('LocalTap - Activity Tracker');
  tray.setContextMenu(contextMenu);

  // Handle window minimization
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Handle window closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // When window is shown, request fresh stats
  mainWindow.on('show', () => {
    if (keyloggerProcess && !keyloggerProcess.killed) {
      keyloggerProcess.stdin.write('request_stats\n');
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    startKeylogger();
  });
}

function startKeylogger() {
  if (keyloggerProcess && !keyloggerProcess.killed) return;

  keyloggerProcess = spawn('python', [path.join(__dirname, 'keylogger.py')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let buffer = '';
  keyloggerProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    try {
      const messages = buffer.split('\n');
      buffer = messages.pop();
      messages.forEach(msg => {
        if (msg.trim()) {
          const event = JSON.parse(msg);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send(event.type, event.data);
          }
        }
      });
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  keyloggerProcess.stderr.on('data', (data) => {
    console.error(`Keylogger error: ${data}`);
  });

  keyloggerProcess.on('close', (code) => {
    console.log(`Keylogger exited with code ${code}`);
    if (code !== 0 && !isQuitting) {
      setTimeout(startKeylogger, 1000);
    }
    keyloggerProcess = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  if (keyloggerProcess) {
    keyloggerProcess.kill();
  }
});