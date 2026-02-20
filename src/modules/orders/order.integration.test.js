import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../app';
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

describe('Order Integration Tests', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should return 400 when missing items', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/orders',
            payload: {
                customerId: randomUUID(),
                items: [] // empty items should fail validation
            },
        });

        expect(response.statusCode).toBe(400);
        const parsed = JSON.parse(response.payload);
        expect(['ValidationError', 'Bad Request']).toContain(parsed.error);
    });
});
