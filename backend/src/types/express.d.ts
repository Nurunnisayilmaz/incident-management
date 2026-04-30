import type { IUser } from "@/auth/models/user.entity";

declare global {
    namespace Express {
        interface Request {
            user: IUser;
        }
    }
}

export {};