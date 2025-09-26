// src/utils/errorHandler.js

export class ErrorHandler extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name; 
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ErrorHandler {
  constructor(message = "Resource Not Found") {
    super(message, 404);
  } 
}

export class ValidationError extends ErrorHandler {
  constructor(message = "Validation Error") {
    super(message, 400);
  }
}

export class UnauthorizedError extends ErrorHandler {
  constructor(message = "Unauthorized") {
    super(message, 401);
  } 
}

export class BadRequestError extends ErrorHandler {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class ForbiddenError extends ErrorHandler {
  constructor(message = "Forbidden") {
    super(message, 403);
  } 
}

export class ConflictError extends ErrorHandler {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}
