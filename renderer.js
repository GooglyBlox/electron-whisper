const { ipcRenderer } = require('electron');

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

let outputDir = '';
let filesToProcess = [];
let currentFileIndex = 0;

fileInput.addEventListener('change', () => {
    filesToProcess = Array.from(fileInput.files);
    updateSelectedFilesDisplay();
});

function updateSelectedFilesDisplay() {
    selectedFiles.innerHTML = filesToProcess.map(file => `<div>${file.name}</div>`).join('');
}

selectOutputDirBtn.addEventListener('click', () => {
    ipcRenderer.send('select-output-directory');
});

ipcRenderer.on('output-directory-selected', (event, selectedDir) => {
    outputDir = selectedDir;
    outputDirDisplay.textContent = selectedDir;
});

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

function showNotification() {
    const title = 'Transcription Complete';
    const message = `All ${filesToProcess.length} file(s) have been transcribed successfully.`;
    ipcRenderer.send('show-notification', title, message);
}

stopBtn.addEventListener('click', () => {
    ipcRenderer.send('stop-transcription');
    status.textContent = 'Transcription stopped';
    transcribeBtn.disabled = false;
    stopBtn.disabled = true;
});

ipcRenderer.on('transcription-progress', (event, message) => {
    consoleOutput.textContent += message;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
});

ipcRenderer.on('transcription-complete', (event, success, outputPath) => {
    if (success) {
        consoleOutput.textContent += `\nTranscription complete for file ${currentFileIndex + 1}. Output saved to: ${outputPath}\n`;
    } else {
        consoleOutput.textContent += `\nTranscription failed for file ${currentFileIndex + 1}\n`;
    }
    currentFileIndex++;
    processNextFile();
});

ipcRenderer.on('transcription-error', (event, message) => {
    status.textContent = message;
    currentFileIndex++;
    processNextFile();
});

ipcRenderer.send('get-output-directory');