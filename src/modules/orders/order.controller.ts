import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateOrderInput } from './order.schema';
import { orderService } from './order.service';
import { logger } from '../../utils/logger';

export const createOrderHandler = async (
    request: FastifyRequest<{ Body: CreateOrderInput }>,
    reply: FastifyReply
) => {
    try {
        const orderInput = request.body;
        logger.info({ customerId: orderInput.customerId }, 'Processing new order');

        const result = await orderService.processOrder(orderInput);

        logger.info({ orderId: result.id }, 'Order created successfully');
        return reply.status(201).send(result);
    } catch (error) {
        // Errors will be caught by the global error handler
        throw error;
    }
};
