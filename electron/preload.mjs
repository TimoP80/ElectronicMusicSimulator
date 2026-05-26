const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // Platform info
  platform: process.platform,
  
  // File system (for save/load if needed)
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
});

// Notify if we're running in Electron
window.isElectron = true;
window.electronVersion = process.versions.electron;