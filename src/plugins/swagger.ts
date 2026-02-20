import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export default async function swaggerPlugin(fastify: FastifyInstance) {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'API Documentation',
                description: 'Orders API converted to Fastify',
                version: '1.0.0',
            },
        },
        transform: jsonSchemaTransform,
    });

    await fastify.register(swaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        staticCSP: true,
    });
}
