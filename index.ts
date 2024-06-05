import { Hono } from "hono";
import apiRouter from "./routes/apiRouter";
import config from "./api/config";
import { serveStatic } from "hono/bun";
import fs from "fs/promises";
import { videoDeletion } from "./api/videoDeletion";
const app = new Hono();
// 2. Serve any static files

if (config.SERVER_MODE === "production") {
  app.use(
    "*",
    serveStatic({
      root: "./dist",
    })
  );
}

app.route("/api", apiRouter);

if (config.SERVER_MODE === "production") {
  app.get("*", (c) => c.html("./dist/index.html"));
}

console.log(`Server running on http://localhost:${config.PORT}`);

// reset the video folder
if (await fs.exists("videos")) {
  await fs.rm("videos", { recursive: true, force: true });
}
await fs.mkdir("videos");
videoDeletion();

export default {
  port: config.PORT, // required
  fetch: app.fetch,
};
