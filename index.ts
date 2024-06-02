import { Hono } from "hono";
import apiRouter from "./routes/apiRouter";
import config from "./api/config";
const app = new Hono();

app.route("/api", apiRouter);

app.get("/", (c) => {
  return c.text("Hello World!");
});

console.log(`Server running on http://localhost:${config.PORT}`);
export default {
  port: config.PORT, // required
  fetch: app.fetch,
};
