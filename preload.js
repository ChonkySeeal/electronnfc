const { contextBridge, ipcRenderer } = require('electron')



contextBridge.exposeInMainWorld("electronAPI", {
    BookScan: (callback) => ipcRenderer.on("book", callback),
    clicked: (callback) => ipcRenderer.send("buttonAction", callback),
  });