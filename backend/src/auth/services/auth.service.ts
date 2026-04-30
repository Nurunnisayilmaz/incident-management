import { getLogger } from "@/utils/logger";
import { comparePasswords, hashPassword } from "@/utils/auth/password";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/utils/auth/jwt";
import { AppError } from "@/utils/response/appError";
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

import { AppDataSource } from "@/utils/database";
import { User } from "../models/user.entity";
import { AuthSession } from "../models/auth.session.entity";
import { IsNull } from "typeorm";


const logger = getLogger('Auth Service');

export class AuthService {

    private static userRepo = AppDataSource.getRepository(User);
    private static sessionRepo = AppDataSource.getRepository(AuthSession);

    static async createUser(username: string, email: string, password: string) {

        const hashedPassword = await hashPassword(password);

        const newUser = this.userRepo.create({
            username,
            email,
            password: hashedPassword,
        });

        return await this.userRepo.save(newUser);
    }

    static async findUserByEmail(email: string) {
        const user = await this.userRepo.findOne({
            where: { email },
        });
        return user;
    }

    static async getLoginUser(email: string, password: string) {
        const user = await this.findUserByEmail(email.toLowerCase());

        if (!user) {
            throw new AppError(401, 'Invalid email or password', 'User not found');
        }

        const isPasswordValid = await comparePasswords(password, user.password);

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid email or password', 'Password mismatch');
        }

        return user;
    }

    static async createAuthSession(userId: string, email: string) {

        const existingSession = await this.sessionRepo.findOne({
            where: {
                userId,
                expiredAt: IsNull(),
            }
        });

        if (existingSession) {
            existingSession.expiredAt = new Date();
            await this.sessionRepo.save(existingSession);
        }

        const refreshToken = generateRefreshToken(userId);
        const accessToken = generateAccessToken(userId, email);

        const newSession = this.sessionRepo.create({
            userId,
            refreshToken,
            sessionId: uuidv4(),
        });

        await this.sessionRepo.save(newSession);

        return { accessToken, refreshToken };
    }

    static async refreshAuthSession(refreshToken: string) {

        const decoded = await verifyRefreshToken(refreshToken);

        if (!decoded) {
            throw new AppError(401, 'Unauthenticated', 'Invalid refresh token');
        }

        const userId = decoded.sub as string | undefined;

        if (!userId) {
            throw new AppError(401, 'Unauthenticated', 'Invalid refresh token');
        }

        const session = await this.sessionRepo.findOne({
            where: {
                userId,
                refreshToken,
                expiredAt: IsNull(),
            }
        });

        if (!session) {
            throw new AppError(401, 'Unauthenticated', 'Refresh token not found or session expired');
        }

        const accessToken = generateAccessToken(userId, {});
        return { accessToken, userId };
    }

    static async logoutUser(req: Request) {
        const userId = (req as any).user?.id;

        if (!userId) {
            throw new AppError(401, "Unauthenticated", "Invalid access token");
        }

        await this.sessionRepo.update(
            { userId, expiredAt: IsNull() },
            { expiredAt: new Date() }
        );

        return true;
    }

    static async validateToken(req: Request) {
        const authHeader = req.headers.authorization;

        const accessToken =
            (req as any).cookies?.accessToken ||
            (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

        if (!accessToken) {
            throw new AppError(401, 'Unauthenticated', 'Access token missing');
        }

        const decoded = await verifyAccessToken(accessToken);

        if (!decoded || !decoded.sub) {
            throw new AppError(401, 'Unauthenticated', 'Invalid access token');
        }

        const user = await this.userRepo.findOne({
            where: { id: decoded.sub as any },
        });

        if (!user) {
            throw new AppError(401, 'Unauthenticated', 'User not found');
        }

        return user;
    }
}