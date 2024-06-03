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
  checkVideoIsUploadedToServer,
  validateInpointOutpoint,
} from "./apiMiddleware";
import { globalConstants } from "../api/config";
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
  globalConstants.youtubeId = youtubeId;
  try {
    if (await fs.exists("videos")) {
      await fs.rm("videos", { recursive: true, force: true });
    }
    await fs.mkdir("videos");
    await $`yt-dlp -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' ${data.url}`.cwd(
      "videos"
    );
    const filepath = await VideoModel.getFilePath(globalConstants.youtubeId);
    globalConstants.videoFilepath = filepath;

    return c.json({
      success: true,
      message: `Downloaded video with id ${youtubeId}`,
    });
  } catch (e) {
    console.error(e);
    c.status(500);
    globalConstants.clear();
    return c.json({ error: "Failed to download video", success: false });
  }
});

apiRouter.get("/compress", checkVideoIsUploadedToServer, async (c) => {
  try {
    await VideoModel.compressVideo(globalConstants.videoFilepath!!);
    return c.json({
      message: "Compressed video",
      success: true,
      filepath: globalConstants.videoFilepath,
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

apiRouter.get("/download", checkVideoIsUploadedToServer, async (c) => {
  const file = Bun.file(globalConstants.videoFilepath!!);
  return new Response(file, {
    headers: {
      "Content-Type": "video/mp4",
    },
  });
});

apiRouter.get(
  "/download/slice",
  checkVideoIsUploadedToServer,
  validateInpointOutpoint,
  async (c) => {
    const { inpoint, outpoint } = c.req.valid("query");
    try {
      const slicedPath = await VideoModel.createVideoSlice(
        globalConstants.videoFilepath!!,
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
  }
);

apiRouter.get("/framerate", checkVideoIsUploadedToServer, async (c) => {
  const frameRate = await VideoModel.getFrameRate(
    globalConstants.videoFilepath!!
  );
  return c.json({
    success: true,
    frameRate,
  });
});

apiRouter.get("/ping", (c) => {
  return c.json({ message: "pinged api successfully" });
});

// apiRouter.get("/README", (c) => {
//   return new Response(Bun.file("README.md"), {
//     headers: {
//       "Content-Type": "text/markdown",
//       "Content-Disposition": "attachment; filename=README.md",
//     },
//   });
// });

export default apiRouter;
