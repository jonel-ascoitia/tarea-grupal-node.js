import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from './order.service';
import { supabase } from '../../utils/supabase';
import { AppError } from '../../utils/errors';
import { randomUUID } from 'crypto';

vi.mock('../../utils/supabase', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(),
    }
}));

describe('OrderService Unit Tests', () => {
    const mockCustomerId = randomUUID();
    const mockProductId = randomUUID();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should throw ValidationError if validations fail', async () => {
        // Mock customer validation failure
        (supabase.from as any).mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
                })
            }),
            in: vi.fn().mockResolvedValue({ data: [{ id: mockProductId, stock: 10 }], error: null })
        });

        try {
            await orderService.processOrder({
                customerId: mockCustomerId,
                items: [{ productId: mockProductId, quantity: 1 }]
            });
            expect.fail('Should have thrown AppError');
        } catch (e: any) {
            expect(e).toBeInstanceOf(AppError);
            expect(e.statusCode).toBe(400);
            expect(e.message).toContain('Validation failed');
        }
    });
});
