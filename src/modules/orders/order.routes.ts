import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createOrderHandler } from './order.controller';
import { createOrderSchema, orderResponseSchema } from './order.schema';

export default async function orderRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<ZodTypeProvider>();

    server.post(
        '/',
        {
            schema: {
                description: 'Create a new order',
                tags: ['Order'],
                body: createOrderSchema,
                response: {
                    201: orderResponseSchema,
                },
            },
        },
        createOrderHandler
    );
}
