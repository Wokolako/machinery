import { createHash, timingSafeEqual } from "node:crypto";
import { config } from "../config/index.js";
import { ServiceUnavailableError, UnauthorizedError } from "../errors/AppError.js";

const digest = (value) => createHash("sha256").update(value).digest();

// Protects admin endpoints with the X-API-Key header. Hashing both sides first
// makes the comparison constant-time regardless of the submitted key's length.
export function requireApiKey(req, _res, next) {
  if (!config.ADMIN_API_KEY) {
    return next(new ServiceUnavailableError("Admin endpoints are disabled. Set ADMIN_API_KEY to enable them."));
  }
  const supplied = req.get("x-api-key") ?? "";
  if (!timingSafeEqual(digest(supplied), digest(config.ADMIN_API_KEY))) {
    return next(new UnauthorizedError());
  }
  next();
}
