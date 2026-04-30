import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { getLogger } from './logger';
import { AppError } from './response/appError';
import { verifyAccessToken } from './auth/jwt';

const logger = getLogger('Socket');
let io: SocketIOServer;

export function initSocket(server: HttpServer) {
    io = new SocketIOServer(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.use(async (socket, next) => {
        try {
            console.log('Socket handshake auth:', socket.handshake);
            const token = socket.handshake.auth?.token;
            if (!token) throw new AppError(401, 'Unauthenticated', 'Token missing');

            const decoded = await verifyAccessToken(token);
            if (!decoded) throw new AppError(401, 'Unauthenticated', 'Invalid token');

            socket.data.userId = decoded.sub;
            next();
        } catch (err) {
            logger.error('Authentication failed:', err);
            return next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        logger.info('Client connected', { userId: socket.data.userId });

        socket.on('disconnect', () => {
            logger.info('Client disconnected', { userId: socket.data.userId });
        });

        socket.on('connect_error', (err) => {
            logger.error('Connection error:', err.message);
        });
    });

    return io;
}
export function getIO(): SocketIOServer {
    if (!io) throw new Error('Socket.IO not initialized!');
    return io;
}