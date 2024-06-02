import { Hono } from "hono";
import apiRouter from "./routes/apiRouter";
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello World!");
});
app.route("/api", apiRouter);

export default app;
