interface CONFIG {
    SERVICE_NAME: string;
    PORT: string;
    LOG_LEVEL: string;
    DEFAULT_TIMEOUT: number;
    AUTH_SERVICE_URL: string;
    POST_SERVICE_URL: string;
    AUTH_JWT_SECRET: string;
}

export const config : CONFIG = {
    SERVICE_NAME: require('../../package.json').name,
    PORT: process.env.PORT || "3000",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    DEFAULT_TIMEOUT: Number(process.env.DEFAULT_TIMEOUT || "10000"),
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    POST_SERVICE_URL: process.env.POST_SERVICE_URL || "http://localhost:3002",
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET || "my&strong^token@123"
};