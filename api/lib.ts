import { $ } from "bun";
import fs from "fs/promises";

export default class VideoModel {
  static async compressVideo(input_path: string) {
    const output_path = `${input_path.split(".mp4")[0]}-compressed.mp4`;
    await $`ffmpeg -i ${input_path} -vcodec libx265 -crf 28 -preset slow -acodec copy ${output_path}`.quiet();
    return output_path;
  }

  static async getFilePath(youtubeId: string) {
    const filepath = await $`ls | grep ${youtubeId}`.cwd("videos").text();
    if (!filepath.trim()) {
      return null;
    }
    return `videos/${filepath.trim()}`;
  }

  static async getFrameRate(input_path: string) {
    const text =
      await $`ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 ${input_path} | awk -F'/' '{print $1/$2}'
    `.text();
    return Math.round(Number(text));
  }

  static async createVideoSlice(
    input_path: string,
    inpoint: number,
    outpoint: number
  ) {
    const output_path =
      input_path.split(".mp4")[0] +
      `-sliced-${Math.floor(Date.now() / 1000)}.mp4`;
    await $`ffmpeg -i ${input_path} -ss ${inpoint} -t ${
      outpoint - inpoint
    } -c:v libx264 -c:a aac ${output_path}`;
    return output_path;
  }
}
