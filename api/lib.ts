import { $ } from "bun";
import fs from "fs/promises";
import crypto from "node:crypto";

export default class VideoModel {
  static async compressVideo(input_path: string) {
    const output_path = `${input_path.split(".mp4")[0]}-compressed.mp4`;
    await $`ffmpeg -i ${input_path} -vcodec libx264 -crf 28 -preset slow -acodec copy ${output_path}`.quiet();
    return output_path;
  }

  static async getFilePath(youtubeId: string, randomUUID: string) {
    const videoFiles = await fs.readdir("videos");
    const videoFile = videoFiles.find(
      (file) => file.includes(randomUUID) && file.includes(youtubeId)
    );
    if (!videoFile) {
      return null;
    }
    const existingPath = `videos/${videoFile}`;
    // const newPath =
    //   existingPath.split(".mp4")[0] + `-${crypto.randomUUID()}.mp4`;
    // console.log("existingPath", existingPath);
    // console.log("newPath", newPath);
    // await fs.rename(existingPath, newPath);
    return existingPath;
  }

  static async getFrameRate(input_path: string) {
    const text =
      await $`ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 ${input_path} | awk -F'/' '{print $1/$2}'
    `.text();
    return Math.round(Number(text));
  }

  static async downloadFrame(input_path: string, time: number) {
    const output_path = `${input_path.split(".mp4")[0]}-frame-${time}.png`;
    await $`ffmpeg -ss ${time} -i ${input_path} -frames:v 1 ${output_path}`;
    return output_path;
  }

  static async createVideoSlice(
    input_path: string,
    inpoint: number,
    outpoint: number
  ) {
    const output_path =
      input_path.split(".mp4")[0] +
      `-sliced-${Math.floor(Date.now() / 1000)}.mp4`;
    await $`ffmpeg -ss ${inpoint} -t ${
      outpoint - inpoint
    } -i ${input_path} -c copy ${output_path}`;
    return output_path;
  }
}
