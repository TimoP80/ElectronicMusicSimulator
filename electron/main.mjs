import { app, BrowserWindow, Menu, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

function createAboutMenu() {
  const aboutInfo = {
    appName: 'Electronic Music Career Simulator',
    version: app.getVersion(),
    author: 'Timo Pitkänen',
    description: 'A career simulator game where you build your electronic music career from bedroom producer to festival headliner.',
    website: 'https://github.com/TimoP80/ElectronicMusicSimulator'
  };

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: `About ${aboutInfo.appName}`,
    message: aboutInfo.appName,
    detail: `Version ${aboutInfo.version}\n\nAuthor: ${aboutInfo.author}\n\n${aboutInfo.description}\n\nGitHub: ${aboutInfo.website}`,
    buttons: ['OK'],
    icon: path.join(__dirname, '../public/covers/icon.png')
  });
}

function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'About',
      click: createAboutMenu
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'Electronic Music Career Simulator',
    backgroundColor: '#050507',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  createAppMenu();

  if (isDev) {
    // Load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});