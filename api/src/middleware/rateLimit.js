import { TooManyRequestsError } from "../errors/AppError.js";

/**
 * Fixed-window, in-memory rate limiter keyed by client IP.
 * Fine for a single API process; use a shared store (e.g. Redis) if the API
 * ever runs as several instances.
 */
export function rateLimit({ limit, windowMs }) {
  const hits = new Map();

  // Drop expired windows so the map doesn't grow without bound.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweep.unref();

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const key = req.ip ?? "unknown";
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.set("RateLimit-Limit", String(limit));
    res.set("RateLimit-Remaining", String(Math.max(0, limit - entry.count)));

    if (entry.count > limit) {
      return next(new TooManyRequestsError(Math.ceil((entry.resetAt - now) / 1000)));
    }
    next();
  };
}
