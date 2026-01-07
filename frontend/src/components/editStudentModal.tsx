import { useState } from "react";
import { type Student } from "../services/studentService";

interface Props {
  student: Student;
  onSave: (data: Partial<Student>) => void;
  onClose: () => void;
}

const EditStudentModal = ({ student, onSave, onClose }: Props) => {
  const [form, setForm] = useState<Student>(student);

  return (
    <div style={modalStyle}>
      <h3>Edit Student</h3>

      <input value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        placeholder="Name" />

      <input value={form.roll_number}
        onChange={e => setForm({ ...form, roll_number: e.target.value })}
        placeholder="Roll Number" />
        
        <input
        type="date"
        value={form.dob?.slice(0, 10) || ""}
        onChange={(e) => setForm({ ...form, dob: e.target.value })}
        />

        <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        </select>

      <input value={form.class_standard}
        onChange={e => setForm({ ...form, class_standard: e.target.value })}
        placeholder="Class Standard" />

      <label>
        <input
          type="checkbox"
          checked={form.is_new_admission === 1}
          onChange={e =>
            setForm({ ...form, is_new_admission: e.target.checked ? 1 : 0 })
          }
        />
        New Admission
      </label>

      <input
        placeholder="Admission Session"
        value={form.admission_session}
        onChange={e =>
          setForm({ ...form, admission_session: e.target.value })
        }
      />      

      <input value={form.father_name || ""}
        onChange={e => setForm({ ...form, father_name: e.target.value })}
        placeholder="Father's Name" />

      <input value={form.father_contact || ""}
        onChange={e => setForm({ ...form, father_contact: e.target.value })}
        placeholder="Father's Contact" />

      <br />
      <button onClick={() => onSave(form)}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

const modalStyle = {
  position: "fixed" as const,
  top: "20%",
  left: "35%",
  background: "#222",
  padding: 20,
  borderRadius: 8,
};

export default EditStudentModal;
