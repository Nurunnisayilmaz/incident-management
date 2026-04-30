import { Request, Response, NextFunction } from 'express';
import { sendError } from '@/utils/response/responseHelper';
import { AuthService } from '../services/auth.service';
import { getLogger } from '@/utils/logger';

const logger = getLogger('Authenticate Middleware');

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await AuthService.validateToken(req);
        req.user = user;
        next();
    } catch (error) {
        sendError(req, res, error);
    }
}
