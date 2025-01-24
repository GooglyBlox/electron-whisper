import React from "react";
import { useStore } from "../store";
import Dropdown from "./Dropdown";

export const TranscriptionSettings = () => {
  const { settings, updateSettings } = useStore();

  const modelSizeOptions = [
    { value: "base", label: "Base" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const taskOptions = [
    { value: "transcribe", label: "Transcribe" },
    { value: "translate", label: "Translate" },
  ];

  const deviceOptions = [
    { value: "cpu", label: "CPU" },
    { value: "cuda", label: "GPU (CUDA)" },
  ];

  return (
    <div className="card mt-8">
      <h2 className="text-lg font-semibold mb-4">Transcription Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model Size
          </label>
          <Dropdown
            options={modelSizeOptions}
            value={settings.modelSize}
            onChange={(value) => updateSettings({ modelSize: value })}
            placeholder="Select model size"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <Dropdown
            options={languageOptions}
            value={settings.language}
            onChange={(value) => updateSettings({ language: value })}
            placeholder="Select language"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Task
          </label>
          <Dropdown
            options={taskOptions}
            value={settings.task}
            onChange={(value) => updateSettings({ task: value })}
            placeholder="Select task"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Device
          </label>
          <Dropdown
            options={deviceOptions}
            value={settings.device}
            onChange={(value) => updateSettings({ device: value })}
            placeholder="Select device"
          />
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