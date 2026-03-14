import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/initDB";
import {
  CLASS_STANDARDS,
  GENDERS,
  NAME_REGEX,
  PHONE_REGEX,
  isValidSession,
} from "../constants";

interface Student {
  uuid: string;
  name: string;
  roll_number: string;
  dob: string;
  gender: string;
  class_standard: string;
  admission_session: string;
  father_name?: string;
  father_contact?: string;
  mother_name?: string;
  mother_contact?: string;
  is_new_admission?: number;
  created_at?: string;
  updated_at?: string;
}

const router = Router();

/* ---------------- CREATE STUDENT ---------------- */
router.post("/", (req, res) => {
  const {
    name,
    roll_number,
    dob,
    gender,
    class_standard,
    admission_session,
    father_name,
    father_contact,
    mother_name,
    mother_contact,
    is_new_admission = 1,
  } = req.body ?? {};

  // Required field presence check
  if (!name || !roll_number || !dob || !gender || !class_standard || !admission_session) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Name validation
  if (typeof name !== "string" || !NAME_REGEX.test(name.trim())) {
    return res.status(400).json({ message: "Invalid name format" });
  }

  // Roll number: must be numeric
  if (!/^\d+$/.test(String(roll_number).trim())) {
    return res.status(400).json({ message: "Roll number must be numeric" });
  }

  // Class validation
  if (!CLASS_STANDARDS.includes(class_standard as any)) {
    return res.status(400).json({
      message: `Invalid class. Allowed: ${CLASS_STANDARDS.join(", ")}`,
    });
  }

  // Gender validation
  if (!GENDERS.includes(gender as any)) {
    return res.status(400).json({
      message: `Invalid gender. Allowed: ${GENDERS.join(", ")}`,
    });
  }

  // Admission session validation
  if (!isValidSession(admission_session)) {
    return res.status(400).json({
      message: "Admission session must be YYYY-YYYY format (e.g. 2025-2026)",
    });
  }

  // Optional phone validation
  if (father_contact && !PHONE_REGEX.test(father_contact.trim())) {
    return res.status(400).json({ message: "Invalid father's contact number" });
  }
  if (mother_contact && !PHONE_REGEX.test(mother_contact.trim())) {
    return res.status(400).json({ message: "Invalid mother's contact number" });
  }

  // Check for duplicate roll number in same class (excluding soft-deleted)
  const existingRoll = db.prepare(
    `SELECT uuid FROM students WHERE roll_number = ? AND class_standard = ? AND deleted_at IS NULL`
  ).get(String(roll_number).trim(), class_standard);

  if (existingRoll) {
    return res.status(409).json({
      message: `Roll number ${roll_number} already exists in class ${class_standard}`,
    });
  }

  const uuid = uuidv4();

  db.prepare(`
    INSERT INTO students (
      uuid, name, roll_number, dob, gender, class_standard, admission_session,
      father_name, father_contact, mother_name, mother_contact,
      is_new_admission
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuid,
    name,
    roll_number,
    dob,
    gender,
    class_standard,
    admission_session,
    father_name,
    father_contact,
    mother_name,
    mother_contact,
    is_new_admission
  );

  res.status(201).json({ uuid });
});

/* ---------------- GET ALL STUDENTS ---------------- */
router.get("/", (_req, res) => {
  const students = db.prepare(`
    SELECT
      uuid,
      name,
      roll_number,
      class_standard,
      admission_session,
      is_new_admission,
      father_name,
      father_contact,
      created_at
    FROM students
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `).all();

  res.json(students);
});

/* ---------------- GET SINGLE STUDENT ---------------- */
router.get("/:uuid", (req, res) => {
  const student = db
    .prepare(`SELECT * FROM students WHERE uuid = ? AND deleted_at IS NULL`)
    .get(req.params.uuid);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

router.put("/:uuid", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM students WHERE uuid = ? AND deleted_at IS NULL")
    .get(req.params.uuid) as Student | undefined;

  if (!existing) {
    return res.status(404).json({ message: "Student not found" });
  }

  try {
    db.prepare(`
      UPDATE students SET
        name = ?,
        roll_number = ?,
        dob = ?,
        gender = ?,
        class_standard = ?,
        admission_session = ?,
        father_name = ?,
        father_contact = ?,
        mother_name = ?,
        mother_contact = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE uuid = ?
    `).run(
      req.body.name ?? existing.name,
      req.body.roll_number ?? existing.roll_number,
      req.body.dob ?? existing.dob,
      req.body.gender ?? existing.gender,
      req.body.class_standard ?? existing.class_standard,
      req.body.admission_session ?? existing.admission_session,
      req.body.father_name ?? existing.father_name,
      req.body.father_contact ?? existing.father_contact,
      req.body.mother_name ?? existing.mother_name,
      req.body.mother_contact ?? existing.mother_contact,
      req.params.uuid
    );

    res.json({ success: true });
  } catch (err: any) {
    console.error("UPDATE ERROR:", err.message);
    res.status(400).json({ message: err.message });
  }
});



/* ---------------- DELETE STUDENT (soft-delete) ---------------- */
router.delete("/:uuid", (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ message: "Student UUID required" });
  }

  // Soft-delete: set deleted_at timestamp so payment history is preserved
  const result = db
    .prepare("UPDATE students SET deleted_at = CURRENT_TIMESTAMP WHERE uuid = ? AND deleted_at IS NULL")
    .run(uuid);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Student not found or already deleted" });
  }

  res.json({ message: "Student deleted successfully" });
});


export default router;