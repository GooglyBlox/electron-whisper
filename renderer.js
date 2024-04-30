const { ipcRenderer } = require('electron');

const fileInput = document.getElementById('fileInput');
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

selectOutputDirBtn.addEventListener('click', () => {
  ipcRenderer.send('select-output-directory');
});

ipcRenderer.on('output-directory-selected', (event, selectedDir) => {
  outputDir = selectedDir;
  outputDirDisplay.textContent = selectedDir;
});

transcribeBtn.addEventListener('click', () => {
  const filePath = fileInput.files[0].path;
  if (filePath && outputDir) {
    status.textContent = 'Transcribing...';
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
  }
});

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
    status.textContent = `Transcription complete. Output saved to: ${outputPath}`;
  } else {
    status.textContent = 'Transcription failed';
  }
  transcribeBtn.disabled = false;
  stopBtn.disabled = true;
});

ipcRenderer.on('transcription-error', (event, message) => {
  status.textContent = message;
});

// Load saved output directory on app start
ipcRenderer.send('get-output-directory'); 