// Conservative headers for a JSON-only API. Nothing here is ever rendered as
// a page, so content is locked down completely.
export function securityHeaders(_req, res, next) {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Cross-Origin-Resource-Policy": "same-origin",
  });
  next();
}

// Responses carry live database content; don't let anything cache them.
export function noStore(_req, res, next) {
  res.set("Cache-Control", "no-store");
  next();
}
