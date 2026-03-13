import { Router } from "express";
import db from "../db/initDB";
import { PHONE_REGEX, isValidSession } from "../constants";

const router = Router();

/* ================= GET SETTINGS ================= */
router.get("/", (_req, res) => {
    const settings = db.prepare(`
        SELECT
            school_name,
            address,
            contact_number,
            email,
            current_academic_session,
            logo_path
        FROM school_settings
        WHERE id = 1
    `).get();

    res.json(settings ?? {});
});

/* ================= UPDATE SETTINGS ================= */
router.put("/", (req, res) => {
    const {
        school_name,
        address,
        contact_number,
        email,
        current_academic_session,
        logo_path = null,
    } = req.body ?? {};

    // Required field check
    if (!school_name?.trim()) {
        return res.status(400).json({ message: "School name is required." });
    }

    // Session format validation
    if (!current_academic_session || !isValidSession(current_academic_session.trim())) {
        return res.status(400).json({
            message: "Academic session must be in YYYY-YYYY format (e.g. 2025-2026)",
        });
    }

    // Optional email format validation
    if (email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    // Optional phone validation
    if (contact_number?.trim() && !PHONE_REGEX.test(contact_number.trim())) {
        return res.status(400).json({ message: "Contact number must be a valid 10-digit number" });
    }

    db.prepare(`
        UPDATE school_settings
        SET
            school_name = ?,
            address = ?,
            contact_number = ?,
            email = ?,
            current_academic_session = ?,
            logo_path = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
    `).run(
        school_name.trim(),
        address?.trim() ?? null,
        contact_number?.trim() ?? null,
        email?.trim() ?? null,
        current_academic_session.trim(),
        logo_path
    );

    res.json({ message: "Settings updated successfully." });
});

export default router;