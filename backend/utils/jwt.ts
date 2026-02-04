import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface JwtPayload {
    email: string;
    name: string;
    role: string;
    userId: string;
}

// Extend Express Request type to include user property
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

// Generate Token
export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: 3000 });
};

// Auth Middleware
export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Get token from cookie or Authorization header
    const token = req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

    // Block request if token is missing
    if (!token) {
        res.status(401).send({
            message: "Unauthorized: No token provided!",
            success: false
        });
        return;
    }

    try {
        // Verify token and attach user to request
        const data = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
        req.user = data;
        next();
    } catch {
        // Invalid or expired token
        res.status(401).send({
            message: "Unauthorized: Invalid or expired token",
            success: false
        });
    }
};
