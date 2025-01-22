import React from "react";
import { useStore } from "../store";

export const TranscriptionSettings = () => {
  const { settings, updateSettings } = useStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-lg font-medium mb-4">Transcription Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Model Size</label>
          <select
            value={settings.modelSize}
            onChange={(e) => updateSettings({ modelSize: e.target.value })}
            className="input-field"
          >
            <option value="base">Base</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large-v3-turbo">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="input-field"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Task</label>
          <select
            value={settings.task}
            onChange={(e) => updateSettings({ task: e.target.value })}
            className="input-field"
          >
            <option value="transcribe">Transcribe</option>
            <option value="translate">Translate</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Device</label>
          <select
            value={settings.device}
            onChange={(e) => updateSettings({ device: e.target.value })}
            className="input-field"
          >
            <option value="cpu">CPU</option>
            <option value="cuda">GPU (CUDA)</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.addSubtitles}
            onChange={(e) => updateSettings({ addSubtitles: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Generate Subtitles</span>
        </label>
      </div>
    </div>
  );
};
