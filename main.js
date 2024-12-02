const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');
const fs = require('fs');
const notifier = require('node-notifier');
const YoutubeDownloader = require('./youtubeDownloader');

const store = new Store();
const youtubeDownloader = new YoutubeDownloader();

let mainWindow;
let whisperProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
    });
}

app.whenReady().then(createWindow);

ipcMain.on('transcribe-file', (event, filePath, options) => {
    const outputDir = store.get('outputDirectory');
    if (!outputDir) {
        event.reply('transcription-error', 'Output directory not selected');
        return;
    }

    // Ensure file exists before starting transcription
    if (!fs.existsSync(filePath)) {
        event.reply('transcription-error', `File not found: ${filePath}`);
        return;
    }

    const fileName = path.basename(filePath, path.extname(filePath));
    const outputPath = path.join(outputDir, `${fileName}-transcript.txt`);

    const args = [filePath, '--output_dir', outputDir];
    args.push('--output_format', 'txt');

    if (options.addSubtitles) {
        args.push('--output_format', 'srt');
    }
    if (options.modelSize !== 'base') {
        args.push('--model', options.modelSize);
    }
    if (options.language !== 'auto') {
        args.push('--language', options.language);
    }
    if (options.task === 'translate') {
        args.push('--task', 'translate');
    }
    if (options.device === 'cuda') {
        args.push('--device', 'cuda');
    }

    whisperProcess = spawn('whisper', args);

    whisperProcess.stdout.on('data', (data) => {
        event.reply('transcription-progress', data.toString());
    });

    whisperProcess.stderr.on('data', (data) => {
        event.reply('transcription-progress', data.toString());
    });

    whisperProcess.on('close', async (code) => {
        const success = code === 0;
        event.reply('transcription-complete', success, outputPath);
        
        // Only delete after transcription is complete
        if (success && youtubeDownloader.autoDelete) {
            try {
                await fs.promises.access(filePath);  // Check if file exists
                await youtubeDownloader.deleteCurrentDownload();
                event.reply('video-deleted', filePath);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }
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

ipcMain.on('get-output-directory', (event) => {
    const outputDir = store.get('outputDirectory');
    if (outputDir) {
        event.reply('output-directory-selected', outputDir);
    }
});

ipcMain.on('select-youtube-download-dir', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select YouTube Download Directory'
    });

    if (!result.canceled) {
        const dir = result.filePaths[0];
        youtubeDownloader.setDownloadDirectory(dir);
        event.reply('youtube-download-dir-selected', dir);
    }
});

ipcMain.on('get-youtube-download-dir', (event) => {
    const downloadDir = store.get('youtubeDownloadDir');
    if (downloadDir) {
        event.reply('youtube-download-dir-selected', downloadDir);
    }
});

ipcMain.on('set-auto-delete', (event, autoDelete) => {
    youtubeDownloader.setAutoDelete(autoDelete);
});

ipcMain.on('get-auto-delete', (event) => {
    const autoDelete = store.get('autoDeleteVideos', false);
    event.reply('auto-delete-status', autoDelete);
});

ipcMain.on('download-youtube', async (event, url) => {
    try {
        const result = await youtubeDownloader.downloadAndProcess(url, {
            onProgress: (progress) => {
                event.reply('youtube-download-progress', progress);
            },
            onError: (error) => {
                event.reply('youtube-download-error', error);
            }
        });

        event.reply('youtube-download-complete', result.filePath);

        // Start transcription automatically with the current application settings
        const options = {
            modelSize: store.get('defaultModelSize', 'base'),
            language: store.get('defaultLanguage', 'auto'),
            task: store.get('defaultTask', 'transcribe'),
            device: store.get('defaultDevice', 'cpu'),
            addSubtitles: store.get('defaultAddSubtitles', false)
        };

        // Queue transcription but don't delete yet
        ipcMain.emit('transcribe-file', event, result.filePath, options);

    } catch (error) {
        event.reply('youtube-download-error', error.message);
    }
});

ipcMain.on('show-notification', (event, title, message) => {
    notifier.notify({
        title: title,
        message: message,
        icon: path.join(__dirname, 'icon.png'),
        sound: true,
        wait: true
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});