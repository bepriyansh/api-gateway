import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import axios from 'axios';

export interface AuthUser {
    id: string;
    username: string;
    role: string;
    profilePicture?: string;
}

export const requestNewAccessToken = async (cookieHeader: string): Promise<string | null> => {
    try {
        const response = await axios.post(
            `${config.AUTH_SERVICE_URL}/api/v1/auth/refreshToken`,
            {},
            {
                headers: {
                    Cookie: cookieHeader,
                },
                withCredentials: true,
            }
        );

        const newAccessToken = response.data?.data?.accessToken;
        return newAccessToken || null;
    } catch (err) {
        console.error('Failed to refresh token via auth service:', err);
        return null;
    }
};


const verifyAccessToken = (token: string): JwtPayload | string | null => {
    try {
        return jwt.verify(token, config.AUTH_JWT_SECRET);
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') return 'expired';
        return null;
    }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    const accessToken = authHeader?.split(' ')[1];
    const accessCheck = verifyAccessToken(accessToken!);
    
    if (accessCheck && accessCheck !== 'expired') {
        req.user = accessCheck as JwtPayload;
        next();
        return;
    }
    
    if (!accessCheck || accessCheck === 'expired') {
        try {
            const cookieHeader = req.headers.cookie || '';
            const newAccessToken = await requestNewAccessToken(cookieHeader);

            if (!newAccessToken) {
                res.status(401).json({ success: false, message: 'Refresh token invalid or expired' });
                return;
            }

            req.headers.authorization = `Bearer ${newAccessToken}`;
            const decoded = jwt.verify(newAccessToken, config.AUTH_JWT_SECRET);
            req.user = decoded as AuthUser;
            res.cookie('accessToken', newAccessToken, {
                httpOnly: false,
                secure: true,
                sameSite: 'none',
                maxAge: 15 * 60 * 1000
            });
            next();
            return;
        } catch (error) {
            console.error('Token refresh failed:', error);
            res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
            return;
        }
    }

    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
};

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
    next();
};

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    if ((req.user as AuthUser)?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized - Admin required' });
        return;
    }
    next();
};
