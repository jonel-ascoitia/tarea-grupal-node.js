import { z } from 'zod';

export const simulationRequestSchema = z.object({
    userId: z.string().uuid(),
    cartId: z.string().uuid(),
    simulateFailure: z.boolean().optional().default(false),
});

export const simulationResponseSchema = z.object({
    status: z.enum(['success', 'partial_success', 'failed']),
    data: z.object({
        inventory: z.any().optional(),
        fraudCheck: z.any().optional(),
        shipping: z.any().optional(),
    }),
    errors: z.array(z.string()).optional(),
    resolvedAt: z.string(),
});

export type SimulationRequestInput = z.infer<typeof simulationRequestSchema>;
export type SimulationResponse = z.infer<typeof simulationResponseSchema>;
