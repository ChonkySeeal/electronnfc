const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  borrow: (callback) => ipcRenderer.send("borrow", callback),
  scannedBook: (callback) => ipcRenderer.on("scannedBook", callback),
  borrower: (callback) => ipcRenderer.send("borrower", callback),
  return: (callback) => ipcRenderer.send("return", callback),
  returnOn: (callback) => ipcRenderer.on("return", callback),
  reset: (callback) => ipcRenderer.on("reset", callback),
  done: (callback) => ipcRenderer.on("done", callback),
  cancel: (callback) => ipcRenderer.send("cancel", callback),
});
