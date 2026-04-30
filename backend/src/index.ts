import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import envvars from '@/config/envvars';
import { getLogger } from '@/utils/logger';
import { connectDatabase } from '@/utils/database';
import * as rateLimiter from '@/utils/rateLimiter';
import { createServer } from 'http';
import { Routes } from './auth/routes';
import { initSocket } from './utils/socket';


const logger = getLogger('App');

const bootstrap = async () => {
    const app: Application = express();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = initSocket(httpServer);
    app.set('socketIO', io);

    // Route logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        logger.info(`${req.method} ${req.url}`);
        res.on("finish", () => {
            const duration = Date.now() - startTime;
            logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
        });
        next();
    });

    // Rate limiter
    if (envvars.rateLimiter.enabled) {
        app.use(rateLimiter.apiLimiter);
    }

    // Middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors());

    // Routes
    Routes(app);

    try {

        await Promise.all([
            connectDatabase(),
        ]);

        // Start server after all async setup is done
        const SERVICE_NAME = envvars.app.name;
        const VERSION = envvars.app.build + '-' + envvars.app.environment;
        const PORT = envvars.app.port;

        httpServer.listen(PORT, () => {
            logger.info(`${SERVICE_NAME} v${VERSION} is running on port ${PORT}`);
        });
    } catch (err) {
        logger.error(`App failed to initialize: ${err}`);
        process.exit(1);
    }
};

bootstrap();
