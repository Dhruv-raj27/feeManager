import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/initDB";

interface Student {
    uuid: string;
    class_standard: string;
    is_new_admission: number;
    [key: string]: any;
}

interface FeeStructure {
    class_standard: string;
    registration_fee: number;
    renewal_fee: number;
    basic_fee: number;
    exam_fee: number;
}

const router = Router();

/* create payment */
router.post("/", (req, res) => {
    const {
        student_uuid,
        academic_session,
        quarter_number,
        payment_mode,
        discount_amount = 0,
        discount_reason,
    } = req.body ?? {};

    if(!student_uuid || !academic_session || !quarter_number || !payment_mode) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const student = db
    .prepare(`SELECT * FROM students WHERE uuid = ?`)
    .get(student_uuid) as Student | undefined;

    if(!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    const fee = db
    .prepare(`SELECT * FROM fee_structure
        WHERE class_standard = ?`) 
    .get(student.class_standard) as FeeStructure | undefined;

    if(!fee) {
        return res.status(404).json({ message: "Fee structure not found" });
    }

    let amount = 0;
    if(student.is_new_admission === 1) {
        if(quarter_number === 1) {
            amount = fee.registration_fee + fee.basic_fee;
        } else if (quarter_number === 2 || quarter_number === 3) {
            amount = fee.basic_fee + fee.exam_fee;
        } else if (quarter_number === 4) {
            amount = fee.basic_fee;
        }
    } else {
        if ( quarter_number === 1 ) {
            amount = fee.renewal_fee + fee.basic_fee;
        } else if (quarter_number === 2 || quarter_number === 3) {
            amount = fee.basic_fee + fee.exam_fee;
        } else if (quarter_number === 4) {
            amount = fee.basic_fee;
        }
    }

    const finalAmount = amount - discount_amount;
    const payment_uuid = uuidv4();

    db.prepare(`
        INSERT INTO payments (
        uuid,
        student_uuid,
        amount_paid,
        discount_amount,
        discount_reason,
        payment_mode,
        quarter_number,
        class_at_time_of_payment,
        academic_session
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            payment_uuid,
            student_uuid,
            finalAmount,
            discount_amount,
            discount_reason,
            payment_mode,
            quarter_number,
            student.class_standard,
            academic_session
        );
    res.status(201).json({
        payment_uuid,
        amount_paid: finalAmount,
    });
});

export default router;