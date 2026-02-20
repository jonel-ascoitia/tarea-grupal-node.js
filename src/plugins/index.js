import swaggerPlugin from './swagger.js';
import errorHandlerPlugin from './errorHandler.js';
import corsPlugin from '@fastify/cors';
import rateLimitPlugin from '@fastify/rate-limit';

export default async function registerPlugins(fastify) {
    // Register CORS
    await fastify.register(corsPlugin, {
        origin: '*',
    });

    // Register Rate Limiter
    await fastify.register(rateLimitPlugin, {
        max: 100,
        timeWindow: '1 minute',
    });

    // Register Swagger Setup
    await fastify.register(swaggerPlugin);

    // Register Error Handler
    await fastify.register(errorHandlerPlugin);
}
