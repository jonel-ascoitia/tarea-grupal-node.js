export class AppError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}
