import { useEffect, useState } from "react";
import {
  fetchStudents,
  deleteStudent,
  updateStudent,
  addStudent,
  type Student,
} from "../services/studentService";
import { useAuth } from "../auth/AuthContext";
import EditStudentModal from "../components/editStudentModal";
import AddStudentModal from "../components/AddStudentModal";

const Students = () => {
  const { token } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [editing, setEditing] = useState<Student | null>(null);
  const [adding, setAdding] = useState(false);

  const loadStudents = async () => {
    if (!token) return;
    const data = await fetchStudents(token);
    setStudents(data);
  };

useEffect(() => {
  loadStudents();
}, [token]);

const handleDelete = async (uuid: string) => {
    if (!token) return;
    if (!confirm("Delete this student?")) return;

    await deleteStudent(uuid, token);
    loadStudents();
  };

    const handleUpdate = async (data: Partial<Student>) => {
    if (!token || !editing) return;

    const cleaned = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
    );

    await updateStudent(editing.uuid, cleaned, token);
    setEditing(null);
    loadStudents();
    };


  const handleAdd = async (data: any) => {
    if (!token) return;

    await addStudent(data, token);
    setAdding(false);
    loadStudents();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Directory</h2>

      {/* ➕ Add Student */}
      <button onClick={() => setAdding(true)}>➕ Add Student</button>

      <table style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll</th>
            <th>Class</th>
            <th>Guardian</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.uuid}>
              <td>{s.name}</td>
              <td>{s.roll_number}</td>
              <td>{s.class_standard}</td>
              <td>{s.father_name}</td>
              <td>{s.father_contact}</td>
              <td>
                <button onClick={() => setEditing(s)}>Edit</button>
                <button onClick={() => handleDelete(s.uuid)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      {editing && (
        <EditStudentModal
          student={editing}
          onSave={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}

      {adding && (
        <AddStudentModal
          onSave={handleAdd}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
};

export default Students;