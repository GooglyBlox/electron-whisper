import { useState, useEffect } from "react"
import { useStore } from "../store"

export const useTranscription = () => {
  const [progress, setProgress] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [queue, setQueue] = useState([])
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

  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing || queue.length === 0) return

      setIsProcessing(true)
      const currentFile = queue[0]

      try {
        setProgress(prev => `${prev}\nStarting transcription for: ${currentFile}`)
        await window.api.transcribe(currentFile, settings)
        setProgress(prev => `${prev}\nCompleted transcription for: ${currentFile}`)
      } catch (error) {
        setProgress(prev => `${prev}\nError transcribing ${currentFile}: ${error.message}`)
      } finally {
        setQueue(prev => prev.slice(1))
        setIsProcessing(false)
      }
    }

    processQueue()
  }, [queue, isProcessing, settings])

  const transcribe = async (filePath) => {
    if (!window.api?.transcribe) {
      console.error('Transcribe API not available')
      return
    }

    setQueue(prev => [...prev, filePath])
  }

  return { transcribe, progress, isProcessing, queueLength: queue.length }
}