import db from "../db/initDB";
import { hashPassword } from "./authUtils";
import { v4 as uuidv4 } from "uuid";

export const initAdminUser = async () => {
    const adminExists = db.prepare("SELECT * FROM user_roles WHERE role = 'Admin'").get();

    if (adminExists) return;

    // Temporary first-login password — admin MUST change this on first login
    const tempPassword = "ChangeMe@FirstLogin";
    const passwordHash = await hashPassword(tempPassword);

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@school.local";

    db.prepare(`
        INSERT INTO user_roles (
        uuid,
        full_name,
        email,
        password_hash,
        role,
        must_change_password
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            uuidv4(),
            "System Administrator",
            adminEmail,
            passwordHash,
            "Admin",
            1  // must change password on first login
        );
    console.log("Default admin user created! Temporary password: ChangeMe@FirstLogin");
    console.log("⚠️  Admin MUST change this password on first login.");
};