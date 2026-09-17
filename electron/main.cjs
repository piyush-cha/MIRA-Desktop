const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Suppress GPU disk cache lock errors in Windows environment
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-http-cache');

let mainWindow;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  const hasPreload = fs.existsSync(preloadPath);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: 'MIRA — Enterprise SAP Material Intelligence & Harmonization Platform',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: hasPreload ? preloadPath : undefined
    },
    backgroundColor: '#0B0F17'
  });

  const devUrl = 'http://localhost:5173';
  const distPath = path.join(__dirname, '../dist/index.html');

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(devUrl);
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL(devUrl);
  }

  // Fallback to built dist files if dev server is not running
  mainWindow.webContents.on('did-fail-load', (event, errorCode) => {
    if (errorCode !== -3 && fs.existsSync(distPath)) { // -3 is ABORTED
      mainWindow.loadFile(distPath);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
