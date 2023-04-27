'use strict'
const { app, BrowserWindow, webContents } = require('electron')
const path = require('path')
const { Client } = require("@notionhq/client")

// Initializing a client
var myHeaders = new Headers();
myHeaders.append("Notion-Version", "2022-06-28");
myHeaders.append("Content-Type", "application/json; charset=utf-8");
myHeaders.append("Authorization", "Bearer secret_lj8NMQpObd8kZLp0eABz9O3vvr6XtLpzLqa37a0Xz1s");
myHeaders.append("Cookie", "__cf_bm=.5J8KJt1PDqQ7gGr9f0sscLjW1rawW0moWnQVup4jq0-1682583429-0-Adp3Tyq6alDicV50bM2Oa8xaT8ZTepCpI6j/MS4S/XfbWv+aBuA3cPxXrbR70D8m4ie2Om3JKkjG/z52Dgy0jPY=");






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
        
        if (mainWindow) {
            console.log(`NFC (${reader.reader.name}): card detected`, card.uid)
            

            var uuidValue = card.uid;


            var raw = JSON.stringify({
                "filter": {
                    "property": "NFC",
                    "title": {
                        "equals": uuidValue
                    }
                }
            });


            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("https://api.notion.com/v1/databases/c8627e1066374f04a23f4e780c0c5b1e/query", requestOptions)
                .then(response => response.json())
                .then(response => {
                    mainWindow.webContents.send('scanned', response.results[0])
                })
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
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
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })



    mainWindow.loadFile('index.html')
    mainWindow.setMenu(null)
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