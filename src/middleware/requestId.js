import { randomUUID } from "node:crypto";

// Tags each request with an id (reusing a sane incoming X-Request-Id) so log
// lines and error responses can be matched up.
export function requestId(req, res, next) {
  const incoming = req.get("x-request-id");
  req.id = incoming && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
  res.set("X-Request-Id", req.id);
  next();
}
