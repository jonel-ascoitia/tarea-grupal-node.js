import { z } from 'zod';

export const createOrderSchema = z.object({
    customerId: z.string().uuid(),
    items: z.array(
        z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive(),
        })
    ).min(1),
});

export const orderResponseSchema = z.object({
    id: z.string().uuid(),
    customerId: z.string().uuid(),
    status: z.string(),
    total: z.number(),
});

export const getOrderParamsSchema = z.object({
    id: z.string().uuid(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
