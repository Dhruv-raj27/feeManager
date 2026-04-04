import { Router } from "express";
import db from "../db/initDB";
import { hashPassword } from "../auth/authUtils";
import { requireAdmin } from "../auth/authMiddleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const VALID_ROLES = ["Admin", "Accountant", "Receptionist"];

/* ================= LIST ALL USERS ================= */
router.get("/", requireAdmin, (_req, res) => {
    const users = db.prepare(`
        SELECT uuid, full_name, email, role, must_change_password, created_at
        FROM user_roles
        ORDER BY created_at ASC
    `).all();
    res.json(users);
});

/* ================= CREATE USER ================= */
router.post("/", requireAdmin, async (req, res) => {
    const { full_name, email, role } = req.body;

    if (!full_name?.trim() || !email?.trim() || !role) {
        return res.status(400).json({ message: "Name, email and role are required" });
    }

    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` });
    }

    const existing = db.prepare("SELECT uuid FROM user_roles WHERE email = ?").get(email.trim().toLowerCase());
    if (existing) {
        return res.status(409).json({ message: "A user with this email already exists" });
    }

    const tempPassword = "ChangeMe@FirstLogin";
    const passwordHash = await hashPassword(tempPassword);

    db.prepare(`
        INSERT INTO user_roles (uuid, full_name, email, password_hash, role, must_change_password)
        VALUES (?, ?, ?, ?, ?, 1)
    `).run(uuidv4(), full_name.trim(), email.trim().toLowerCase(), passwordHash, role);

    res.status(201).json({
        message: `User created. They must log in with password: ${tempPassword} and change it immediately.`
    });
});

/* ================= UPDATE ROLE ================= */
router.patch("/:uuid/role", requireAdmin, (req, res) => {
    const { uuid } = req.params;
    const { role } = req.body;
    const requestingUser = (req as any).user;

    if (requestingUser.uuid === uuid) {
        return res.status(400).json({ message: "You cannot change your own role" });
    }

    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const result = db.prepare(`
        UPDATE user_roles SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE uuid = ?
    `).run(role, uuid);

    if ((result as any).changes === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated successfully" });
});

/* ================= DELETE USER ================= */
router.delete("/:uuid", requireAdmin, (req, res) => {
    const { uuid } = req.params;
    const requestingUser = (req as any).user;

    if (requestingUser.uuid === uuid) {
        return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const result = db.prepare("DELETE FROM user_roles WHERE uuid = ?").run(uuid);

    if ((result as any).changes === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
});

export default router;
