import { Request, Response } from 'express';
import { ValidationError } from 'yup';
import { AppError } from '@/utils/response/appError';
import { ApiResponse } from './ApiResponse';
import { getLogger } from '../logger';

const logger = getLogger('responseHelper');

export function sendSuccess<T>(res: Response, data?: T, statusCode = 200): void {
    const response: ApiResponse<T> = {
        success: true,
        ...(data !== undefined && { data }),
    };

    res.status(statusCode).send(response);
}

export function sendError(req: Request, res: Response, error: unknown) {
    let response: ApiResponse<null> = {
        success: false,
        error: "Internal server error",
    };
    let statusCode = 500;

    const requestInfo = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
    };

    if (error instanceof AppError) {
        response.error = error.message;
        statusCode = error.statusCode;

        logger.error(`[${statusCode}] ${error.internalMessage || error.message}`, {
            ...requestInfo,
            stack: error.stack,
        });

    } else if (error instanceof ValidationError) {
        const messages = error.inner.map(e => `${e.message}`);
        response.error = messages.join('; ');
        statusCode = 400;

        logger.error(`[${statusCode}] Validation error`, {
            ...requestInfo,
            errors: messages,
        })
    } else if (error !== null && typeof error === "object" && "statusCode" in error && "message" in error) {
        const genericError = error as { statusCode: number; message: string; stack?: string };
        response.error = genericError.message;
        statusCode = genericError.statusCode;

        logger.error(`[${statusCode}] ${genericError.message}`, {
            ...requestInfo,
            stack: genericError.stack || 'No stack trace',
        });
    } else {
        logger.error(`[500] Unexpected error`, {
            ...requestInfo,
            error: (error as Error).message,
            stack: (error as Error).stack || 'No stack trace',
        });
    }

    res.status(statusCode).send(response);
    logger.debug("Response sent:", response);
}
