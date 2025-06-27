# 🖥️ LocalTap

**LocalTap** is a cross-platform desktop application that tracks **keyboard** and **mouse input activity** — clicks, scrolls, and key presses — with a privacy-first approach. Built with [Electron](https://www.electronjs.org/), it logs daily usage data locally and provides a responsive dashboard with real-time stats and charts.

<!-- Optional: Add a screenshot after your UI is built -->
<!-- ![screenshot](./assets/screenshot.png) -->

---

## 📦 Features

- ✅ Global keyboard input tracking (per-key count)
- ✅ Mouse tracking (left/right clicks, scrolls)
- ✅ Real-time dashboard UI with Chart.js
- ✅ Daily activity logging as JSON files
- ✅ Lightweight, local-only, privacy-respecting
- ✅ Cross-platform (Windows, macOS, Linux)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js (LTS version recommended)](https://nodejs.org/)
- Git (optional, for cloning)

### Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/LocalTap.git
cd LocalTap
npm install
```

### Start the App

```bash
npm start
```

> 📝 On first run, if `iohook` causes issues, run:
> ```bash
> npx electron-rebuild
> ```

---

## 🧠 How It Works

- The **main process** (`main.js`) launches the Electron window and listens to global input using `iohook`.
- **Mouse and keyboard stats** are saved in `logs/log-YYYY-MM-DD.json`.
- The **renderer UI** (`index.html`, `renderer.js`) displays real-time activity using [Chart.js](https://www.chartjs.org/).
- A secure **preload script** connects backend and frontend using Electron’s context bridge (`preload.js`).

---

## 📁 Project Structure

```
LocalTap/
├── main.js          # Electron app entry + iohook setup
├── preload.js       # Secure bridge to renderer
├── index.html       # Frontend UI
├── renderer.js      # JS logic for stats and chart updates
├── style.css        # UI styling
├── logs/            # Daily log files (JSON)
├── package.json     # Project metadata & scripts
```

---

## 📊 Example Log Output

```json
{
  "leftClick": 42,
  "rightClick": 11,
  "scroll": 6,
  "keys": {
    "a": 18,
    "b": 6,
    "Shift": 3
  }
}
```

---

## 📦 Build Executable

To package the app as a `.exe` or `.app`, install electron-builder:

```bash
npm install --save-dev electron-builder
```

Then, update your `package.json`:

```json
"build": {
  "appId": "com.localtap.desktop",
  "productName": "LocalTap",
  "files": [
    "**/*"
  ],
  "win": {
    "target": "nsis"
  }
}
```

And build:

```bash
npm run build
```

---

## 📄 License

MIT License © 2025 [G Bhanu Prakash]

---

## 🙌 Contributions

Contributions are welcome!  
Open an issue for bugs, ideas, or feature requests.  
Fork the repo and submit a pull request to improve LocalTap.

---

## 🔒 Privacy Statement

LocalTap is a privacy-first application.  
No input data is sent anywhere — all logs are stored locally and never transmitted or synced externally.
