import { logger } from '../../utils/logger';
import { SimulationRequestInput, SimulationResponse } from './orchestration.schema';

export class OrchestrationService {
    async runSimulation(input: SimulationRequestInput): Promise<SimulationResponse> {
        logger.info({ input }, 'Starting parallel orchestration simulation');

        // Múltiples endpoints ejecutándose en paralelo
        const promises = [
            this.simulateInventoryCheck(input.cartId),
            this.simulateFraudCheck(input.userId, input.simulateFailure),
            this.simulateShippingCalculation(),
        ];

        // Promesas en paralelo que no se bloquean si una falla
        const results = await Promise.allSettled(promises);

        // Integración de respuestas
        const data: any = {};
        const errors: string[] = [];
        let successCount = 0;

        // Consolidar resultados y manejar fallos
        results.forEach((result, index) => {
            const operationName = ['inventory', 'fraudCheck', 'shipping'][index];

            if (result.status === 'fulfilled') {
                data[operationName] = result.value;
                successCount++;
            } else {
                logger.error(`Operation ${operationName} failed:`, result.reason.message);
                errors.push(`[${operationName}] failed: ${result.reason.message}`);
            }
        });

        let status: 'success' | 'partial_success' | 'failed' = 'success';
        if (successCount === 0) status = 'failed';
        else if (successCount < promises.length) status = 'partial_success';

        return {
            status,
            data,
            ...(errors.length > 0 && { errors }),
            resolvedAt: new Date().toISOString(),
        };
    }

    // 👇 Simulación de llamadas a servicios externos 👇

    private async simulateInventoryCheck(cartId: string): Promise<{ available: boolean; reservedAt: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ available: true, reservedAt: new Date().toISOString(), cartId });
            }, 300); // 300ms de latencia simulada
        });
    }

    private async simulateFraudCheck(userId: string, forceFail: boolean): Promise<{ score: number; passed: boolean }> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (forceFail) {
                    reject(new Error('Fraud service timeout or unavailable'));
                } else {
                    resolve({ score: 95, passed: true, userId });
                }
            }, 500); // 500ms de latencia simulada
        });
    }

    private async simulateShippingCalculation(): Promise<{ cost: number; provider: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ cost: 15.50, provider: 'FedEx' });
            }, 400); // 400ms de latencia simulada
        });
    }
}

export const orchestrationService = new OrchestrationService();
