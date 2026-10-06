import { config } from "../config/index.js";

// One line per request once the response has finished.
export function requestLogger(req, res, next) {
  if (!config.LOG_REQUESTS) return next();
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(
      `[http] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms id=${req.id}`,
    );
  });
  next();
}
