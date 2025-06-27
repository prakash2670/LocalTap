// === main.js (Electron Main Process) ===
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const LOG_DIR = path.join(os.homedir(), '.localtap', 'logs');
const USER_FILE = path.join(os.homedir(), '.localtap', 'user.json');

let mainWindow;
let keyStats = {};

function createDataDirs() {
    const baseDir = path.join(os.homedir(), '.localtap');
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
}

function saveDailyLog(event) {
    const dateStr = new Date().toISOString().slice(0, 10);
    const logPath = path.join(LOG_DIR, `${dateStr}.json`);
    fs.writeFileSync(logPath, JSON.stringify(event, null, 2));
}

function updateStats(data) {
    const key = data.key || data.special || 'Unknown';
    keyStats[key] = (keyStats[key] || 0) + 1;
    saveDailyLog({ timestamp: Date.now(), key });
}

function loadUsername() {
    try {
        if (fs.existsSync(USER_FILE)) {
            return JSON.parse(fs.readFileSync(USER_FILE)).username;
        }
    } catch (e) {
        console.error("Failed to load username", e);
    }
    return null;
}

function saveUsername(username) {
    fs.writeFileSync(USER_FILE, JSON.stringify({ username }));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    const python = spawn('python', [path.join(__dirname, 'keylogger.py')]);

    python.stdout.on('data', (data) => {
        try {
            const message = JSON.parse(data.toString());
            updateStats(message);
        } catch (e) {
            console.error("Bad JSON from Python:", data.toString());
        }
    });

    ipcMain.handle('get-username', () => loadUsername());
    ipcMain.on('set-username', (event, username) => saveUsername(username));
    ipcMain.handle('get-keystats', () => keyStats);
}

app.whenReady().then(() => {
    createDataDirs();
    createWindow();
});
