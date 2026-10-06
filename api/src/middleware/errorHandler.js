import { isProduction } from "../config/index.js";
import { AppError, NotFoundError } from "../errors/AppError.js";

export function notFound(req, _res, next) {
  next(new NotFoundError(`No endpoint ${req.method} ${req.originalUrl}`));
}

// Postgres error codes that mean "the database isn't available".
const DB_DOWN = new Set(["ECONNREFUSED", "ENOTFOUND", "57P01", "57P03", "3D000", "28P01"]);

// The single place errors become responses. Shape:
// { error: { code, message, details?, requestId } }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = "internal_error";
  let message = "Something went wrong on the server.";
  let details;

  if (err instanceof AppError) {
    ({ status, code, message, details } = err);
    if (err.retryAfterSeconds) res.set("Retry-After", String(err.retryAfterSeconds));
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    code = "invalid_json";
    message = "Request body is not valid JSON.";
  } else if (err.type === "entity.too.large") {
    status = 413;
    code = "payload_too_large";
    message = "Request body is too large.";
  } else if (DB_DOWN.has(err.code)) {
    status = 503;
    code = "database_unavailable";
    message = "The database isn't reachable right now.";
  }

  if (status >= 500) {
    console.error(`[error] id=${req.id} ${req.method} ${req.originalUrl}`, err);
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(!isProduction && status === 500 ? { debug: err.message } : {}),
      requestId: req.id,
    },
  });
}
