import Database from "better-sqlite3";
import path from "path";
import os from "os";

// Initialize DB connection (same as the actual backend server)
const dbPath = path.join(os.homedir(), "AppData", "Roaming", "FeeManagement", "school_records.db");
const db = new Database(dbPath);

console.log(`[Database Info] Connected to: ${dbPath}`);

// This is the EXACT query the dashboard route uses right now!
// It dynamically compares the student's '%m-%d' (month and day) exactly with 'now' (today's current date).
// It does NOT use any hardcoded dates (like 03-16).
const query = `
    SELECT name, class_standard, dob
    FROM students 
    WHERE deleted_at IS NULL 
    AND strftime('%m-%d', dob) = strftime('%m-%d', 'now', '+5 hours', '+30 minutes')
`;

try {
    const birthdaysToday = db.prepare(query).all() as { name: string; class_standard: string; dob: string }[];

    if (birthdaysToday.length > 0) {
        console.log(`\n🎉 SUCCESS! Found ${birthdaysToday.length} student(s) with a birthday TODAY (generic dynamic match):\n`);
        birthdaysToday.forEach((student) => {
            console.log(`  - 🎂 Happy Birthday to ${student.name} (Class ${student.class_standard})! -> DOB: ${student.dob}`);
        });
        console.log(`\nThese exact names are currently being sent to your Dashboard right now!`);
    } else {
        console.log("\nZero students have a birthday falling on today's generic calendar date. (The banner on the dashboard will hide itself gracefully).");
    }

} catch (e) {
    console.error("Error executing dynamic birthday match:", e);
}
