import React from "react";
import { Header } from "./components/Header";
import { FileInput } from "./components/FileInput";
import { YoutubeInput } from "./components/YoutubeInput";
import { TranscriptionSettings } from "./components/TranscriptionSettings";
import { OutputSection } from "./components/OutputSection";
import { ConsoleOutput } from "./components/ConsoleOutput";
import { useTranscription } from "./hooks/useTranscription";
import { useYoutubeDownload } from "./hooks/useYoutubeDownload";

const App = () => {
  const { transcribe, progress } = useTranscription();
  const { downloadVideo } = useYoutubeDownload();

  const handleFiles = async (files) => {
    for (const file of files) {
      if (file.path) {
        await transcribe(file.path);
      } else {
        console.error("File path not available:", file);
      }
    }
  };

  const handleYoutubeUrl = async (url) => {
    const filePath = await downloadVideo(url);
    if (filePath) {
      await transcribe(filePath);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FileInput onFilesSelected={handleFiles} />
          <YoutubeInput onUrlSubmit={handleYoutubeUrl} />
        </div>
        <TranscriptionSettings />
        <OutputSection />
        <ConsoleOutput text={progress} />
      </main>
    </div>
  );
};

export default App;