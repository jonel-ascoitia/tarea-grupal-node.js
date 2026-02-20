import { FastifyRequest, FastifyReply } from 'fastify';
import { SimulationRequestInput } from './orchestration.schema';
import { orchestrationService } from './orchestration.service';
import { AppError } from '../../utils/errors';

export const runSimulationHandler = async (
    request: FastifyRequest<{ Body: SimulationRequestInput }>,
    reply: FastifyReply
) => {
    try {
        const result = await orchestrationService.runSimulation(request.body);

        // Devolvemos 207 Multi-Status si hubo un fallo parcial (estrategia de resiliencia real)
        const statusCode = result.status === 'partial_success' ? 207 : 200;

        return reply.status(statusCode).send(result);
    } catch (error: any) {
        throw new AppError(`Unexpected error during orchestration: ${error.message}`, 500);
    }
};
