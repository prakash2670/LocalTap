const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;
let keyStats = {};
let mouseStats = { left: 0, right: 0, middle: 0 };
let uIOhook;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

function initializeTracker() {
  try {
    // Try different import methods for uiohook-napi
    try {
      uIOhook = require('uiohook-napi').uIOhook;
    } catch (e1) {
      try {
        const uiohookModule = require('uiohook-napi');
        uIOhook = uiohookModule.uIOhook || uiohookModule;
      } catch (e2) {
        console.error('Failed to import uiohook-napi:', e1.message, e2.message);
        return;
      }
    }

    if (!uIOhook) {
      console.error('uIOhook is undefined after import');
      return;
    }

    console.log('uIOhook imported successfully:', typeof uIOhook);

    // Set up event listeners
    uIOhook.on('keydown', (e) => {
      try {
        console.log(`Key Pressed: ${e.keycode}`);
        
        // Track key statistics
        if (keyStats[e.keycode]) {
          keyStats[e.keycode]++;
        } else {
          keyStats[e.keycode] = 1;
        }

        // Send to renderer
        if (win && !win.isDestroyed()) {
          win.webContents.send('key-pressed', {
            keycode: e.keycode,
            stats: keyStats
          });
        }
      } catch (error) {
        console.error('Error handling keydown:', error);
      }
    });

    uIOhook.on('mousedown', (e) => {
      try {
        console.log(`Mouse Button: ${e.button}`);
        
        // Track mouse statistics
        switch (e.button) {
          case 1:
            mouseStats.left++;
            break;
          case 2:
            mouseStats.right++;
            break;
          case 3:
            mouseStats.middle++;
            break;
        }

        // Send to renderer
        if (win && !win.isDestroyed()) {
          win.webContents.send('mouse-click', {
            button: e.button,
            stats: mouseStats
          });
        }
      } catch (error) {
        console.error('Error handling mousedown:', error);
      }
    });

    // Start the hook
    if (typeof uIOhook.start === 'function') {
      uIOhook.start();
      console.log('uiohook started successfully');
    } else {
      console.log('uiohook auto-started (no start method needed)');
    }

  } catch (error) {
    console.error('Failed to initialize uiohook:', error);
  }
}

function stopTracker() {
  try {
    if (uIOhook && typeof uIOhook.stop === 'function') {
      uIOhook.stop();
      console.log('uiohook stopped');
    } else {
      console.log('uiohook cleanup (no stop method available)');
    }
  } catch (error) {
    console.error('Error stopping uiohook:', error);
  }
}

// IPC handlers
ipcMain.handle('get-stats', () => {
  return {
    keys: keyStats,
    mouse: mouseStats
  };
});

ipcMain.handle('reset-stats', () => {
  keyStats = {};
  mouseStats = { left: 0, right: 0, middle: 0 };
  return true;
});

app.whenReady().then(() => {
  createWindow();
  
  // Initialize tracker after window is ready
  setTimeout(() => {
    initializeTracker();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  stopTracker();
});

app.on('window-all-closed', () => {
  stopTracker();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});