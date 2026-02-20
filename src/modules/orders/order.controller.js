import { orderService } from './order.service.js';
import { logger } from '../../utils/logger.js';

export const createOrderHandler = async (request, reply) => {
    try {
        const orderInput = request.body;
        logger.info({ customerId: orderInput.customerId }, 'Processing new order');

        const result = await orderService.processOrder(orderInput);

        logger.info({ orderId: result.id }, 'Order created successfully');
        return reply.status(201).send(result);
    } catch (error) {
        throw error;
    }
};
