import dotenv from "dotenv";

dotenv.config();

export default {
    app: {
        name: process.env.npm_package_name || "api",
        port: process.env.PORT || 3000,
        build: process.env.npm_package_version || "0.0.0",
        environment: process.env.NODE_ENV || "local",
    },
    rateLimiter: {
        enabled: process.env.RATE_LIMITER_ENABLED === "true",
        windowMs: parseInt(process.env.RATE_LIMITER_WINDOW_MS || "60000"),
        maxRequests: parseInt(process.env.RATE_LIMITER_MAX_REQUESTS || "100"),
        standardHeaders: process.env.RATE_LIMITER_STANDARD_HEADERS === "true",
        legacyHeaders: process.env.RATE_LIMITER_LEGACY_HEADERS === "false",
        message: process.env.RATE_LIMITER_MESSAGE || "Too many requests. Please try again later.",
    },
    db: {
       host: process.env.TYPEORM_HOST || "localhost",
       port: parseInt(process.env.TYPEORM_PORT || "5432"),
       username: process.env.TYPEORM_USERNAME || "postgres",
       password: process.env.TYPEORM_PASSWORD || "postgres",
       database: process.env.TYPEORM_DATABASE || "incident_db",
       synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
    },
    hashing: {
        saltRounds: process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10,
    },
    auth: {
        jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            accessExpiration: process.env.JWT_ACCESS_EXPIRATION || "5m",
            refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "1h",
        }
    },
    pagination: {
        maxLimit: parseInt(process.env.MAX_PAGINATION_LIMIT || '100'),
    },
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        defaultExpiration: parseInt(process.env.REDIS_DEFAULT_EXPIRATION || "300"),
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost"
    }
}