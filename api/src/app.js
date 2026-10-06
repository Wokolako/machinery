import express from "express";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { noStore, securityHeaders } from "./middleware/securityHeaders.js";
import { apiRoutes } from "./routes/index.js";

/** Builds the Express app without starting it, so tests can mount it too. */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // The website's server sits in front of the API on the same machine; trust
  // X-Forwarded-For only from loopback so rate limiting sees the real client.
  // On Vercel every request arrives through Vercel's proxy, which sets it.
  app.set("trust proxy", process.env.VERCEL ? true : "loopback");

  app.use(requestId);
  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(express.json({ limit: "20kb" }));

  app.use("/api", noStore, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
