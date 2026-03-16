import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchStudents, type Student } from "../services/studentService";
import { fetchStudentLedger } from "../services/ledgerService";
import StudentSelector from "../components/StudentSelector";

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
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Ledger</h2>

      {/* Student Selector */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <StudentSelector 
          students={students} 
          selectedUUID={studentUUID} 
          onSelect={key => {
            setStudentUUID(key);
            // Optional: Auto-load ledger when clicking a student
            // For now, retaining the distinct 'View Ledger' button interaction
          }} 
        />

        <button
          className="btn-primary"
          onClick={loadLedger}
          disabled={!studentUUID || loading}
          style={{ padding: "10px 20px" }}
        >
          View Ledger
        </button>
      </div>

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
                <th className="numeric">Expected</th>
                <th className="numeric">Paid</th>
                <th className="numeric">Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ledger.quarters.map((q) => (
                <tr key={q.quarter}>
                  <td>Q{q.quarter}</td>
                  <td className="numeric">₹{q.expected}</td>
                  <td className="numeric">₹{q.paid}</td>
                  <td className="numeric">₹{q.expected - q.paid}</td>
                  <td>
                    <span
                      className={`badge ${
                        q.status === 'PAID' ? 'badge-success' :
                        q.status === 'PARTIAL' ? 'badge-warning' :
                        'badge-danger'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="card" style={{ marginTop: 20 }}>
            <strong>Total Expected:</strong> <span className="numeric">₹{ledger.totals.expected}</span>
            <br />
            <strong>Total Paid:</strong> <span className="numeric">₹{ledger.totals.paid}</span>
            <br />
            <strong>Total Due:</strong> <span className="numeric">₹{ledger.totals.due}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Ledger;
