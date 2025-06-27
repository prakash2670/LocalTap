const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let keyFrequency = {};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    mainWindow.loadFile('index.html');

    const python = spawn('python', [path.join(__dirname, 'keylogger.py')]);

    python.stdout.on('data', (data) => {
        try {
            const lines = data.toString().trim().split('\n');
            for (const line of lines) {
                const message = JSON.parse(line);

                let key = message.key || message.mouse || message.scroll || "Unknown";
                keyFrequency[key] = (keyFrequency[key] || 0) + 1;

                // Send top 10 keys to renderer
                const sorted = Object.entries(keyFrequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);

                mainWindow.webContents.send('update-top-keys', sorted);
            }
        } catch (e) {
            console.error("Invalid JSON:", data.toString());
        }
    });
}

app.whenReady().then(createWindow);
