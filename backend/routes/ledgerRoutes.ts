import { Router } from "express";
import db from "../db/initDB";

const router = Router();

router.get("/:student_uuid", (req, res) => {
    const { student_uuid } = req.params; 
    const sessionParam = req.query.session as string | undefined;

    const settings = db.prepare(`SELECT current_academic_session FROM school_settings LIMIT 1`).get() as { current_academic_session: string } | undefined;

    if(!settings && !sessionParam) {
        return res.status(400).json({ message: "Academic session not found" });
    }

    const academic_session = sessionParam ?? settings!.current_academic_session;

    const student = db.prepare(`SELECT uuid, name, class_standard, is_new_admission FROM students WHERE uuid = ?`)
                      .get(student_uuid) as {
                        uuid: string;
                        name: string;
                        class_standard: string;
                        is_new_admission: number;
                      } | undefined;

                if (!student) {
                    return res.status(404).json({ message: "Student not found" });
                }

    const fee = db.prepare
                (`SELECT 
                    COALESCE(registration_fee, 0) AS registration_fee,
                    COALESCE(renewal_fee, 0) AS renewal_fee,
                    COALESCE(basic_fee, 0) AS basic_fee,
                    COALESCE(exam_fee, 0) AS exam_fee
                    FROM fee_structure
                    WHERE class_standard = ?
                `)
                .get(student.class_standard) as {
                    registration_fee: number;
                    renewal_fee: number;
                    basic_fee: number;
                    exam_fee: number;
                } | undefined;

            if (!fee) {
                return res.status(404).json({ message: "Fee structure not found" });
            }

    const payments = db.prepare
                (`SELECT quarter_number, SUM(amount_paid) AS paid
                    FROM payments
                    WHERE student_uuid = ?
                      AND academic_session = ?
                    GROUP BY quarter_number`
                )
                .all(student_uuid, academic_session) as {
                    quarter_number: number;
                    paid: number;
                }[];

    const paidMap = new Map<number, number>();
    payments.forEach(p => paidMap.set(p.quarter_number, p.paid));

    const quarters = [];
    let totalExpected = 0;
    let totalPaid = 0;

    for (let q = 1; q <= 4; q++) {
        let expected = 0;

        if (student.is_new_admission === 1) {
            if (q === 1) expected = fee.registration_fee + fee.basic_fee;
            else if (q === 2 || q === 3) expected = fee.basic_fee + fee.exam_fee;
            else if (q === 4) expected = fee.basic_fee;
        } else {
            if (q === 1) expected = fee.renewal_fee + fee.basic_fee;
            else if (q === 2 || q === 3) expected = fee.basic_fee + fee.exam_fee;
            else if (q === 4) expected = fee.basic_fee;
        }

        const paid = paidMap.get(q) ?? 0;

        let status : "PAID" | "PARTIAL" | "DUE";
        if (paid === 0) status = "DUE";
        else if (paid >= expected) status = "PAID";
        else status = "PARTIAL";

        totalExpected += expected;
        totalPaid += paid;

        quarters.push({
            quarter: q,
            expected,
            paid,
            status,
        });
    }

    res.json({
        student: {
            uuid: student.uuid,
            name: student.name,
            class_standard: student.class_standard,
            is_new_admission: student.is_new_admission === 1,
        },
        academic_session,
        quarters,
        totals: {
            expected: totalExpected,
            paid: totalPaid,
            due: totalExpected - totalPaid,
        },
    });
});

export default router;