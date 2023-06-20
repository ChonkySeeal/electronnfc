const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { Client } = require("@notionhq/client");
const { NFC } = require("nfc-pcsc");

// Initializing a client
const notion = new Client({
  auth: "secret_3ovPS05h7kYw14G5n9P7yKum6wvc4h7nc2LtVpnS2Gv",
});

const personDb = "4e9dae70b5f64f11ac02cb8186e62bbd";
const bookDb = "7706d45e1e6449fc86baf828633231c6";
let mainWindow;

const nfc = new NFC();

const nfcObj = { nfc: "", condition: "" };

const bookObj = { id: "", result: {} };

let personId;

ipcMain.on("borrow", (event, dto) => {
  console.log(event);
  console.log(dto);
  nfcObj.condition = "borrow";
});

ipcMain.on("borrower", (event, dto) => {
  nfcObj.condition = "borrower";
});

ipcMain.on("return", (event, dto) => {
  nfcObj.condition = "return";
});

nfc.on("reader", (reader) => {
  reader.on("card", (card) => {
    nfcObj.nfc = card.uid;
    if (nfcObj.condition == "borrow") {
      mainWindow.webContents.send("loading");
      (async () => {
        await notion.databases
          .query({
            database_id: bookDb,
            filter: {
              property: "NFC",
              rich_text: {
                equals: nfcObj.nfc,
              },
            },
          })
          .then((r) => {
            bookObj.id = r.results[0].id;
            bookObj.result = r.results[0].properties;
            mainWindow.webContents.send("scannedBook", bookObj);
          })
          .catch((e) => {
            console.dir(e, { colors: true, depth: 20 });
          });
      })();
    }
    if (nfcObj.condition == "borrower") {
      (async () => {
        await notion.databases
          .query({
            database_id: personDb,
            filter: {
              property: "NFC",
              rich_text: {
                equals: nfcObj.nfc,
              },
            },
          })
          .then((r) => {
            personId = r.results[0].properties["Person"].people[0].id;
            (async () => {
              await notion.pages
                .update({
                  page_id: bookObj.id,
                  properties: {
                    "대출한 사람": {
                      people: [
                        {
                          object: "user",
                          id: personId,
                        },
                      ],
                    },
                    상태: {
                      status: {
                        name: "대출 중",
                        color: "red",
                      },
                    },
                  },
                })
                .then((r) => {
                  bookObj.id = "";
                  bookObj.result = {};
                  personId = "";
                  nfcObj.nfc = "";
                  nfcObj.condition = "";
                })
                .catch((e) => {
                  console.dir(e, { colors: true, depth: 20 });
                });
            })();
          })
          .catch((e) => {
            console.dir(e, { colors: true, depth: 20 });
          });
      })();
    }

    if (nfcObj.condition == "return") {
      (async () => {
        await notion.databases
          .query({
            database_id: bookDb,
            filter: {
              property: "NFC",
              rich_text: {
                equals: nfcObj.nfc,
              },
            },
          })
          .then(async (r) => {
            bookObj.id = r.results[0].id;
            bookObj.result = r.results[0].properties;
            await notion.pages
              .update({
                page_id: bookObj.id,
                properties: {
                  "대출한 사람": {
                    people: [],
                  },
                  상태: {
                    status: {
                      name: "대출 가능",
                      color: "green",
                    },
                  },
                },
              })
              .then((r) => {
                bookObj.id = "";
                bookObj.result = {};
                personId = "";
                nfcObj.nfc = "";
                nfcObj.condition = "";
              })
              .catch((e) => {
                console.dir(e, { colors: true, depth: 20 });
              });
          })
          .catch((e) => {
            console.dir(e, { colors: true, depth: 20 });
          });
      })();
    }
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
