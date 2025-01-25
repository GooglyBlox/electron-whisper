const path = require("path");
const fs = require("fs");
const { app, dialog } = require("electron");
const { create } = require("youtube-dl-exec");
const { promisify } = require("util");
const chmod = promisify(fs.chmod);

async function getBinaryPath() {
  const platform = process.platform;
  let binaryPath;

  if (platform === "win32") {
    binaryPath = path.join(process.resourcesPath, "bin", "win", "yt-dlp.exe");
  } else if (platform === "darwin") {
    binaryPath = path.join(process.resourcesPath, "bin", "mac", "yt-dlp_macos");
    try {
      await chmod(binaryPath, "755");
    } catch (error) {
      console.error("Error setting executable permissions:", error);
      binaryPath = path.join(
        app.getAppPath(),
        "resources",
        "bin",
        "mac",
        "yt-dlp_macos"
      );
      await chmod(binaryPath, "755");
    }
  } else {
    binaryPath = path.join(
      process.resourcesPath,
      "bin",
      "linux",
      "yt-dlp_linux"
    );
    await chmod(binaryPath, "755");
  }

  if (!fs.existsSync(binaryPath)) {
    throw new Error(`YouTube-DL binary not found at: ${binaryPath}`);
  }

  return binaryPath;
}

function registerYoutubeHandlers(ipcMain) {
  ipcMain.handle("download-youtube", async (_event, url) => {
    try {
      const tempDir = path.join(app.getPath("temp"), "transcriber-downloads");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `${Date.now()}_download.m4a`;
      const outputPath = path.join(tempDir, fileName);

      const binaryPath = await getBinaryPath();
      console.log("Using yt-dlp binary at:", binaryPath);

      const ytdlp = create(binaryPath);
      const finalPath = await downloadWithYtDlp(_event, ytdlp, url, outputPath);
      return finalPath;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  });

  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (!result.canceled) {
      return result.filePaths[0];
    }
    return null;
  });
}

function downloadWithYtDlp(_event, ytdlp, url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log("YouTube download starting. Output path:", outputPath);
    const subprocess = ytdlp.exec(
      url,
      {
        format: "bestaudio",
        output: outputPath,
        noCheckCertificates: true,
        preferFreeFormats: true,
      },
      {}
    );

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
      console.error("yt-dlp stderr:", err.toString());
    });

    subprocess.on("close", (code) => {
      if (code === 0) {
        console.log("YouTube download complete. Final path:", outputPath);
        resolve(outputPath);
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    subprocess.on("error", (err) => {
      console.error("yt-dlp process error:", err);
      reject(err);
    });
  });
}

module.exports = { registerYoutubeHandlers };
