import { useEffect, useState } from "react";
import {
  fetchStudents,
  deleteStudent,
  updateStudent,
  addStudent,
  type Student,
} from "../services/studentService";
import { useAuth } from "../auth/AuthContext";
import EditStudentModal from "../components/EditStudentModal";
import AddStudentModal from "../components/AddStudentModal";
import toast from "react-hot-toast";
import { LoadingSpinner, EmptyState } from "../components/ui/FeedbackStates";
import { CLASS_STANDARDS } from "../constants";

const Students = () => {
  const { token } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [editing, setEditing] = useState<Student | null>(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const loadStudents = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchStudents(token);
      setStudents(data);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

const handleDelete = async (uuid: string) => {
    if (!token) return;
    if (!window.confirm("Delete this student?")) return;

    try {
      await deleteStudent(uuid, token);
      toast.success("Student deleted successfully");
      loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete student");
    }
  };

    const handleUpdate = async (data: Partial<Student>) => {
    if (!token || !editing) return;

    const cleaned = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
    );
    try {
      await updateStudent(editing.uuid, cleaned, token);
      toast.success("Student updated successfully");
      setEditing(null);
      loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update student");
    }
    };


  const handleAdd = async (data: Omit<Student, "uuid">) => {
    if (!token) return;
    try {
      await addStudent(data, token);
      toast.success("Student added successfully");
      setAdding(false);
      loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to add student");
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class_standard?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.father_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.father_contact?.includes(searchQuery) ||
      s.mother_contact?.includes(searchQuery);
    
    const matchesClass = classFilter ? s.class_standard === classFilter : true;
    
    return matchesSearch && matchesClass;
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Directory</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by name, roll, parent or contact..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '300px' }}
          />
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{ minWidth: "150px", width: "auto" }}
          >
            <option value="">All Classes</option>
            {CLASS_STANDARDS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary">
          ➕ Add Student
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading students..." />
      ) : students.length === 0 ? (
        <EmptyState 
          icon="🎓"
          title="No Students Yet"
          message="Click the 'Add Student' button to enroll your first student."
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState 
          icon="🔍"
          title="No matches found"
          message={`No students found matching "${searchQuery}"`}
        />
      ) : (
        <table>
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
            {filteredStudents.map((s) => (
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
      )}

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