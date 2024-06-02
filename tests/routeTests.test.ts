import { expect, test, describe } from "bun:test";
import app from "..";

describe("API routes", () => {
  test("GET /api", async () => {
    const res = await app.request("/api");
    expect(res.status).toBe(200);
  });

  test("GET /api/ping", async () => {
    const res = await app.request("/api/ping");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ message: "pinged api successfully" });
  });
});
