const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  
  borrowBtn : (callback) => ipcRenderer.send("borrowBtn", callback),
  nfcScanned : (callback) => ipcRenderer.on("nfcScanned", callback),
  scannedBook : (callback) => ipcRenderer.on("scannedBook", callback),
  scannedPerson : (callback) => ipcRenderer.on("scannedPerson", callback),
  requestNfc : (callback) => ipcRenderer.on("requestNfc", callback),
});
