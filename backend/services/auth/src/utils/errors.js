/**
 * Base Custom Error Class
 */
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends CustomError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthenticatedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends CustomError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends CustomError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity Error
 */
class UnprocessableEntityError extends CustomError {
  constructor(message = 'Unprocessable Entity') {
    super(message, 422);
  }
}

/**
 * 429 Too Many Requests Error
 */
class TooManyRequestsError extends CustomError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends CustomError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

module.exports = {
  CustomError,
  BadRequestError,
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalServerError,
};
