export class AppError extends Error {
    public statusCode: number;
    public details?: any;

    constructor(message: string, statusCode: number = 500, details?: any) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}
