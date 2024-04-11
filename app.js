const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 500,
        height: 500,
        minWidth: 500,
        minHeight: 500,
        fullscreenable: false,
        nodeIntegration: false,
        contextIsolation: true,
        nodeIntegrationInWorker: false,
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            contextIsolation: true
        }
    });
    win.loadFile('index.html');
    win.menuBarVisible = false;
})