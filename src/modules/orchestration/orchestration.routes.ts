import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { runSimulationHandler } from './orchestration.controller';
import { simulationRequestSchema, simulationResponseSchema } from './orchestration.schema';

export default async function orchestrationRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<ZodTypeProvider>();

    server.post(
        '/simulate',
        {
            schema: {
                description: 'Simulate a parallel orchestration for resilience testing',
                tags: ['Orchestration'],
                body: simulationRequestSchema,
                response: {
                    200: simulationResponseSchema,
                    207: simulationResponseSchema,
                },
            },
        },
        runSimulationHandler
    );
}
