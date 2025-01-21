import { defineConfig } from "vite"
import electron from "vite-plugin-electron"
import renderer from "vite-plugin-electron-renderer"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from "url"
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const electronFiles = [
  'preload.cjs',
  'main.cjs',
  'whisperModule.cjs',
  'youtubeDownloader.cjs'
]

electronFiles.forEach(file => {
  fs.copySync(
    path.join(__dirname, 'electron', file),
    path.join(__dirname, 'dist-electron/main', file)
  )
})

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        onstart(options) {
          options.startup()
        }
      }
    ]),
    renderer()
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})