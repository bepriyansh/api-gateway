import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // logger.debug(`${req.method} ${req.url}`);
  next();
}

export const notFound = (req:Request, res:Response, next:NextFunction) => {
    logger.warn(`Resource not found: ${req.method} ${req.url}`);
    res.status(404).json({ success: false, message: "Resource not found" });
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: "Internal server error" });
}

export const addTestCookie = (req: Request, res: Response, next: NextFunction) => {
  res.cookie('testCookie', 'HelloWorld', {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        maxAge: 60000,
    });
    next();
}