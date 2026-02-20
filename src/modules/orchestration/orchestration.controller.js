import { orchestrationService } from './orchestration.service.js';
import { AppError } from '../../utils/errors.js';

export const runSimulationHandler = async (request, reply) => {
    try {
        const result = await orchestrationService.runSimulation(request.body);

        // Devolvemos 207 Multi-Status si hubo un fallo parcial (estrategia de resiliencia real)
        const statusCode = result.status === 'partial_success' ? 207 : 200;

        return reply.status(statusCode).send(result);
    } catch (error) {
        throw new AppError(`Unexpected error during orchestration: ${error.message}`, 500);
    }
};
