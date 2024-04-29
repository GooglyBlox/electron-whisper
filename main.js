const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let whisperProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  
    mainWindow.loadFile('index.html');
  }

app.whenReady().then(createWindow);

ipcMain.on('transcribe-file', (event, filePath) => {
    const outputDir = store.get('outputDirectory');
    if (!outputDir) {
      event.reply('transcription-error', 'Output directory not selected');
      return;
    }
  
    const fileName = path.basename(filePath, path.extname(filePath));
    const outputPath = path.join(outputDir, `${fileName}-transcript.txt`);
  
    whisperProcess = spawn('whisper', [filePath, '--output_dir', outputDir, '--output_format', 'txt']);
  
    whisperProcess.stdout.on('data', (data) => {
      event.reply('transcription-progress', data.toString());
    });
  
    whisperProcess.stderr.on('data', (data) => {
      event.reply('transcription-progress', data.toString());
    });
  
    whisperProcess.on('close', (code) => {
      event.reply('transcription-complete', code === 0, outputPath);
    });
  });

ipcMain.on('stop-transcription', () => {
  if (whisperProcess) {
    whisperProcess.kill();
    whisperProcess = null;
  }
});

ipcMain.on('select-output-directory', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (!result.canceled) {
    const outputDir = result.filePaths[0];
    store.set('outputDirectory', outputDir);
    event.reply('output-directory-selected', outputDir);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});