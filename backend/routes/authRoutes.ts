import { Router } from "express";
import db from "../db/initDB";
import { comparePassword, generateToken, hashPassword } from "../auth/authUtils";
import { authenticate } from "../auth/authMiddleware";

interface UserRow {
    uuid: string;
    email: string;
    password_hash: string;
    role: string;
    full_name: string;
    must_change_password: number;
}

const router = Router();

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = db.prepare("SELECT * FROM user_roles WHERE email = ?").get(email) as UserRow | undefined;

    if(!user) {
        return res.status(401).json({ message: "Invalid credentials"});
    }

    const valid = await comparePassword(password, user.password_hash);

    if(!valid) {
        return res.status(401).json({ message: "Invalid credentials"});
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
        mustChangePassword: user.must_change_password === 1,
    });
});

/* ================= CHANGE PASSWORD ================= */
router.post("/change-password", authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userPayload = (req as any).user;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = db.prepare("SELECT * FROM user_roles WHERE uuid = ?").get(userPayload.uuid) as UserRow | undefined;

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const valid = await comparePassword(currentPassword, user.password_hash);
    if (!valid) {
        return res.status(401).json({ message: "Current password is incorrect" });
    }

    const newHash = await hashPassword(newPassword);

    db.prepare(`
        UPDATE user_roles SET
            password_hash = ?,
            must_change_password = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE uuid = ?
    `).run(newHash, userPayload.uuid);

    res.json({ message: "Password changed successfully" });
});

export default router;