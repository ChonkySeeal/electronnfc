"use strict";
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const util = require("util");
const { Client } = require("@notionhq/client");

// Initializing a client
const notion = new Client({
  auth: "secret_lj8NMQpObd8kZLp0eABz9O3vvr6XtLpzLqa37a0Xz1s",
});

let mainWindow;
const { NFC } = require("nfc-pcsc");
const nfc = new NFC();
nfc.on("reader", (reader) => {
  if (mainWindow) {
    mainWindow.webContents.send("attach-device", {
      message: `NFC (${reader.reader.name}): device attached`,
    });
  }
  console.log(`NFC (${reader.reader.name}): device attached`);
  reader.on("card", (card) => {
    if (mainWindow) {
      console.log(`NFC (${reader.reader.name}): card detected`, card.uid);

      var uuidValue = card.uid;
      

      (async () => {
        const databaseId = "c8627e1066374f04a23f4e780c0c5b1e";
        await notion.databases.query({
          database_id: databaseId,
          filter: {
            property: "NFC",
            rich_text: {
              equals: uuidValue,
            },
          },
        }).then(r => {
        console.dir(r, {colors:true, depth:20})
        const propertiesData = {
          title: r.results[0].properties["제목"].title[0].plain_text,
          nfc: r.results[0].properties["NFC"].rich_text[0].plain_text,
          author:
          r.results[0].properties["저자"].rich_text[0].plain_text,
          status : r.results[0].properties["상태"].status.name,
          person : r.results[0].properties["대출한 사람"]?.people[0]?.name
        }

        mainWindow.webContents.send("book", propertiesData);
      })
    
        
      })()
      


    }
  });

  ipcMain.on("buttonAction", (event, dto) => {
    (async () => {
      const databaseId = "84179885bbc8434e89441ec56313c014"; 
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: "NFC",
          rich_text: {
            contains: uuidValue,
          },
        },
      }).then(r => {
        
      });


  console.dir(notionData.results, { colors: true, depth: 20 });
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
