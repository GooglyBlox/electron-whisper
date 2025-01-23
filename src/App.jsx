import React, { useState } from "react";
import { Header } from "./components/Header";
import { FileInput } from "./components/FileInput";
import { YoutubeInput } from "./components/YoutubeInput";
import { TranscriptionSettings } from "./components/TranscriptionSettings";
import { OutputSection } from "./components/OutputSection";
import { ConsoleOutput } from "./components/ConsoleOutput";
import { useTranscription } from "./hooks/useTranscription";
import { useYoutubeDownload } from "./hooks/useYoutubeDownload";

const App = () => {
  const { transcribe, progress, isProcessing, queueLength } = useTranscription();
  const { downloadVideo } = useYoutubeDownload();
  const [queuedFiles, setQueuedFiles] = useState([]);

  const handleFiles = (files) => {
    setQueuedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setQueuedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcessFiles = () => {
    queuedFiles.forEach(file => {
      if (file.path) {
        transcribe(file.path);
      } else {
        console.error("File path not available:", file);
      }
    });
    setQueuedFiles([]);
  };

  const handleYoutubeUrl = async (url) => {
    const filePath = await downloadVideo(url);
    if (filePath) {
      transcribe(filePath);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FileInput 
            onFilesSelected={handleFiles}
            queuedFiles={queuedFiles}
            onRemoveFile={handleRemoveFile}
            onProcessFiles={handleProcessFiles}
          />
          <YoutubeInput onUrlSubmit={handleYoutubeUrl} />
        </div>
        <div className="mt-6 space-y-6">
          <TranscriptionSettings />
          <OutputSection />
          <ConsoleOutput 
            text={progress}
            isProcessing={isProcessing}
            queueLength={queueLength}
          />
        </div>
      </main>
    </div>
  );
};

export default App;