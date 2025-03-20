import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { FC, PropsWithChildren } from "hono/jsx";
import { createContext, useContext } from "hono/jsx";
import { $ } from "bun";
import fs from "fs/promises";
import {
  validateYoutubeUrl,
  validateYoutubeId,
  validateInpointOutpoint,
  validateVideoIsUploaded,
} from "./apiMiddleware";
import VideoModel from "../api/lib";
import * as path from "path";

const apiRouter = new Hono();
apiRouter.use(
  cors({
    origin: "http://localhost:5173",
  })
);

apiRouter.post("/upload", validateYoutubeUrl, async (c) => {
  const data = c.req.valid("json");
  const youtubeId = data.url.split("v=")[1];
  try {
    await $`yt-dlp -i -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' ${data.url}`.cwd(
      "videos"
    );
    const filepath = await VideoModel.getFilePath(youtubeId);

    // server returns this, frontend passes this on each request
    return c.json({
      success: true,
      youtubeId: youtubeId,
      filePath: filepath,
    });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: "Failed to download video", success: false });
  }
});

apiRouter.post("/compress", validateVideoIsUploaded, async (c) => {
  const { filePath } = c.req.valid("json");
  try {
    await VideoModel.compressVideo(filePath);
    return c.json({
      message: "Compressed video",
      success: true,
      filePath: filePath,
    });
  } catch (e) {
    c.status(500);
    console.error(e);
    return c.json({
      error: "Failed to compress video",
      success: false,
    });
  }
});

apiRouter.post("/clearvideos", validateVideoIsUploaded, async (c) => {
  const { filePath } = c.req.valid("json");
  const filename = path.basename(filePath).split(".mp4")[0];
  try {
    const filesToDelete = (await fs.readdir("videos")).filter((file) =>
      path.basename(file).includes(filename)
    );
    filesToDelete.forEach(
      async (file) => await fs.unlink(path.join("videos", file))
    );
    return c.json({
      message: "Deleted video files",
      success: true,
    });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({
      error: "Failed to delete video files",
      success: false,
    });
  }
});

apiRouter.post("/download", validateVideoIsUploaded, async (c) => {
  const { filePath } = c.req.valid("json");
  const file = Bun.file(filePath);
  return new Response(file, {
    headers: {
      "Content-Type": "video/mp4",
    },
  });
});

apiRouter.post("/download/slice", validateInpointOutpoint, async (c) => {
  const { inpoint, outpoint, filePath } = c.req.valid("json");
  try {
    const slicedPath = await VideoModel.createVideoSlice(
      filePath,
      inpoint,
      outpoint
    );
    console.log("finished slicing!");
    const file = Bun.file(slicedPath);
    let fileName = path.basename(file.name!!);
    fileName = fileName
      .replaceAll("[", "")
      .replaceAll("]", "")
      .replaceAll(" ", "_");
    return new Response(file, {
      headers: {
        "Content-Type": "video/mp4",
      },
    });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({
      error: "Failed to slice video",
      success: false,
    });
  }
});

apiRouter.post("/download/frame", validateInpointOutpoint, async (c) => {
  const { currentTime, filePath } = c.req.valid("json");
  try {
    const slicedPath = await VideoModel.downloadFrame(filePath, currentTime);
    console.log("finished slicing!");
    const file = Bun.file(slicedPath);
    return new Response(file, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({
      error: "Failed to slice video",
      success: false,
    });
  }
});

apiRouter.post("/framerate", validateVideoIsUploaded, async (c) => {
  const { filePath } = c.req.valid("json");

  const frameRate = await VideoModel.getFrameRate(filePath);
  return c.json({
    success: true,
    frameRate,
  });
});

export default apiRouter;
