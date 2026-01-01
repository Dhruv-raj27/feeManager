import Database from "better-sqlite3";
import path from "path";
import os from "os";

// Cross-platform app data directory
const appDataPath =
  process.env.APPDATA ||               // Windows
  (process.platform === "darwin"
    ? path.join(os.homedir(), "Library/Application Support")
    : path.join(os.homedir(), ".config"));

const dbPath = path.join(appDataPath, "FeeManagement", "school_records.db");

// Ensure folder exists
import fs from "fs";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

export const initDB = () => {
  db.pragma("foreign_keys = ON");

  db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      roll_number TEXT NOT NULL UNIQUE,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      class_standard TEXT NOT NULL,
      is_new_admission INTEGER DEFAULT 1,
      father_name TEXT,
      father_contact TEXT,
      mother_name TEXT,
      mother_contact TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

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

  db.prepare(`
    CREATE TABLE IF NOT EXISTS school_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      school_name TEXT NOT NULL,
      address TEXT,
      contact_number TEXT,
      email TEXT,
      logo_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_roles (
      uuid TEXT PRIMARY KEY,
      full_name TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log("Database initialized at:", dbPath);
};

export default db;
