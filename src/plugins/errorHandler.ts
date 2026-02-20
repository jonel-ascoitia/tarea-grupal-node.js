import { FastifyInstance, FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export default async function errorHandlerPlugin(fastify: FastifyInstance) {
    fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
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
