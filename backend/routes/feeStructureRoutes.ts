import { Router } from "express";
import db from "../db/initDB";
import { CLASS_STANDARDS } from "../constants";

const router = Router();

/* create / upsert fee structure */
router.post("/", (req, res) => {
    const {
        class_standard,
        registration_fee = 0,
        basic_fee = 0,
        exam_fee = 0,
        renewal_fee = 0,
    } = req.body ?? {};

    if (!class_standard) {
        return res.status(400).json({ error: "Class standard is required" });
    }

    if (!CLASS_STANDARDS.includes(class_standard as any)) {
        return res.status(400).json({
            error: `Invalid class. Allowed: ${CLASS_STANDARDS.join(", ")}`,
        });
    }

    // Ensure non-negative fees
    const safeFees = {
        registration: Math.max(0, Number(registration_fee) || 0),
        basic: Math.max(0, Number(basic_fee) || 0),
        exam: Math.max(0, Number(exam_fee) || 0),
        renewal: Math.max(0, Number(renewal_fee) || 0),
    };

    db.prepare(`
        INSERT INTO fee_structure (
        class_standard,
        registration_fee,
        basic_fee,
        renewal_fee,
        exam_fee
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(class_standard) DO UPDATE SET
        registration_fee = excluded.registration_fee,
        basic_fee = excluded.basic_fee,
        renewal_fee = excluded.renewal_fee,
        exam_fee = excluded.exam_fee,
        updated_at = CURRENT_TIMESTAMP
    `).run(
        class_standard,
        safeFees.registration,
        safeFees.basic,
        safeFees.renewal,
        safeFees.exam
    );

    res.status(201).json({ message: "Fee structure upserted successfully" });
});

/* get all fee structures */
router.get("/", (_req, res) => {
    const fees = db.prepare(`
        SELECT *
        FROM fee_structure
        ORDER BY class_standard
        `).all();

        res.json(fees);
});

/* get fee structure by class standard */
router.get("/:class_standard", (req, res) => {
    const fee = db.prepare(`
        SELECT *
        FROM fee_structure
        WHERE class_standard = ?
        `).get(req.params.class_standard);

        if(!fee) {
            return res.status(404).json({ message: "Fee structure not found"});
        }

        res.json(fee);
});

/* update fee structure by class standard */
router.put("/:class_standard", (req, res) => {
    const {
        registration_fee,
        basic_fee,
        exam_fee,
        renewal_fee,
    } = req.body ?? {};

    // Sanitise: ensure non-negative
    const safeFees = {
        registration: Math.max(0, Number(registration_fee) || 0),
        basic: Math.max(0, Number(basic_fee) || 0),
        exam: Math.max(0, Number(exam_fee) || 0),
        renewal: Math.max(0, Number(renewal_fee) || 0),
    };

    const result = db.prepare(`
        UPDATE fee_structure SET
        registration_fee = ?,
        basic_fee = ?,
        exam_fee = ?,
        renewal_fee = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE class_standard = ?
    `).run(
        safeFees.registration,
        safeFees.basic,
        safeFees.exam,
        safeFees.renewal,
        req.params.class_standard
    );

    if (result.changes === 0) {
        return res.status(404).json({ message: "Fee structure not found" });
    }

    res.json({ message: "Fee structure updated successfully" });
});

/* delete fee structure by class standard */
router.delete("/:class_standard", (req, res) => {
    const result = db.prepare(`
        DELETE FROM fee_structure WHERE class_standard = ?
        `).run(req.params.class_standard);

        if(result.changes === 0) {
            return res.status(404).json({ message: "Fee structure not found" });
        }

        res.json({ message: "Fee structure deleted successfully" });
});

export default router;