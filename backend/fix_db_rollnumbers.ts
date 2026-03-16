import Database from "better-sqlite3";
import path from "path";
import os from "os";

const appDataPath = process.env.APPDATA || (process.platform === "darwin" ? path.join(os.homedir(), "Library/Application Support") : path.join(os.homedir(), ".config"));
const dbPath = path.join(appDataPath, "FeeManagement", "school_records.db");
const db = new Database(dbPath);

console.log("Connected to", dbPath);

// Find soft-deleted students that do not have their uuid appended to the roll_number
const orphaned = db.prepare(`SELECT * FROM students WHERE deleted_at IS NOT NULL AND roll_number NOT LIKE '%-deleted-%'`).all() as any[];

console.log(`Found ${orphaned.length} soft-deleted students with orphaned roll numbers.`);

if (orphaned.length > 0) {
  const stmt = db.prepare(`UPDATE students SET roll_number = roll_number || '-deleted-' || uuid WHERE uuid = ?`);
  const transaction = db.transaction((deletedStudents: any[]) => {
    for (const student of deletedStudents) {
      stmt.run(student.uuid);
    }
  });

  transaction(orphaned);
  console.log("Successfully freed up orphaned roll numbers!");
} else {
  console.log("No DB cleanup required.");
}

db.close();
