const ffmpeg = require("fluent-ffmpeg");
const { path: ffmpegInstallerPath } = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const ffmpegPath = ffmpegInstallerPath.replace("app.asar", "app.asar.unpacked");
ffmpeg.setFfmpegPath(ffmpegPath);

function bufferToFloat32Array(buffer) {
  const pcm16 = new Int16Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length / 2
  );
  const float32 = new Float32Array(pcm16.length);

  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }

  return float32;
}

async function convertToWav(inputPath) {
  const tmpDir = path.join(app.getPath("temp"), "transcriber-temp");
  await fs.promises.mkdir(tmpDir, { recursive: true });

  const outputPath = path.join(tmpDir, `${Date.now()}_converted.wav`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .outputOptions(["-acodec pcm_s16le", "-ac 1", "-ar 16000"])
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        reject(err);
      })
      .on("end", () => {
        console.log("FFmpeg conversion complete:", outputPath);
        resolve(outputPath);
      })
      .save(outputPath);
  });
}

function registerWhisperHandlers(ipcMain) {
  ipcMain.handle("transcribe", async (event, filePath, options) => {
    try {
      console.log("Starting transcription process for:", filePath);
      console.log("Options:", options);

      event.sender.send("progress", "Initializing transcriber...");

      const { pipeline } = await import("@xenova/transformers");

      console.log("Creating pipeline...");
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        `Xenova/whisper-${options.modelSize}`,
        {
          progress_callback: (progress) => {
            console.log("Model loading progress:", progress);
            if (
              progress.status === "progress" &&
              typeof progress.value === "number"
            ) {
              const percentage = Math.round(progress.value * 100);
              event.sender.send("progress", `Loading model: ${percentage}%`);
            }
          },
        }
      );

      console.log("Pipeline created, converting audio...");
      event.sender.send("progress", "Converting audio file...");
      const wavPath = await convertToWav(filePath);

      console.log("Loading audio file:", wavPath);
      event.sender.send("progress", "Loading audio file...");
      const audioData = await fs.promises.readFile(wavPath);
      const float32Audio = bufferToFloat32Array(audioData);

      console.log("Audio loaded, starting transcription...");
      event.sender.send("progress", "Starting transcription...");
      const result = await transcriber(float32Audio, {
        language: options.language,
        task: options.task,
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
        callback_function: (progress) => {
          console.log("Transcription progress:", progress);
          if (typeof progress === "number") {
            const percentage = Math.round(progress * 100);
            event.sender.send(
              "progress",
              `Transcription progress: ${percentage}%`
            );
          }
        },
      });

      await fs.promises.unlink(wavPath);

      console.log("Transcription result:", result);

      if (!result || !result.text) {
        console.error("No transcription result:", result);
        throw new Error("No transcription result generated");
      }

      const baseName = path.basename(filePath, path.extname(filePath));
      const outputDir = options.outputDirectory || path.dirname(filePath);

      console.log("Transcription output details:");
      console.log("Input file path:", filePath);
      console.log("Base name:", baseName);
      console.log("Output directory from options:", options.outputDirectory);
      console.log("Final output directory:", outputDir);

      event.sender.send("progress", "Writing output files...");
      const outputPath = path.join(outputDir, `${baseName}.txt`);
      console.log("Final output path:", outputPath);
      await fs.promises.writeFile(outputPath, result.text, "utf-8");

      if (options.addSubtitles && result.chunks) {
        const srtContent = result.chunks
          .map((chunk, index) => {
            const startTime = formatSrtTime(chunk.timestamp[0] * 1000);
            const endTime = formatSrtTime(chunk.timestamp[1] * 1000);
            return `${index + 1}\n${startTime} --> ${endTime}\n${
              chunk.text
            }\n\n`;
          })
          .join("");

        await fs.promises.writeFile(
          path.join(outputDir, `${baseName}.srt`),
          srtContent,
          "utf-8"
        );
      }

      event.sender.send("progress", "Transcription complete!");
      return result.text;
    } catch (error) {
      console.error("Transcription error:", error);
      event.sender.send("progress", `Error: ${error.message}`);
      throw error;
    }
  });
}

function formatSrtTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")},${String(milliseconds).padStart(
    3,
    "0"
  )}`;
}

module.exports = { registerWhisperHandlers };
