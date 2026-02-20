import { buildApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const startServer = async () => {
    const app = await buildApp();

    try {
        await app.listen({ port: config.PORT, host: config.HOST });
        logger.info(`Server listening heavily on http://${config.HOST}:${config.PORT}`);
        logger.info(`Swagger UI available at http://${config.HOST}:${config.PORT}/documentation`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }

    // Graceful Shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
        process.on(signal, async () => {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            await app.close();
            logger.info('Server closed');
            process.exit(0);
        });
    }
};

startServer();
