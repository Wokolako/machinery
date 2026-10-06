// Errors a service or middleware can throw on purpose. The error handler turns
// each into its status code and a JSON body; anything else becomes a 500.

export class AppError extends Error {
  constructor(message, { status = 500, code = "internal_error", details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, { status: 404, code: "not_found" });
  }
}

/** details maps field names to messages, e.g. { name: "Enter your name." } */
export class ValidationError extends AppError {
  constructor(details, message = "Some fields need attention.") {
    super(message, { status: 400, code: "validation_failed", details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "A valid API key is required.") {
    super(message, { status: 401, code: "unauthorized" });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(retryAfterSeconds) {
    super("Too many requests. Try again later.", { status: 429, code: "rate_limited" });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable.") {
    super(message, { status: 503, code: "unavailable" });
  }
}
