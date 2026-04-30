import envvars from "@/config/envvars";
import { Response } from "express";

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie("accessToken", accessToken, {
        maxAge:  parseDuration(envvars.auth.jwt.accessExpiration),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "local",
    });

    res.cookie("refreshToken", refreshToken, {
        maxAge: parseDuration(envvars.auth.jwt.refreshExpiration),
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "local",
    });
};

const parseDuration = (duration: string): number => {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error("Invalid duration format");

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case "s": return value * 1000;
        case "m": return value * 60 * 1000;
        case "h": return value * 60 * 60 * 1000;
        case "d": return value * 24 * 60 * 60 * 1000;
        default: return value;
    }
};
