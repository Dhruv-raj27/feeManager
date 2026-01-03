import { Router } from "express";
import db from "../db/initDB";

const router = Router();

/* ---------------- Result Types ---------------- */

interface CountResult {
  count: number;
}

interface SumResult {
  total: number;
}

/* ---------------- Dashboard Summary ---------------- */

router.get("/summary", (_req, res) => {
  try {
    /* Total Students */
    const totalStudents =
      (
        db
          .prepare("SELECT COUNT(*) AS count FROM students")
          .get() as CountResult
      )?.count ?? 0;

    /* Total Transactions */
    const totalTransactions =
      (
        db
          .prepare("SELECT COUNT(*) AS count FROM payments")
          .get() as CountResult
      )?.count ?? 0;

    /* Today's Collection */
    const todayCollection =
      (
        db
          .prepare(`
            SELECT COALESCE(SUM(amount_paid), 0) AS total
            FROM payments
            WHERE DATE(payment_date) = DATE('now')
          `)
          .get() as SumResult
      )?.total ?? 0;

    /* Monthly Collection */
    const monthlyCollection =
      (
        db
          .prepare(`
            SELECT COALESCE(SUM(amount_paid), 0) AS total
            FROM payments
            WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')
          `)
          .get() as SumResult
      )?.total ?? 0;

    /* Recent Transactions */
    const recentTransactions = db
      .prepare(`
        SELECT
          receipt_number,
          class_at_time_of_payment,
          amount_paid,
          payment_date,
          students.name AS student_name
        FROM payments
        JOIN students ON students.uuid = payments.student_uuid
        ORDER BY payment_date DESC
        LIMIT 5
      `)
      .all();

    res.json({
      totalStudents,
      todayCollection,
      monthlyCollection,
      totalTransactions,
      recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

export default router;
