import { Router } from "express";
import db from "../db/initDB";

const router = Router();

router.get("/", (req, res) => {
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

        res.json(settings);
});

router.put("/", (req, res) => {
    const {
        school_name,
        address,
        contact_number,
        email,
        current_academic_session,
        logo_path
    } = req.body ?? {};

    if(!school_name || !address || !contact_number || !email || !current_academic_session) {
        return res.status(400).json({ message: "School name, address, contact number, email, and current academic session are required." });
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
        school_name,
        address,
        contact_number,
        email,
        current_academic_session,
        logo_path
    );

    res.json({ message: "Settings updated successfully." });
});

export default router;