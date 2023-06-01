const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { Client } = require("@notionhq/client");
const { NFC } = require("nfc-pcsc");

// Initializing a client
const notion = new Client({
  auth: "secret_lj8NMQpObd8kZLp0eABz9O3vvr6XtLpzLqa37a0Xz1s",
});

let mainWindow;

const nfc = new NFC();

let nfcDto=100 ;

ipcMain.on("borrowBook", (event, dto) => {
  console.log(nfcDto)
  nfcDto = 200;
  console.log(nfcDto)
});

ipcMain.on("readyForBook", (event, dto) => {});

nfc.on("reader", (reader) => {
  reader.on("card", (card) => {
    var uuidValue = card.uid;
    console.log(`card detected`, card.uid);
    const databaseId = "c8627e1066374f04a23f4e780c0c5b1e";
    (async () => {
      await notion.databases
        .query({
          database_id: databaseId,
          filter: {
            property: "NFC",
            rich_text: {
              equals: uuidValue,
              equals: uuidValue,
            },
          },
        })
        .then((r) => {
          mainWindow.webContents.send("book", r.results[0]);
        })
        .catch((e) => {
          console.dir(e, { colors: true, depth: 20 });
        });
    })();
  });

  reader.on("error", (err) => {
    console.log(`NFC (${reader.reader.name}): an error occurred`, err);
  });
  reader.on("end", () => {
    console.log(`NFC (${reader.reader.name}): device removed`);
    if (mainWindow) {
      mainWindow.webContents.send("remove-device", {
        message: `NFC (${reader.reader.name}): device removed`,
      });
    }
  });
});

nfc.on("error", (err) => {
  console.log("NFC: an error occurred", err);
});

function createWindow() {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.setMenu(null);
  mainWindow.webContents.openDevTools();
  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
