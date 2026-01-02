import brcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_SECRET = "fee_management_secret";

export const hashPassword = async (password : string) => {
    return brcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password : string, hash : string) => {
    return brcrypt.compare(password, hash);
};

export const generateToken = (payload : any) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "8h",
    });
};

export const verifyToken = (token : string) => {
    return jwt.verify(token, JWT_SECRET);
}