const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let keyloggerProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  startKeylogger();
}

function startKeylogger() {
  keyloggerProcess = spawn('python', [path.join(__dirname, 'keylogger.py')]);

  let buffer = '';
  keyloggerProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    
    // Handle multiple JSON messages in buffer
    while (true) {
      try {
        const newlineIndex = buffer.indexOf('\n');
        if (newlineIndex === -1) break;
        
        const message = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);
        
        if (message) {
          const event = JSON.parse(message);
          handleKeyloggerEvent(event);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
        break;
      }
    }
  });

  keyloggerProcess.stderr.on('data', (data) => {
    console.error(`Keylogger error: ${data}`);
  });

  keyloggerProcess.on('close', (code) => {
    console.log(`Keylogger exited with code ${code}`);
    if (code !== 0) {
      setTimeout(startKeylogger, 1000); // Auto-restart
    }
  });
}

function stopKeylogger() {
  if (keyloggerProcess) {
    keyloggerProcess.kill();
    keyloggerProcess = null;
  }
}

function handleKeyloggerEvent(event) {
  if (!mainWindow) return;

  switch (event.type) {
    case 'key_press':
      mainWindow.webContents.send('key-pressed', event.data);
      break;
    case 'mouse_click':
      mainWindow.webContents.send('mouse-click', event.data);
      break;
    case 'mouse_scroll':
      mainWindow.webContents.send('mouse-scroll', event.data);
      break;
    case 'stats_update':
      mainWindow.webContents.send('stats-update', event.data);
      break;
    case 'error':
      console.error('Keylogger error:', event.data.message);
      break;
    case 'status':
      console.log('Keylogger status:', event.data.message);
      break;
    default:
      console.log('Unknown event type:', event.type);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopKeylogger();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC Handlers
ipcMain.handle('get-initial-stats', async () => {
  return {
    totalKeystrokes: 0,
    topKeys: [],
    keyOfTheDay: null,
    totalClicks: 0,
    totalScrolls: 0
  };
});