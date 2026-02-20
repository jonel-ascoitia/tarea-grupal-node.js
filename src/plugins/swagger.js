import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Helper to convert Zod definitions into JSON schemas for Fastify plugins without the TS-specific type provider
export const jsonSchemaTransform = ({ schema }) => {
    return {
        schema: {
            ...schema,
            body: schema.body ? zodToJsonSchema(schema.body) : undefined,
            response: schema.response
                ? Object.fromEntries(
                    Object.entries(schema.response).map(([k, v]) => [k, typeof v === 'object' && v.parse ? zodToJsonSchema(v) : v])
                )
                : undefined
        }
    };
};

export default async function swaggerPlugin(fastify) {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'API Documentation',
                description: 'Orchestration and Orders API in Node.js (Vanilla JS)',
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
