import { createOrderHandler } from './order.controller.js';
import { createOrderSchema, orderResponseSchema } from './order.schema.js';

export default async function orderRoutes(fastify) {
    fastify.post(
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
