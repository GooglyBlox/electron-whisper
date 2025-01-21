import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useStore = create(
  persist(
    (set) => ({
      settings: {
        modelSize: "base",
        language: "en",
        task: "transcribe",
        device: "cpu",
        addSubtitles: false,
      },
      outputDirectory: null,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setOutputDirectory: (directory) =>
        set({ outputDirectory: directory }),
    }),
    {
      name: "transcription-settings",
    }
  )
)