export class AppError extends Error {
    public statusCode: number;
    public internalMessage?: string;

    constructor(statusCode: number, responseMessage: string, internalMessage?: string) {
        super(responseMessage);
        
        this.statusCode = statusCode;
        this.internalMessage = internalMessage;
        this.name = 'AppError';

        Error.captureStackTrace(this, this.constructor);
    }
}
