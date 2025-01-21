import React, { useEffect, useRef } from "react"

export const ConsoleOutput = ({ text }) => {
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [text])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-lg font-medium mb-4">Console Output</h2>
      <pre
        ref={outputRef}
        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg h-64 overflow-auto font-mono text-sm text-gray-800 dark:text-gray-200"
      >
        {text || "No output yet..."}
      </pre>
    </div>
  )
}