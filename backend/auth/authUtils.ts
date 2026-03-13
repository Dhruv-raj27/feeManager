import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

export const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set!");
    }
    return secret;
};

export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object) => {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: "8h",
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, getJwtSecret());
};