const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  ScanBook: (callback) => ipcRenderer.on("ScanBook", callback),
  ScanNameTag: (callback) => ipcRenderer.on("ScanNameTag", callback),
  waitForBorrowBookRequest: (callback) => ipcRenderer.on("waitForBorrowBookRequest", callback),
  borrowBook : (callback) => ipcRenderer.send("borrowBook", callback),

});
