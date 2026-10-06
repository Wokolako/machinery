import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { closePool, databaseUrl } from "./db/pool.js";
import * as healthService from "./services/health.service.js";

const app = createApp();

// Vercel runs the exported app as a function; everywhere else we listen.
export default app;

const server = process.env.VERCEL ? null : app.listen(config.PORT, config.HOST, async () => {
  console.log(`[api] listening on http://${config.HOST}:${config.PORT}/api (${config.NODE_ENV})`);
  if (!databaseUrl) {
    console.warn("[db] DATABASE_URL is not set; every data endpoint answers 503.");
    return;
  }
  const health = await healthService.check();
  if (health.database.ok) {
    console.log(`[db] connected to ${health.database.database}, PostgreSQL ${health.database.serverVersion}`);
  } else {
    console.error(`[db] not reachable: ${health.database.error}`);
  }
});

// Stop taking requests, let in-flight ones finish, then close the pool.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown || !server) return;
  shuttingDown = true;
  console.log(`[api] ${signal} received, shutting down`);
  const force = setTimeout(() => process.exit(1), 10_000);
  force.unref();
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("[api] unhandled rejection:", reason);
});
