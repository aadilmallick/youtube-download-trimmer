import { Hono } from "hono";
import apiRouter from "./routes/apiRouter";
import config from "./api/config";
import { serveStatic } from "hono/bun";
const app = new Hono();
// 2. Serve any static files
app.use(
  "*",
  serveStatic({
    root: "./dist",
  })
);

app.route("/api", apiRouter);
app.get("*", (c) => c.html("./dist/index.html"));

console.log(`Server running on http://localhost:${config.PORT}`);
export default {
  port: config.PORT, // required
  fetch: app.fetch,
};
