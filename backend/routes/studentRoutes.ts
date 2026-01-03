import { Router } from "express";
import db from "../db/initDB";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", (req, res) => {
    const students = db.prepare(`
        SELECT
            uuid,
            name,
            roll_number,
            class_standard,
            father_name,
            father_contact,
            created_at
        FROM students
        ORDER BY class_standard, roll_number
        `).all();

        res.json(students);
});

router.post("/", (req, res) => {
    const {
        name,
        roll_number,
        dob,
        gender,
        class_standard,
        father_name,
        father_contact,
        mother_name,
        mother_contact,
    } = req.body;

    if(!name || !roll_number || !dob || !gender || !class_standard) {
        return res.status(400).json({ message: "Missing required fields"});
    }

    try {
        const uuid = uuidv4();

        db.prepare(`
            INSERT INTO students (
                uuid,
                name,
                roll_number,
                dob,
                gender,
                class_standard,
                father_name,
                father_contact,
                mother_name,
                mother_contact
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    uuid,
                    name,
                    roll_number,
                    dob,
                    gender,
                    class_standard,
                    father_name,
                    father_contact,
                    mother_name,
                    mother_contact
                );
            
            res.status(201).json({ uuid });
        } catch (err : any) {
            if(err.code === "SQLITE_CONSTRAINT") {
                return res.status(409).json({ message: "Roll number already exists"});
            }
            res.status(500).json({ message: "Failed to create a student" });
        }
});

router.put("/:uuid", (req, res) => {
    const { uuid } = req.params;

    const result = db.prepare(`
        UPDATE students
        SET
            name = ?,
            class_standard = ?,
            father_name = ?,
            father_contact = ?,
            mother_name = ?,
            mother_contact = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE uuid = ?
    `).run(
        req.body.name,
        req.body.class_standard,
        req.body.father_name,
        req.body.father_contact,
        req.body.mother_name,
        req.body.mother_contact,
        uuid
    );

    if(result.changes === 0) {
        return res.status(404).json({ message: "Student not found" });
    }

    res.json({ success: true});
});

export default router;