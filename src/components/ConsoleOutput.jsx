import React, { useEffect, useRef } from "react"

export const ConsoleOutput = ({ text, isProcessing, queueLength }) => {
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [text])

  return (
    <div className="card mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Console Output</h2>
        {(isProcessing || queueLength > 0) && (
          <div className="text-sm text-gray-400">
            {isProcessing ? "Processing..." : "Waiting..."} ({queueLength} in queue)
          </div>
        )}
      </div>
      <pre
        ref={outputRef}
        className="bg-gray-900 p-4 rounded-lg h-64 overflow-auto font-mono 
                   text-sm text-gray-300 border border-gray-700"
      >
        {text || "Waiting for input..."}
      </pre>
    </div>
  )
}