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
    <div className="card mt-8">
      <h2 className="text-lg font-semibold mb-4">Output Settings</h2>
      <div className="space-y-4">
        <button 
          onClick={handleSelectDirectory} 
          className="btn-primary w-full flex items-center justify-center gap-2"
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
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
            />
          </svg>
          Select Output Directory
        </button>
        {outputDirectory && (
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Output Directory:</div>
            <div className="text-sm text-gray-300 break-all font-mono">
              {outputDirectory}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}