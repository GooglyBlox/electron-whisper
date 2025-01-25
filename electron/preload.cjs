const { contextBridge, ipcRenderer } = require("electron");

const listeners = new Set();

contextBridge.exposeInMainWorld("api", {
  transcribe: (filePath, options) =>
    ipcRenderer.invoke("transcribe", filePath, options),
  downloadYoutube: (url) => ipcRenderer.invoke("download-youtube", url),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  onProgress: (callback) => {
    const listener = (_event, progress) => callback(progress);
    listeners.add(listener);
    ipcRenderer.on("progress", listener);

    return () => {
      listeners.delete(listener);
      ipcRenderer.removeListener("progress", listener);
    };
  },
});

if (typeof window !== "undefined") {
  window.addEventListener("unload", () => {
    listeners.forEach((listener) => {
      ipcRenderer.removeListener("progress", listener);
    });
    listeners.clear();
  });
}

module.exports = {};
