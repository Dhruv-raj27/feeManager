import Database from "better-sqlite3";
import path from "path";
import os from "os";
import fs from "fs";

// Cross-platform app data directory
const appDataPath =
  process.env.APPDATA || // Windows
  (process.platform === "darwin"
    ? path.join(os.homedir(), "Library/Application Support")
    : path.join(os.homedir(), ".config"));

const dbPath = path.join(appDataPath, "FeeManagement", "school_records.db");

// Ensure folder exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

export const initDB = () => {
  db.pragma("foreign_keys = ON");

  /* ================= STUDENTS ================= */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      roll_number TEXT NOT NULL UNIQUE,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      class_standard TEXT NOT NULL,
      admission_session TEXT NOT NULL,
      is_new_admission INTEGER DEFAULT 1,
      father_name TEXT,
      father_contact TEXT,
      mother_name TEXT,
      mother_contact TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  /* ================= FEE STRUCTURE ================= */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS fee_structure (
      class_standard TEXT PRIMARY KEY,
      registration_fee REAL DEFAULT 0,
      basic_fee REAL DEFAULT 0,
      exam_fee REAL DEFAULT 0,
      renewal_fee REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  /* ================= PAYMENTS ================= */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS payments (
      uuid TEXT PRIMARY KEY,
      external_payment_id TEXT,
      student_uuid TEXT NOT NULL,
      amount_paid REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      discount_reason TEXT,
      payment_mode TEXT NOT NULL,
      quarter_number INTEGER NOT NULL,
      class_at_time_of_payment TEXT NOT NULL,
      academic_session TEXT NOT NULL,
      receipt_number TEXT UNIQUE,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_uuid) REFERENCES students(uuid)
    )
  `).run();

  /* ================= SCHOOL SETTINGS ================= */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS school_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      school_name TEXT NOT NULL,
      address TEXT,
      contact_number TEXT,
      email TEXT,
      logo_path TEXT,
      current_academic_session TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  /* ================= USER ROLES ================= */
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_roles (
      uuid TEXT PRIMARY KEY,
      full_name TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      must_change_password INTEGER DEFAULT 0,
      current_academic_session TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  /* ================= MIGRATION: school_settings ================= */
  const schoolColumns = db.prepare(
    `PRAGMA table_info(school_settings)`
  ).all();

  const hasAcademicSession = schoolColumns.some(
    (col: any) => col.name === "current_academic_session"
  );

  if (!hasAcademicSession) {
    db.prepare(`
      ALTER TABLE school_settings
      ADD COLUMN current_academic_session TEXT
    `).run();

    console.log("✅ Migrated: added current_academic_session to school_settings");
  }

  /* ================= MIGRATION: user_roles.must_change_password ================= */
  const userColumns = db.prepare(
    `PRAGMA table_info(user_roles)`
  ).all();

  const hasMustChangePassword = userColumns.some(
    (col: any) => col.name === "must_change_password"
  );

  if (!hasMustChangePassword) {
    db.prepare(`
      ALTER TABLE user_roles
      ADD COLUMN must_change_password INTEGER DEFAULT 0
    `).run();

    console.log("✅ Migrated: added must_change_password to user_roles");
  }

  /* ================= MIGRATION: payments reference columns ================= */
  const paymentColumns = db.prepare(`PRAGMA table_info(payments)`).all();

  const hasReferenceNumber = paymentColumns.some((col: any) => col.name === "reference_number");
  if (!hasReferenceNumber) {
    db.prepare(`ALTER TABLE payments ADD COLUMN reference_number TEXT`).run();
    db.prepare(`ALTER TABLE payments ADD COLUMN instrument_number TEXT`).run();
    db.prepare(`ALTER TABLE payments ADD COLUMN bank_name TEXT`).run();
    console.log("✅ Migrated: added reference_number, instrument_number, bank_name to payments");
  }

  /* ================= MIGRATION: students soft-delete ================= */
  const studentColumns = db.prepare(`PRAGMA table_info(students)`).all();
  const hasDeletedAt = studentColumns.some((col: any) => col.name === "deleted_at");
  if (!hasDeletedAt) {
    db.prepare(`ALTER TABLE students ADD COLUMN deleted_at DATETIME DEFAULT NULL`).run();
    console.log("✅ Migrated: added deleted_at to students (soft-delete)");
  }

  /* ================= MIGRATION: payments is_new_admission snapshot ================= */
  const hasAdmissionSnapshot = paymentColumns.some((col: any) => col.name === "is_new_admission_at_payment");
  if (!hasAdmissionSnapshot) {
    db.prepare(`ALTER TABLE payments ADD COLUMN is_new_admission_at_payment INTEGER DEFAULT NULL`).run();
    console.log("✅ Migrated: added is_new_admission_at_payment to payments");
  }

  /* ================= MIGRATION: school_settings receipt_number_seq ================= */
  const settingsColumns = db.prepare(`PRAGMA table_info(school_settings)`).all();
  const hasReceiptSeq = settingsColumns.some((col: any) => col.name === "receipt_number_seq");
  if (!hasReceiptSeq) {
    db.prepare(`ALTER TABLE school_settings ADD COLUMN receipt_number_seq INTEGER DEFAULT 0`).run();
    console.log("✅ Migrated: added receipt_number_seq to school_settings");
  }

  /* ================= DEFAULT SCHOOL ROW ================= */
  db.prepare(`
    INSERT OR IGNORE INTO school_settings (
      id, school_name, current_academic_session
    ) VALUES (1, 'My School', '2025-2026')
  `).run();

  console.log("✅ Database initialized at:", dbPath);
};

export default db;