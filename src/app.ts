import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { logger } from './utils/logger';
import registerPlugins from './plugins';
import orderRoutes from './modules/orders/order.routes';
import orchestrationRoutes from './modules/orchestration/orchestration.routes';
import { config } from './config';

export const buildApp = async () => {
    const app = Fastify({
        logger: config.NODE_ENV === 'test' ? false : {
            level: config.LOG_LEVEL,
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                },
            },
        },
    });

    // Setup Type Provider Validation
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    // Register Custom Plugins (Cors, Swagger, ErrorHandler, RateLimit)
    await registerPlugins(app);

    // HealthCheck
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // API Routes
    await app.register(orderRoutes, { prefix: '/api/orders' });
    await app.register(orchestrationRoutes, { prefix: '/api/orchestration' });

    return app;
};
