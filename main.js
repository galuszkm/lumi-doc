const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const express = require('express');
const fs = require('fs');

// Create Express server
const server = express();
const PORT = 3000;

// Serve static files from the React app
server.use(express.static(path.join(__dirname, 'doc-editor-ui/dist')));
server.use(express.static(path.join(__dirname, 'doc-view/dist')));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'doc-editor-ui/dist', 'index.html'));
});

server.get('/doc', (req, res) => {
  res.sendFile(path.join(__dirname, 'doc-view/dist', 'index.html'));
});

// Ensure correct MIME type for CSS files
server.get('/*.css', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
})

// API to get the config
server.get('/config', (req, res) => {
  fs.readFile('config.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading config file');
    }
    res.json(JSON.parse(data));
  });
  
});

// API to update the config
server.post('/config', express.json(), (req, res) => {
  const newConfig = req.body;
  fs.writeFile('config.json', JSON.stringify(newConfig, null, 2), (err) => {
    if (err) {
      return res.status(500).send('Error writing config file');
    }
    res.send('Config updated');
  });
});

// Start Express server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Electron main process
function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 800,
    titleBarStyle: 'visible',
    titleBarOverlay: {
      color: '#2b2b2b', // Set the background color for dark mode
      symbolColor: '#ffffff', // Set the color of the window controls (close, minimize, maximize)
      height: 30 // Optional: adjust the height of the title bar
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadURL(`http://localhost:${PORT}`);
}

app.on('ready', () => {
  // Check and apply the dark mode preference
  nativeTheme.themeSource = 'dark'
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('update-config', (event, newConfig) => {
  console.log('Config updated:', newConfig);
  // You can add additional logic here if needed
});
