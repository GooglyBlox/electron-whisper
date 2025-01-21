const ytdl = require("ytdl-core")
const path = require("path")
const fs = require("fs")
const { app, dialog } = require("electron")

function registerYoutubeHandlers(ipcMain) {
  ipcMain.handle("download-youtube", async (_event, url) => {
    try {
      const info = await ytdl.getInfo(url)
      const videoId = info.videoDetails.videoId
      const tempDir = path.join(app.getPath("temp"), "transcriber-downloads")
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const outputPath = path.join(tempDir, `${videoId}.mp4`)
      const writeStream = fs.createWriteStream(outputPath)

      return new Promise((resolve, reject) => {
        ytdl(url, {
          quality: "highestaudio",
          filter: "audioonly"
        })
          .on("progress", (_, downloaded, total) => {
            const percent = (downloaded / total) * 100
            _event.sender.send("progress", `Downloading: ${percent.toFixed(2)}%`)
          })
          .pipe(writeStream)
          .on("finish", () => resolve(outputPath))
          .on("error", reject)
      })
    } catch (error) {
      console.error("Download error:", error)
      throw error
    }
  })

  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    })

    if (!result.canceled) {
      return result.filePaths[0]
    }
    return null
  })
}

module.exports = { registerYoutubeHandlers }