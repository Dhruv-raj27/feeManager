import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./authUtils";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Malformed authorization header"
        });
    }

    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        next();
    } catch {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};

export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = (req as any).user;
    if (!user || user.role !== "Admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};