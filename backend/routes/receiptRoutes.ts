import { Router } from "express";
import db from "../db/initDB";

interface Payment {
    uuid: string;
    receipt_number: string;
    amount_paid: number;
    discount_amount: number;
    payment_mode: string;
    payment_date: string;
    quarter_number: number;
    academic_session: string;
    student_name: string;
    roll_number: string;
    class_standard: string;
    father_name: string;
    mother_name: string;
    father_contact: string;
    mother_contact: string;
}

const router = Router();

router.get("/:payment_uuid", (req, res) => {
    const { payment_uuid } = req.params;

    const payment = db.prepare(`
        SELECT
            p.uuid,
            p.receipt_number,
            p.amount_paid,
            p.discount_amount,
            p.payment_mode,
            p.payment_date,
            p.quarter_number,
            p.academic_session,

            s.name AS student_name,
            s.roll_number,
            s.class_standard,
            s.father_name,
            s.mother_name,
            s.father_contact,
            s.mother_contact
            
        FROM payments p
        JOIN students s ON s.uuid = p.student_uuid
        WHERE p.uuid = ?
    `).get(payment_uuid) as Payment | undefined;

    if(!payment) {
        return res.status(404).json({ message: "Receipt not found" });
    }

    const school = db.prepare(`
        SELECT 
            school_name,
            address,
            contact_number,
            email,
            current_academic_session,
            logo_path
        FROM school_settings
        LIMIT 1
    `).get();

    const fee = db.prepare(`
        SELECT
            registration_fee,
            renewal_fee,
            basic_fee,
            exam_fee
        FROM fee_structure
        WHERE class_standard = ?
    `).get(payment.class_standard);

    res.json({
        receipt: {
            receipt_number: payment.receipt_number,
            date: payment.payment_date,
            academic_session: payment.academic_session,
        },

        school,

        student: {
            name: payment.student_name,
            roll_number: payment.roll_number,
            class_standard: payment.class_standard,
            guardian: 
                payment.father_name ||
                payment.mother_name ||
                "N/A",
            guardian_contact:
                payment.father_contact ||
                payment.mother_contact ||
                "N/A",
        },

        fee,

        payment: {
            quarter_number: payment.quarter_number,
            amount_paid: payment.amount_paid,
            discount_amount: payment.discount_amount,
            payment_mode: payment.payment_mode,
        },
    });
});

export default router;