import { ValidationError } from "../errors/AppError.js";

/**
 * Validates and replaces req.body / req.query / req.params with the parsed
 * result of a zod schema, e.g. validate({ body: pilotRequestSchema }).
 * Field errors come back as { field: "message" }, first message per field.
 */
export function validate(schemas) {
  return function validateMiddleware(req, _res, next) {
    const details = {};
    for (const [part, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[part] ?? {});
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path.join(".") || part;
          details[field] ??= issue.message;
        }
      } else {
        // req.query is a getter in Express 5, so store parsed values separately.
        req.valid ??= {};
        req.valid[part] = result.data;
      }
    }
    if (Object.keys(details).length > 0) return next(new ValidationError(details));
    next();
  };
}
