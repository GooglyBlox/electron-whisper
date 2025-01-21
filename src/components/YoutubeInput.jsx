import React, { useState, useCallback } from "react"

export const YoutubeInput = ({ onUrlSubmit }) => {
  const [url, setUrl] = useState("")
  const [urls, setUrls] = useState([])

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      if (url && !urls.includes(url)) {
        setUrls([...urls, url])
        setUrl("")
      }
    },
    [url, urls]
  )

  const handleProcess = useCallback(() => {
    urls.forEach((url) => onUrlSubmit(url))
    setUrls([])
  }, [urls, onUrlSubmit])

  const removeUrl = useCallback((indexToRemove) => {
    setUrls((prev) => prev.filter((_, index) => index !== indexToRemove))
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">YouTube Download</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="input-field"
        />
        <div className="space-y-2">
          {urls.map((url, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded"
            >
              <span className="truncate flex-1">{url}</span>
              <button
                onClick={() => removeUrl(index)}
                className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400"
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
        </div>
        {urls.length > 0 && (
          <button
            type="button"
            onClick={handleProcess}
            className="btn-primary w-full"
          >
            Process URLs
          </button>
        )}
      </form>
    </div>
  )
}