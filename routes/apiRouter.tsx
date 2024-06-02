import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { FC, PropsWithChildren } from "hono/jsx";
import { createContext, useContext } from "hono/jsx";
import { $ } from "bun";
import fs from "fs/promises";
import { validateYoutubeUrl } from "./apiMiddleware";

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
    if (!(await fs.exists("videos"))) {
      await fs.mkdir("videos");
    }
    await $`yt-dlp -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' ${data.url}`.cwd(
      "videos"
    );
    return c.json({
      success: true,
      message: `Downloaded video with id ${youtubeId}`,
    });
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: "Failed to download video", success: false });
  }
});

apiRouter.post("/compress", async (c) => {});

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
