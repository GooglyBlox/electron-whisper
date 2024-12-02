const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { exec } = require('child_process');

class YoutubeDownloader {
    constructor() {
        this.store = new Store();
        this.downloadDir = this.store.get('youtubeDownloadDir') || '';
        this.autoDelete = this.store.get('autoDeleteVideos') || false;
        this.currentDownload = null;
    }

    setDownloadDirectory(dir) {
        this.downloadDir = dir;
        this.store.set('youtubeDownloadDir', dir);
    }

    setAutoDelete(autoDelete) {
        this.autoDelete = autoDelete;
        this.store.set('autoDeleteVideos', autoDelete);
    }

    async downloadAndProcess(url, options = {}) {
        if (!this.downloadDir) {
            throw new Error('Download directory not set');
        }

        const videoId = this.extractVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        const outputTemplate = path.join(this.downloadDir, `${videoId}.%(ext)s`);

        return new Promise((resolve, reject) => {
            const ytdlp = spawn('yt-dlp', [
                url,
                '-o', outputTemplate,
                '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                '--merge-output-format', 'mp4',
                '--no-playlist',
                '--progress',
                // Don't delete the source files automatically
                '-k'  
            ]);

            let outputFile = '';
            let lastProgressMessage = '';

            ytdlp.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('[download] Destination:')) {
                    outputFile = output.split('Destination: ')[1].trim();
                }
                if (output !== lastProgressMessage) {
                    lastProgressMessage = output;
                    options.onProgress?.(output);
                }
            });

            ytdlp.stderr.on('data', (data) => {
                options.onError?.(data.toString());
            });

            ytdlp.on('error', (error) => {
                reject(new Error(`Failed to start yt-dlp process: ${error.message}`));
            });

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    // Store the current download information
                    this.currentDownload = {
                        outputFile,
                        videoId,
                        tempFiles: []
                    };

                    // Find all temporary files
                    fs.readdir(this.downloadDir, (err, files) => {
                        if (!err) {
                            this.currentDownload.tempFiles = files
                                .filter(file => file.startsWith(videoId))
                                .map(file => path.join(this.downloadDir, file));
                        }
                        resolve({
                            filePath: path.join(this.downloadDir, `${videoId}.mp4`),
                            videoId: videoId
                        });
                    });
                } else {
                    reject(new Error(`yt-dlp process exited with code ${code}`));
                }
            });
        });
    }

    extractVideoId(url) {
        try {
            const patterns = [
                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
                /^([^"&?\/\s]{11})$/i
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async deleteCurrentDownload() {
        if (!this.currentDownload) return;
    
        try {
            // Delete the merged output file last
            const mainFile = path.join(this.downloadDir, `${this.currentDownload.videoId}.mp4`);
            
            // Delete all temporary files first
            for (const filePath of this.currentDownload.tempFiles) {
                try {
                    if (filePath !== mainFile) {  // Don't delete the main file yet
                        await fs.promises.access(filePath);
                        await fs.promises.unlink(filePath);
                    }
                } catch (error) {
                    console.warn(`File already deleted or not found: ${filePath}`);
                }
            }
    
            // Finally delete the main file
            try {
                await fs.promises.access(mainFile);
                await fs.promises.unlink(mainFile);
            } catch (error) {
                console.warn(`Main file already deleted or not found: ${mainFile}`);
            }
    
            this.currentDownload = null;
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

module.exports = YoutubeDownloader;