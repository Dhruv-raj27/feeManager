import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/initDB";

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

  if (!name || !roll_number || !dob || !gender || !class_standard || !admission_session) {
    return res.status(400).json({ message: "Missing required fields" });
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
    ORDER BY created_at DESC
  `).all();

  res.json(students);
});

/* ---------------- GET SINGLE STUDENT ---------------- */
router.get("/:uuid", (req, res) => {
  const student = db
    .prepare(`SELECT * FROM students WHERE uuid = ?`)
    .get(req.params.uuid);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

router.put("/:uuid", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM students WHERE uuid = ?")
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



/* ---------------- DELETE STUDENT ---------------- */
// DELETE student by UUID
router.delete("/:uuid", (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    return res.status(400).json({ message: "Student UUID required" });
  }

  const result = db
    .prepare("DELETE FROM students WHERE uuid = ?")
    .run(uuid);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json({ message: "Student deleted successfully" });
});


export default router;