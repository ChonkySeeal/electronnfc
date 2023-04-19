'use strict'
const { app, BrowserWindow, webContents } = require('electron')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
const {
    NFC
} = require('nfc-pcsc')
const nfc = new NFC()
nfc.on('reader', reader => {
    if (mainWindow) {
        mainWindow.webContents.send('attach-device', { message: `NFC (${reader.reader.name}): device attached` })
    }
    console.log(`NFC (${reader.reader.name}): device attached`)
    reader.on('card', card => {
        console.log(`NFC (${reader.reader.name}): card detected`, card.uid)
        if (mainWindow) {
            mainWindow.webContents.send('card', { message: `NFC (${reader.reader.name}): card detected`, card })
        }
    })
    reader.on('error', err => {
        console.log(`NFC (${reader.reader.name}): an error occurred`, err)
    })
    reader.on('end', () => {
        console.log(`NFC (${reader.reader.name}): device removed`)
        if (mainWindow) {
            mainWindow.webContents.send('remove-device', { message: `NFC (${reader.reader.name}): device removed` })
        }
    })
})
nfc.on('error', err => {
    console.log('NFC: an error occurred', err)
})

function createWindow() {
    // Create the browser window.

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.