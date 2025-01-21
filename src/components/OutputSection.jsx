import React from "react"
import { useStore } from "../store"

export const OutputSection = () => {
  const { outputDirectory, setOutputDirectory } = useStore()

  const handleSelectDirectory = async () => {
    const directory = await window.api.selectDirectory()
    if (directory) {
      setOutputDirectory(directory)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-lg font-medium mb-4">Output Settings</h2>
      <div className="space-y-4">
        <button onClick={handleSelectDirectory} className="btn-primary w-full">
          Select Output Directory
        </button>
        {outputDirectory && (
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            Output Directory: {outputDirectory}
          </div>
        )}
      </div>
    </div>
  )
}
