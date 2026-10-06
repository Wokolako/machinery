import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

// These tests exercise routing, validation, auth and error handling, all of
// which answer before any query reaches PostgreSQL, so no database is needed.
// The URL points at a port nothing listens on, which also lets us check how
// the API reports an unreachable database.
process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:1/none";
process.env.ADMIN_API_KEY = "test-admin-key-0123456789";
process.env.PILOT_RATE_LIMIT = "3";
process.env.LOG_REQUESTS = "false";

const { createApp } = await import("../src/app.js");
const { closePool } = await import("../src/db/pool.js");

let server;
let base;

before(async () => {
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closePool();
});

const post = (path, body, headers = {}) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("HTTP layer", () => {
  it("returns a JSON 404 with a request id for unknown endpoints", async () => {
    const res = await fetch(`${base}/nope`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error.code, "not_found");
    assert.ok(body.error.requestId);
    assert.equal(res.headers.get("x-request-id"), body.error.requestId);
  });

  it("sets security and no-store headers", async () => {
    const res = await fetch(`${base}/nope`);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("x-powered-by"), null);
  });

  it("rejects an invalid page slug before touching the database", async () => {
    const res = await fetch(`${base}/pages/NOT_VALID!`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, "validation_failed");
  });

  it("returns field errors for an incomplete pilot request", async () => {
    const res = await post("/pilot-requests", { requesterKind: "partner" });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.details.name, "Enter your name.");
    assert.equal(body.error.details.machines, "List at least one machine type and material.");
  });

  it("rejects malformed JSON with a 400", async () => {
    const res = await post("/pilot-requests", "{not json");
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, "invalid_json");
  });

  it("requires an API key to list pilot requests", async () => {
    const res = await fetch(`${base}/pilot-requests`);
    assert.equal(res.status, 401);
    const wrong = await fetch(`${base}/pilot-requests`, { headers: { "X-API-Key": "wrong" } });
    assert.equal(wrong.status, 401);
  });

  it("validates the request id on the admin detail route", async () => {
    const res = await fetch(`${base}/pilot-requests/not-a-uuid`, {
      headers: { "X-API-Key": process.env.ADMIN_API_KEY },
    });
    assert.equal(res.status, 400);
  });

  it("reports an unreachable database as 503 on health", async () => {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.ok, false);
    assert.equal(body.database.ok, false);
  });

  it("rate limits pilot submissions per client", async () => {
    // A fresh client address (trusted from loopback) gets its own budget of 3.
    let last;
    for (let i = 0; i < 4; i += 1) {
      last = await post("/pilot-requests", {}, { "X-Forwarded-For": "203.0.113.9" });
    }
    assert.equal(last.status, 429);
    assert.ok(Number(last.headers.get("retry-after")) > 0);
  });
});
