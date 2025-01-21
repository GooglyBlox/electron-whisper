import React, { useCallback } from "react";

export const FileInput = ({ onFilesSelected }) => {
  const handleFiles = useCallback(
    async (files) => {
      try {
        const fileArray = Array.from(files);
        onFilesSelected(fileArray);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Local Files</h2>
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="fileInput"
          multiple
          accept="audio/*,video/*"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer text-gray-600 dark:text-gray-400"
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-8 h-8 mb-2"
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
            <span>Drop files here or click to select</span>
          </div>
        </label>
      </div>
    </div>
  );
};