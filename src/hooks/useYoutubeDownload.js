import { useState } from "react"

export const useYoutubeDownload = () => {
  const [downloading, setDownloading] = useState(false)

  const downloadVideo = async (url) => {
    try {
      setDownloading(true)
      const filePath = await window.api.downloadYoutube(url)
      return filePath
    } catch (error) {
      console.error("Download failed:", error)
      return null
    } finally {
      setDownloading(false)
    }
  }

  return { downloadVideo, downloading }
}