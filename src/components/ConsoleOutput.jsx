import React, { useEffect, useRef } from "react"

export const ConsoleOutput = ({ text }) => {
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [text])

  return (
    <div className="card mt-8">
      <h2 className="text-lg font-semibold mb-4">Console Output</h2>
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