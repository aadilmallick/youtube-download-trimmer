import { setInterval } from "timers";
import * as path from "path";
import fs from "fs/promises";

export function videoDeletion() {
  setInterval(async () => {
    console.log("Checking for old videos...");
    const files = await fs.readdir("videos");
    for (const file of files) {
      const filePath = `videos/${file}`;
      const stats = await fs.stat(filePath);
      const oneHourInMs = 1000 * 60 * 60; // Adjust for desired time

      // Check if file is older than one hour
      if (Date.now() - stats.mtimeMs > oneHourInMs) {
        await fs.rm(filePath);
        console.log(`Deleted video: ${filePath}`);
      }
    }
  }, 1000 * 60 * 60); // Run every hour
}
