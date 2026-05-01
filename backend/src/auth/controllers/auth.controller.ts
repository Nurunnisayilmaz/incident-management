import { sendError, sendSuccess } from "@/utils/response/responseHelper";
import { Request, Response } from 'express';
import { AuthService } from "../services/auth.service";
import { setAuthCookies } from "@/utils/auth/cookies";
import { AppError } from "@/utils/response/appError";
import { UserService } from "../services/user.service";
import { cache } from "@/utils/cache";
import { cacheKeys } from "@/utils/cache/keys";

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await AuthService.findUserByEmail(email);
        
        if (userExists) {
            throw new Error('User with this email already exists');
        }
        
        const user = await AuthService.createUser(username, email, password);
        if (!user) throw new Error('User registration failed');

        await cache.deleteSmart(cacheKeys.users);
        sendSuccess(res, user);
    } catch (error) {
        sendError(req, res, error);
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const userExists = await AuthService.getLoginUser(email, password);

        if (!userExists) {
            throw new Error('User not found');
        }

        const { accessToken, refreshToken } = await AuthService.createAuthSession(userExists.id, email);

        setAuthCookies(res, accessToken, refreshToken);

        sendSuccess(res, {
            id: userExists.id,
            username: userExists.username,
            email: userExists.email,
            accessToken
        });
    } catch (error) {
        sendError(req, res, error);
    }
}

export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new AppError(401, 'Unauthenticated', 'Refresh token missing');
        }

        const { accessToken, userId } = await AuthService.refreshAuthSession(refreshToken);

        setAuthCookies(res, accessToken, refreshToken);

        sendSuccess(res, { accessToken, userId });
    } catch (error) {
        sendError(req, res, error);
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        await AuthService.logoutUser(req);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
        sendError(req, res, error);
    }
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id.toString();
        const user = await UserService.getUserById(userId);
        sendSuccess(res, user);
    } catch (error) {
        sendError(req, res, error);
    }
}
