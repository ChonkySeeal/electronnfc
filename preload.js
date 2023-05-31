const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readyForBook: (callback) => ipcRenderer.on("readyForBook", callback),
  ScanBook: (callback) => ipcRenderer.on("book", callback),
  ScanNameTag: (callback) => ipcRenderer.on("nametag", callback),
  BorrowBook: (callback) => ipcRenderer.send("borrowBook", callback),
});
