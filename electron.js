const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Nécessaire pour accéder au middleware localhost
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Ajoutez votre icône
    title: 'OphtalmoPro - Cabinet d\'Ophtalmologie'
  });

  // Charger l'application
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Gestion des erreurs de certificat pour localhost
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    if (url.startsWith('http://localhost:53001')) {
      // Ignorer les erreurs de certificat pour le middleware eID local
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  });
}

app.whenReady().then(createWindow);

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

// IPC pour communication avec le renderer
ipcMain.handle('check-eid-middleware', async () => {
  // Ici vous pourriez ajouter des vérifications spécifiques Electron
  return { available: true };
});