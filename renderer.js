const { ipcRenderer } = require('electron');
const path = require('path');

const fileInput = document.getElementById('fileInput');
const selectedFiles = document.getElementById('selectedFiles');
const selectOutputDirBtn = document.getElementById('selectOutputDirBtn');
const outputDirDisplay = document.getElementById('outputDirDisplay');
const transcribeBtn = document.getElementById('transcribeBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const consoleOutput = document.getElementById('consoleOutput');
const modelSizeSelect = document.getElementById('modelSizeSelect');
const languageSelect = document.getElementById('languageSelect');
const taskSelect = document.getElementById('taskSelect');
const deviceSelect = document.getElementById('deviceSelect');
const addSubtitlesCheckbox = document.getElementById('addSubtitlesCheckbox');

// YouTube integration elements
const youtubeUrl = document.getElementById('youtubeUrl');
const selectYoutubeDownloadDirBtn = document.getElementById('selectYoutubeDownloadDirBtn');
const youtubeDownloadDirDisplay = document.getElementById('youtubeDownloadDirDisplay');
const autoDeleteCheckbox = document.getElementById('autoDeleteCheckbox');
const youtubeStatus = document.getElementById('youtubeStatus');

// State variables
let outputDir = '';
let filesToProcess = [];
let currentFileIndex = 0;
let youtubeFileInProgress = false;
let pendingYoutubeUrls = [];

// Initialize dark mode
require('./darkMode').init();

// YouTube URL management functions
function addYoutubeUrl(url) {
    const trimmedUrl = url.trim();
    if (trimmedUrl && !pendingYoutubeUrls.includes(trimmedUrl)) {
        pendingYoutubeUrls.push(trimmedUrl);
        updateYoutubeUrlsDisplay();
        youtubeUrl.value = '';
    }
}

function updateYoutubeUrlsDisplay() {
    const urlList = document.getElementById('youtubeUrlList');
    if (!urlList) return;

    urlList.innerHTML = pendingYoutubeUrls.map((url, index) => `
        <div class="flex items-center justify-between py-2 text-gray-700 dark:text-gray-300">
            <span class="truncate flex-1">${url}</span>
            <button 
                onclick="removeYoutubeUrl(${index})" 
                class="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Make removeYoutubeUrl available globally
window.removeYoutubeUrl = function(index) {
    pendingYoutubeUrls.splice(index, 1);
    updateYoutubeUrlsDisplay();
};

// File input handling
fileInput.addEventListener('change', () => {
    filesToProcess = Array.from(fileInput.files);
    updateSelectedFilesDisplay();
});

function updateSelectedFilesDisplay() {
    selectedFiles.innerHTML = filesToProcess.map(file => `<div class="text-gray-700 dark:text-gray-300">${file.name}</div>`).join('');
}

// Directory handling
selectOutputDirBtn.addEventListener('click', () => {
    ipcRenderer.send('select-output-directory');
});

selectYoutubeDownloadDirBtn.addEventListener('click', () => {
    ipcRenderer.send('select-youtube-download-dir');
});

// YouTube input handling
youtubeUrl.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && youtubeUrl.value.trim()) {
        addYoutubeUrl(youtubeUrl.value);
    }
});

autoDeleteCheckbox.addEventListener('change', () => {
    ipcRenderer.send('set-auto-delete', autoDeleteCheckbox.checked);
});

// YouTube download process
async function startYoutubeDownload() {
    if (pendingYoutubeUrls.length === 0) {
        youtubeStatus.textContent = 'Please add YouTube URLs to process';
        return;
    }

    youtubeStatus.textContent = 'Starting downloads...';
    consoleOutput.textContent = '';
    transcribeBtn.disabled = true;
    stopBtn.disabled = false;

    // Reset the files array and start processing
    filesToProcess = [];
    currentFileIndex = 0;
    youtubeFileInProgress = true;

    // Process each URL sequentially
    for (let i = 0; i < pendingYoutubeUrls.length; i++) {
        const url = pendingYoutubeUrls[i];
        youtubeStatus.textContent = `Processing URL ${i + 1} of ${pendingYoutubeUrls.length}...`;
        
        try {
            await new Promise((resolve) => {
                ipcRenderer.once('youtube-download-complete', (event, filePath) => {
                    filesToProcess.push({ path: filePath, name: path.basename(filePath) });
                    resolve();
                });

                ipcRenderer.send('download-youtube', url);
            });
        } catch (error) {
            console.error(`Error processing URL ${url}:`, error);
        }
    }

    // Clear the pending URLs after processing
    pendingYoutubeUrls = [];
    updateYoutubeUrlsDisplay();
    
    // Start transcription if files were downloaded successfully
    if (filesToProcess.length > 0) {
        currentFileIndex = 0;
        processNextFile();
    }
}

// Make startYoutubeDownload available globally
window.startYoutubeDownload = startYoutubeDownload;

// Event listeners for directory selection
ipcRenderer.on('output-directory-selected', (event, selectedDir) => {
    outputDir = selectedDir;
    outputDirDisplay.textContent = selectedDir;
});

ipcRenderer.on('youtube-download-dir-selected', (event, dir) => {
    youtubeDownloadDirDisplay.textContent = dir;
});

// Event listeners for YouTube download process
ipcRenderer.on('youtube-download-progress', (event, message) => {
    youtubeStatus.textContent = 'Downloading...';
    consoleOutput.textContent += message;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
});

ipcRenderer.on('youtube-download-error', (event, error) => {
    youtubeStatus.textContent = `Error: ${error}`;
    transcribeBtn.disabled = false;
    stopBtn.disabled = true;
});

ipcRenderer.on('video-deleted', (event, filePath) => {
    consoleOutput.textContent += `\nDeleted temporary video file: ${filePath}`;
});

// Transcription process
transcribeBtn.addEventListener('click', () => {
    if (filesToProcess.length > 0 && outputDir) {
        currentFileIndex = 0;
        processNextFile();
    }
});

function processNextFile() {
    if (currentFileIndex < filesToProcess.length) {
        const filePath = filesToProcess[currentFileIndex].path;
        status.textContent = `Transcribing file ${currentFileIndex + 1} of ${filesToProcess.length}: ${filesToProcess[currentFileIndex].name}`;
        consoleOutput.textContent = '';

        const options = {
            modelSize: modelSizeSelect.value,
            language: languageSelect.value,
            task: taskSelect.value,
            device: deviceSelect.value,
            addSubtitles: addSubtitlesCheckbox.checked,
        };

        ipcRenderer.send('transcribe-file', filePath, options);
        transcribeBtn.disabled = true;
        stopBtn.disabled = false;
    } else {
        status.textContent = 'All files processed';
        transcribeBtn.disabled = false;
        stopBtn.disabled = true;
        showNotification();
    }
}

stopBtn.addEventListener('click', () => {
    ipcRenderer.send('stop-transcription');
    status.textContent = 'Transcription stopped';
    youtubeStatus.textContent = '';
    transcribeBtn.disabled = false;
    stopBtn.disabled = true;
});

// Event listeners for transcription process
ipcRenderer.on('transcription-progress', (event, message) => {
    consoleOutput.textContent += message;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
});

ipcRenderer.on('transcription-complete', (event, success, outputPath) => {
    if (success) {
        youtubeStatus.textContent = currentFileIndex + 1 < filesToProcess.length ? 
            `Processing file ${currentFileIndex + 1} of ${filesToProcess.length}...` : '';
        consoleOutput.textContent += `\nTranscription complete for file ${currentFileIndex + 1}. Output saved to: ${outputPath}\n`;
    } else {
        youtubeStatus.textContent = '';
        consoleOutput.textContent += `\nTranscription failed for file ${currentFileIndex + 1}\n`;
    }
    
    if (currentFileIndex + 1 >= filesToProcess.length) {
        showNotification();
        youtubeFileInProgress = false;
        transcribeBtn.disabled = false;
        stopBtn.disabled = true;
        youtubeStatus.textContent = '';
    } else {
        currentFileIndex++;
        processNextFile();
    }
});

function showNotification() {
    const title = 'Transcription Complete';
    const successCount = filesToProcess.length;
    const message = `${successCount} file(s) have been transcribed successfully.`;
    ipcRenderer.send('show-notification', title, message);
    
    // Reset the tracking variables
    filesToProcess = [];
    currentFileIndex = 0;
}

// Initialize directories and preferences
ipcRenderer.send('get-output-directory');
ipcRenderer.send('get-youtube-download-dir');
ipcRenderer.send('get-auto-delete');

ipcRenderer.on('auto-delete-status', (event, autoDelete) => {
    autoDeleteCheckbox.checked = autoDelete;
});