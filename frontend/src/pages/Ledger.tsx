import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchStudents, type Student } from "../services/studentService";
import { fetchStudentLedger } from "../services/ledgerService";

/* ---------------- Types ---------------- */

interface LedgerQuarter {
  quarter: number;
  expected: number;
  paid: number;
  status: "PAID" | "PARTIAL" | "DUE";
}

interface LedgerResponse {
  student?: {
    uuid: string;
    name: string;
    class_standard: string;
  };
  academic_session?: string;
  quarters?: LedgerQuarter[];
  totals?: {
    expected: number;
    paid: number;
    due: number;
  };
}

/* ---------------- Component ---------------- */

const Ledger = () => {
  const { token } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [studentUUID, setStudentUUID] = useState("");
  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Load students */
  useEffect(() => {
    if (!token) return;
    fetchStudents(token).then(setStudents);
  }, [token]);

  /* Load ledger */
  const loadLedger = async () => {
    if (!token || !studentUUID) return;

    setLoading(true);
    setError("");
    setLedger(null);

    try {
      const data = await fetchStudentLedger(studentUUID, token);
      setLedger(data);
    } catch (err: any) {
      setError(err.message || "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Ledger</h2>

      {/* Student Selector */}
      <select
        value={studentUUID}
        onChange={(e) => setStudentUUID(e.target.value)}
      >
        <option value="">Select Student</option>
        {students.map((s) => (
          <option key={s.uuid} value={s.uuid}>
            {s.name} (Class {s.class_standard})
          </option>
        ))}
      </select>

      <button
        onClick={loadLedger}
        disabled={!studentUUID || loading}
        style={{ marginLeft: 10 }}
      >
        View Ledger
      </button>

      {loading && <p>Loading ledger…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ---------- Ledger View ---------- */}
      {ledger?.student && ledger?.quarters && ledger?.totals && (
        <>
          <h3 style={{ marginTop: 20 }}>
            {ledger.student.name} — Class {ledger.student.class_standard}
          </h3>

          <p>Academic Session: {ledger.academic_session ?? "—"}</p>

          <table style={{ width: "100%", marginTop: 15 }}>
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Expected</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.quarters.map((q) => (
                <tr key={q.quarter}>
                  <td>Q{q.quarter}</td>
                  <td>₹{q.expected}</td>
                  <td>₹{q.paid}</td>
                  <td>₹{q.expected - q.paid}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontWeight: 600,
                        background:
                          q.status === "PAID"
                            ? "#2ecc71"
                            : q.status === "PARTIAL"
                            ? "#f39c12"
                            : "#e74c3c",
                        color: "#000",
                      }}
                    >
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20 }}>
            <strong>Total Expected:</strong> ₹{ledger.totals.expected}
            <br />
            <strong>Total Paid:</strong> ₹{ledger.totals.paid}
            <br />
            <strong>Total Due:</strong> ₹{ledger.totals.due}
          </div>
        </>
      )}
    </div>
  );
};

export default Ledger;
