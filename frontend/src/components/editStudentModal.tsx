import { useState } from "react";
import { type Student } from "../services/studentService";
import {
  CLASS_STANDARDS,
  GENDERS,
  NAME_REGEX,
  PHONE_REGEX,
  isValidSession,
} from "../constants";

interface Props {
  student: Student;
  onSave: (data: Partial<Student>) => void;
  onClose: () => void;
}

const EditStudentModal = ({ student, onSave, onClose }: Props) => {
  const [form, setForm] = useState<Student>(student);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!form.name?.trim()) {
      errs.name = "Name is required";
    } else if (!NAME_REGEX.test(form.name.trim())) {
      errs.name = "Name must contain only letters, spaces, dots, or hyphens";
    }

    if (!form.roll_number?.trim()) {
      errs.roll_number = "Roll number is required";
    } else if (!/^\d+$/.test(form.roll_number.trim())) {
      errs.roll_number = "Roll number must be a number";
    }

    if (!form.dob) {
      errs.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(form.dob);
      const today = new Date();
      if (dobDate > today) errs.dob = "DOB cannot be in the future";
    }

    if (!form.gender) errs.gender = "Gender is required";
    if (!form.class_standard) errs.class_standard = "Class is required";

    if (!form.admission_session?.trim()) {
      errs.admission_session = "Admission session is required";
    } else if (!isValidSession(form.admission_session.trim())) {
      errs.admission_session = "Must be YYYY-YYYY format (e.g. 2025-2026)";
    }

    if (form.father_contact?.trim() && !PHONE_REGEX.test(form.father_contact.trim())) {
      errs.father_contact = "Enter a valid 10-digit mobile number";
    }
    if (form.father_name?.trim() && !NAME_REGEX.test(form.father_name.trim())) {
      errs.father_name = "Invalid name format";
    }
    if (form.mother_contact?.trim() && !PHONE_REGEX.test(form.mother_contact.trim())) {
      errs.mother_contact = "Enter a valid 10-digit mobile number";
    }
    if (form.mother_name?.trim() && !NAME_REGEX.test(form.mother_name.trim())) {
      errs.mother_name = "Invalid name format";
    }

    return errs;
  };

  const handleSave = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSave(form);
  };

  const fieldStyle = { width: "100%", marginBottom: 4, padding: "8px", boxSizing: "border-box" as const };
  const errorStyle = { color: "#e74c3c", fontSize: 12, marginBottom: 8, display: "block" };

  return (
    <div style={modalStyle}>
      <h3>Edit Student</h3>

      <input value={form.name} placeholder="Name *" style={fieldStyle}
        onChange={e => setForm({ ...form, name: e.target.value })} />
      {errors.name && <span style={errorStyle}>{errors.name}</span>}

      <input value={form.roll_number} placeholder="Roll Number *" style={fieldStyle}
        onChange={e => setForm({ ...form, roll_number: e.target.value })} />
      {errors.roll_number && <span style={errorStyle}>{errors.roll_number}</span>}

      <label style={{ fontSize: 12, color: "#999" }}>Date of Birth *</label>
      <input type="date" value={form.dob?.slice(0, 10) || ""} style={fieldStyle}
        max={new Date().toISOString().split("T")[0]}
        onChange={e => setForm({ ...form, dob: e.target.value })} />
      {errors.dob && <span style={errorStyle}>{errors.dob}</span>}

      <select value={form.gender} style={fieldStyle}
        onChange={e => setForm({ ...form, gender: e.target.value })}>
        <option value="">Select Gender *</option>
        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      {errors.gender && <span style={errorStyle}>{errors.gender}</span>}

      <select value={form.class_standard} style={fieldStyle}
        onChange={e => setForm({ ...form, class_standard: e.target.value })}>
        <option value="">Select Class *</option>
        {CLASS_STANDARDS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {errors.class_standard && <span style={errorStyle}>{errors.class_standard}</span>}

      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0", cursor: "pointer" }}>
        <input type="checkbox"
          style={{ width: "auto", margin: 0 }}
          checked={form.is_new_admission === 1}
          onChange={e => setForm({ ...form, is_new_admission: e.target.checked ? 1 : 0 })}
        />
        New Admission
      </label>

      <input placeholder="Admission Session *" value={form.admission_session} style={fieldStyle}
        onChange={e => setForm({ ...form, admission_session: e.target.value })} />
      {errors.admission_session && <span style={errorStyle}>{errors.admission_session}</span>}

      <input value={form.father_name || ""} placeholder="Father's Name" style={fieldStyle}
        onChange={e => setForm({ ...form, father_name: e.target.value })} />
      {errors.father_name && <span style={errorStyle}>{errors.father_name}</span>}

      <input value={form.father_contact || ""} placeholder="Father's Contact (10 digits)" style={fieldStyle}
        maxLength={10}
        onChange={e => setForm({ ...form, father_contact: e.target.value })} />
      {errors.father_contact && <span style={errorStyle}>{errors.father_contact}</span>}

      <input value={form.mother_name || ""} placeholder="Mother's Name" style={fieldStyle}
        onChange={e => setForm({ ...form, mother_name: e.target.value })} />
      {errors.mother_name && <span style={errorStyle}>{errors.mother_name}</span>}

      <input value={form.mother_contact || ""} placeholder="Mother's Contact (10 digits)" style={fieldStyle}
        maxLength={10}
        onChange={e => setForm({ ...form, mother_contact: e.target.value })} />
      {errors.mother_contact && <span style={errorStyle}>{errors.mother_contact}</span>}

      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </div>
  );
};

const modalStyle = {
  position: "fixed" as const,
  top: "10%",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#222",
  padding: 20,
  borderRadius: 8,
  width: 420,
  maxHeight: "80vh",
  overflowY: "auto" as const,
};

export default EditStudentModal;

