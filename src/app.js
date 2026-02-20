import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from './plugins/validationCompiler.js';
import { logger } from './utils/logger.js';
import registerPlugins from './plugins/index.js';
import orderRoutes from './modules/orders/order.routes.js';
import orchestrationRoutes from './modules/orchestration/orchestration.routes.js';
import { config } from './config/index.js';

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
