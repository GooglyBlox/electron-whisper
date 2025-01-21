import { useState, useEffect } from "react"
import { useStore } from "../store"

export const useTranscription = () => {
  const [progress, setProgress] = useState("")
  const { settings } = useStore()

  useEffect(() => {
    if (!window.api?.onProgress) {
      console.warn('API not initialized yet')
      return
    }

    const cleanup = window.api.onProgress((progressText) => {
      setProgress((prev) => `${prev}\n${progressText}`)
    })

    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [])

  const transcribe = async (filePath) => {
    if (!window.api?.transcribe) {
      console.error('Transcribe API not available')
      return
    }

    try {
      await window.api.transcribe(filePath, settings)
    } catch (error) {
      setProgress((prev) => `${prev}\nError: ${error.message}`)
    }
  }

  return { transcribe, progress }
}