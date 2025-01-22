import React from "react";
import { useStore } from "../store";

export const TranscriptionSettings = () => {
  const { settings, updateSettings } = useStore();

  return (
    <div className="card mt-8">
      <h2 className="text-lg font-semibold mb-4">Transcription Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model Size
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Task
          </label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Device
          </label>
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
      <div className="mt-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.addSubtitles}
            onChange={(e) => updateSettings({ addSubtitles: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 
                     focus:ring-blue-500 focus:ring-offset-gray-900"
          />
          <span className="text-gray-300">Generate Subtitles</span>
        </label>
      </div>
    </div>
  );
};