import db from "../db/initDB";
import { hashPassword } from "./authUtils";
import { v4 as uuidv4 } from "uuid";

export const initAdminUser = async () => {
    const adminExists = db.prepare("SELECT * FROM user_roles WHERE role = 'Admin'").get();

    if (adminExists) return;

    const passwordHash = await hashPassword("Admin.Aadharshila@001");

    db.prepare(`
        INSERT INTO user_roles (
        uuid,
        full_name,
        email,
        password_hash,
        role
        )
        VALUES (?, ?, ?, ?, ?)
        `).run(
            uuidv4(),
            "System Administrator",
            "admin@aadharshila.local",
            passwordHash,
            "Admin"
        );
    console.log("Default admin user created!");
};