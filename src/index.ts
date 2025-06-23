import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { limiter } from './middlewares/rate_limiter';
import logger from './config/logger';
import { config } from './config';
import { proxyServices } from './config/services';
import { errorHandler, notFound, requestLogger } from './middlewares';

const app = express();

app.use(helmet());
app.use(cors({
    origin:true,
    credentials:true,
}));
app.use(limiter);

// Logging Requests
app.use(requestLogger);

app.use('/health', (req:Request, res:Response, next:NextFunction) => {
    res.status(200).json({ success: true, message: "Server is healthy" });
})

proxyServices(app);

// 404 - route not found
app.use(notFound)

// Error handling middleware
app.use(errorHandler);

const startServer = () => {
    try {
        app.listen(config.PORT, () => {
            logger.info(`${config.SERVICE_NAME} running on port ${config.PORT}`)
        })
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();