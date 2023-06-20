const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  borrow: (callback) => ipcRenderer.send("borrow", callback),
  scannedBook: (callback) => ipcRenderer.on("scannedBook", callback),
  borrower: (callback) => ipcRenderer.send("borrower", callback),
  return: (callback) => ipcRenderer.send("return", callback),
  loading: (callback) => ipcRenderer.on("loading", callback),
});
