const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const { registerWhisperHandlers } = require("./whisperModule.cjs")
const { registerYoutubeHandlers } = require("./youtubeDownloader.cjs")

const isDev = process.env.NODE_ENV === "development"
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./preload.cjs"),
      sandbox: false
    }
  })

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173")
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, "../../dist/index.html")
    mainWindow.loadFile(indexPath).catch((error) => {
      console.error("Failed to load index.html:", error)
      console.error("Attempted path:", indexPath)
    })
  }

  mainWindow.webContents.on("did-fail-load", (_, errorCode, errorDescription) => {
    console.error("Failed to load:", errorCode, errorDescription)
  })
}

app.whenReady().then(() => {
  createWindow()
  registerWhisperHandlers(ipcMain)
  registerYoutubeHandlers(ipcMain)

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})