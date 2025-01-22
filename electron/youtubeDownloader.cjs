const path = require("path");
const fs = require("fs");
const { app, dialog } = require("electron");
const { create } = require("youtube-dl-exec");

function getBinaryName() {
  if (process.platform === 'win32') return 'yt-dlp.exe';
  if (process.platform === 'darwin') return 'yt-dlp';
  return 'yt-dlp';
}

const binaryPath = path.join(
  process.resourcesPath,
  'bin',
  getBinaryName()
);

const ytdlp = create(binaryPath);

function registerYoutubeHandlers(ipcMain) {
  ipcMain.handle("download-youtube", async (_event, url) => {
    try {
      const tempDir = path.join(app.getPath("temp"), "transcriber-downloads");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `${Date.now()}_download.m4a`;
      const outputPath = path.join(tempDir, fileName);

      const finalPath = await downloadWithYtDlp(_event, url, outputPath);
      return finalPath;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  });

  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (!result.canceled) {
      return result.filePaths[0];
    }
    return null;
  });
}

function downloadWithYtDlp(_event, url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log('YouTube download starting. Output path:', outputPath);
    const subprocess = ytdlp.exec(url, { format: "bestaudio", output: outputPath }, {});

    subprocess.stdout.on("data", (data) => {
      const line = data.toString();
      const match = line.match(/\[download\]\s+([\d.]+)%/);
      if (match) {
        _event.sender.send(
          "progress",
          `Downloading: ${parseFloat(match[1]).toFixed(1)}%`
        );
      }
    });

    subprocess.stderr.on("data", (err) => {
      console.error(err.toString());
    });

    subprocess.on("close", (code) => {
      if (code === 0) {
        console.log('YouTube download complete. Final path:', outputPath);
        resolve(outputPath);
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    subprocess.on("error", (err) => {
      reject(err);
    });
  });
}

module.exports = { registerYoutubeHandlers };
