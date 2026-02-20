import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export default async function errorHandlerPlugin(fastify) {
    fastify.setErrorHandler((error, request, reply) => {
        if (error instanceof AppError) {
            reply.status(error.statusCode).send({
                error: error.name,
                message: error.message,
                details: error.details,
            });
            return;
        }

        if (error.validation) {
            reply.status(400).send({
                error: 'ValidationError',
                message: 'Invalid request data',
                details: error.validation,
            });
            return;
        }

        logger.error(error);
        reply.status(500).send({
            error: 'InternalServerError',
            message: 'An unexpected error occurred',
        });
    });
}
