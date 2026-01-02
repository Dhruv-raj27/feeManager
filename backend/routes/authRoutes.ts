import { Router } from "express";
import db from "../db/initDB";
import { comparePassword, generateToken } from "../auth/authUtils";

interface UserRow {
    uuid: string;
    email: string;
    password_hash: string;
    role: string;
    full_name: string;
}

const router = Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = db.prepare("SELECT * FROM user_roles WHERE email = ?").get(email) as UserRow | undefined;

    if(!user) {
        return res.status(401).json({ message : "Invalid credentials"});
    }

    const valid = await comparePassword(password, user.password_hash);

    if(!valid) {
        return res.status(401).json({ message : "Invalid credentials"});
    }

    const token = generateToken({
        uuid: user.uuid,
        role: user.role,
        email: user.email,
    });

    res.json({
        token,
        user: {
            fullName: user.full_name,
            role: user.role,
        },
    });
});

export default router;