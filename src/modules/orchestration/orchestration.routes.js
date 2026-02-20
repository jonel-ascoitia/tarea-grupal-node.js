import { runSimulationHandler } from './orchestration.controller.js';
import { simulationRequestSchema, simulationResponseSchema } from './orchestration.schema.js';

export default async function orchestrationRoutes(fastify) {
    fastify.post(
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
