const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { Client } = require("@notionhq/client");
const { NFC } = require("nfc-pcsc");

// const notion = new Client({
//   auth: "secret_3ovPS05h7kYw14G5n9P7yKum6wvc4h7nc2LtVpnS2Gv",
// });

// const personDb = "4e9dae70b5f64f11ac02cb8186e62bbd";
// const bookDb = "7706d45e1e6449fc86baf828633231c6";

const notion = new Client({
	auth: "secret_lj8NMQpObd8kZLp0eABz9O3vvr6XtLpzLqa37a0Xz1s",
});

const personDb = "84179885bbc8434e89441ec56313c014";
const bookDb = "c8627e1066374f04a23f4e780c0c5b1e";
let mainWindow;

const nfc = new NFC();

const nfcObj = { nfc: "", condition: "" };

const bookObj = { id: "", result: {} };

let timerId;

let personId;

function resetEverything() {
	bookObj.id = "";
	bookObj.result = {};
	personId = "";
	timerId = "";
	nfcObj.nfc = "";
	nfcObj.condition = "";
}

function resetUI() {
	timerId = setTimeout(() => {
		mainWindow.webContents.send("reset");
		resetEverything();
	}, 20000);
}

function cancelResetEverything() {
	clearTimeout(timerId);
}

ipcMain.on("borrow", (event, dto) => {
	nfcObj.condition = "borrow";
	resetUI();
});

ipcMain.on("borrower", (event, dto) => {
	nfcObj.condition = "borrower";
	if (timerId != "") cancelResetEverything();
	resetUI();
});

ipcMain.on("return", (event, dto) => {
	nfcObj.condition = "return";
	resetUI();
});

ipcMain.on("cancel", (event, dto) => {
	mainWindow.webContents.send("reset");
	resetEverything();
});

nfc.on("reader", (reader) => {
	reader.on("card", (card) => {
		nfcObj.nfc = card.uid;
		if (nfcObj.condition == "borrow") {
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
						bookObj.result = {
							title: r.results[0].properties["제목"].title[0].plain_text,
							author: r.results[0].properties["저자"].rich_text[0].plain_text,
							category: r.results[0].properties["분야"].multi_select[0].name,
							shelfNum: r.results[0].properties["책장 번호"].number,
						};

						mainWindow.webContents.send("scannedBook", bookObj);
						nfcObj.condition = "";
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
						pesonName = r.results[0].properties["Person"].people[0].name;
						if (personId == "") {
							return;
						}
						(async () => {
							cancelResetEverything();
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
									mainWindow.webContents.send("done", {
										name: pesonName,
										...bookObj,
									});
									resetEverything();
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
						bookObj.result = {
							title: r.results[0].properties["제목"].title[0].plain_text,
							author: r.results[0].properties["저자"].rich_text[0].plain_text,
							category: r.results[0].properties["분야"].multi_select[0].name,
							shelfNum: r.results[0].properties["책장 번호"].number,
						};
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
								mainWindow.webContents.send("return", bookObj);
								resetEverything();
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
