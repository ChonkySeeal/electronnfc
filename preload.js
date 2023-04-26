const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    ScanCallBack: (callback) => ipcRenderer.on('scanDetected', callback)
})