import React, { useCallback, useRef } from "react";

export const FileInput = ({ onFilesSelected, queuedFiles, onRemoveFile, onProcessFiles }) => {
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(
    async (files) => {
      try {
        const fileArray = Array.from(files).map(file => ({
          path: file.path,
          name: file.name
        }));
        onFilesSelected(fileArray);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Error handling files:", error);
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Local Files</h2>
      <div
        className="border-2 border-dashed border-gray-600 hover:border-gray-500 
                   rounded-lg p-8 text-center transition-colors cursor-pointer
                   bg-gray-900/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="fileInput"
          multiple
          accept="audio/*,video/*"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer text-gray-400 hover:text-gray-300 transition-colors"
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 mb-3 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm">Drop files here or click to select</span>
            <span className="text-xs text-gray-500 mt-1">
              Supports audio and video files
            </span>
          </div>
        </label>
      </div>
      {queuedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {queuedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-900/50 
                         p-3 rounded-lg border border-gray-700"
            >
              <span className="truncate flex-1 text-gray-300 text-sm">
                {file.name}
              </span>
              <button
                onClick={() => onRemoveFile(index)}
                className="ml-2 text-gray-400 hover:text-red-400 
                         transition-colors p-1 rounded-lg 
                         hover:bg-gray-800"
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={onProcessFiles}
            className="btn-primary w-full mt-4"
          >
            Process {queuedFiles.length} File{queuedFiles.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};