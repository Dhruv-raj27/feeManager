import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/initDB";
import { PAYMENT_MODES } from "../constants";

const router = Router();

/* ================= CREATE PAYMENT ================= */
router.post("/", (req, res) => {
  const {
    student_uuid,
    quarter_number,
    payment_mode,
    discount_amount = 0,
    discount_reason = null,
    reference_number = null,
    instrument_number = null,
    bank_name = null,
  } = req.body;

  /* ---- VALIDATION ---- */
  if (!student_uuid || !payment_mode || typeof quarter_number !== "number") {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (![1, 2, 3, 4].includes(quarter_number)) {
    return res.status(400).json({ message: "Invalid quarter number (must be 1-4)" });
  }

  // Validate payment mode
  if (!PAYMENT_MODES.includes(payment_mode as any)) {
    return res.status(400).json({
      message: `Invalid payment mode. Allowed: ${PAYMENT_MODES.join(", ")}`,
    });
  }

  // Validate discount is non-negative
  if (typeof discount_amount !== "number" || discount_amount < 0) {
    return res.status(400).json({ message: "Discount amount must be 0 or positive" });
  }

  /* ---- FETCH CURRENT ACADEMIC SESSION ---- */
  const settings = db
    .prepare(`SELECT current_academic_session FROM school_settings WHERE id = 1`)
    .get() as { current_academic_session: string } | undefined;

  if (!settings || !settings.current_academic_session) {
    return res.status(500).json({
      message: "Current academic session not configured in settings",
    });
  }

  const academic_session = settings.current_academic_session;

  /* ---- CHECK FOR DUPLICATE PAYMENT ---- */
  const existingPayment = db.prepare(`
    SELECT uuid FROM payments
    WHERE student_uuid = ? AND quarter_number = ? AND academic_session = ?
  `).get(student_uuid, quarter_number, academic_session);

  if (existingPayment) {
    return res.status(409).json({
      message: `Payment for Quarter ${quarter_number} in session ${academic_session} already exists for this student`,
    });
  }

  /* ---- FETCH STUDENT ---- */
  const student = db
    .prepare(
      `SELECT uuid, class_standard, is_new_admission
       FROM students WHERE uuid = ?`
    )
    .get(student_uuid) as { uuid: string; class_standard: string; is_new_admission: number } | undefined;

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  /* ---- FETCH FEE STRUCTURE ---- */
  const fee = db
    .prepare(
      `SELECT
        COALESCE(registration_fee, 0) AS registration_fee,
        COALESCE(renewal_fee, 0)      AS renewal_fee,
        COALESCE(basic_fee, 0)        AS basic_fee,
        COALESCE(exam_fee, 0)         AS exam_fee
       FROM fee_structure
       WHERE class_standard = ?`
    )
    .get(student.class_standard) as { registration_fee: number; renewal_fee: number; basic_fee: number; exam_fee: number } | undefined;

  if (!fee) {
    return res.status(404).json({
      message: `Fee structure not found for class "${student.class_standard}"`,
    });
  }

  /* ---- CALCULATE AMOUNT ---- */
  let amount = 0;

  if (student.is_new_admission === 1) {
    if (quarter_number === 1) {
      amount = fee.registration_fee + fee.basic_fee;
    } else if (quarter_number === 2 || quarter_number === 3) {
      amount = fee.basic_fee + fee.exam_fee;
    } else {
      amount = fee.basic_fee;
    }
  } else {
    if (quarter_number === 1) {
      amount = fee.renewal_fee + fee.basic_fee;
    } else if (quarter_number === 2 || quarter_number === 3) {
      amount = fee.basic_fee + fee.exam_fee;
    } else {
      amount = fee.basic_fee;
    }
  }

  if (amount <= 0) {
    return res.status(400).json({
      message: "Calculated amount is invalid. Check fee structure.",
    });
  }

  // Cap discount at fee amount
  const safeDiscount = Math.min(Math.max(discount_amount, 0), amount);
  const finalAmount = amount - safeDiscount;
  const payment_uuid = uuidv4();

  // Get current IST timestamp
  const istDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const payment_date = new Date(istDate).toISOString();

  /* ---- INSERT PAYMENT ---- */
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
      academic_session,
      payment_date,
      reference_number,
      instrument_number,
      bank_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payment_uuid,
    student_uuid,
    finalAmount,
    safeDiscount,
    discount_reason,
    payment_mode,
    quarter_number,
    student.class_standard,
    academic_session,
    payment_date,
    reference_number,
    instrument_number,
    bank_name
  );

  /* ---- AUTO PROMOTE AFTER Q4 ---- */
  if (quarter_number === 4) {
    db.prepare(
      `UPDATE students SET is_new_admission = 0 WHERE uuid = ?`
    ).run(student_uuid);
  }

  res.status(201).json({
    payment_uuid,
    amount_paid: finalAmount,
  });
});

/* ================= GET PAYMENTS ================= */
router.get("/", (_req, res) => {
  const payments = db.prepare(`
    SELECT
      p.uuid,
      p.amount_paid,
      p.quarter_number,
      p.academic_session,
      p.payment_mode,
      p.payment_date,
      p.class_at_time_of_payment,
      p.reference_number,
      p.instrument_number,
      p.bank_name,
      s.name AS student_name
    FROM payments p
    JOIN students s ON s.uuid = p.student_uuid
    ORDER BY p.payment_date DESC
  `).all();

  res.json(payments);
});

/* ---------------- DELETE PAYMENT ---------------- */
router.delete("/:uuid", (req, res) => {
  const { uuid } = req.params;

  const result = db.prepare(`
    DELETE FROM payments WHERE uuid = ?
  `).run(uuid);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Payment not found" });
  }

  res.json({ message: "Payment deleted successfully" });
});

export default router;