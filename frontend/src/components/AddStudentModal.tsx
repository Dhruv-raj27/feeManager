import { useState } from "react";
import {
  CLASS_STANDARDS,
  GENDERS,
  NAME_REGEX,
  PHONE_REGEX,
  isValidSession,
} from "../constants";
import { type Student } from "../services/studentService";

interface Props {
  onSave: (data: Omit<Student, "uuid">) => void;
  onClose: () => void;
}

const AddStudentModal = ({ onSave, onClose }: Props) => {
  const currentYear = new Date().getFullYear();
  const defaultSession = `${currentYear}-${currentYear + 1}`;

  const [form, setForm] = useState({
    name: "",
    roll_number: "",
    dob: "",
    gender: "",
    class_standard: "",
    admission_session: defaultSession,
    is_new_admission: 1,
    father_name: "",
    father_contact: "",
    mother_name: "",
    mother_contact: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    // Name
    if (!form.name.trim()) {
      errs.name = "Name is required";
    } else if (!NAME_REGEX.test(form.name.trim())) {
      errs.name = "Name must contain only letters, spaces, dots, or hyphens (2-100 chars)";
    }

    // Roll Number
    if (!form.roll_number.trim()) {
      errs.roll_number = "Roll number is required";
    } else if (!/^\d+$/.test(form.roll_number.trim())) {
      errs.roll_number = "Roll number must be a number (e.g. 1, 2, 3...)";
    }

    // DOB
    if (!form.dob) {
      errs.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(form.dob);
      const today = new Date();
      const ageDiff = today.getFullYear() - dobDate.getFullYear();
      if (dobDate > today) {
        errs.dob = "Date of birth cannot be in the future";
      } else if (ageDiff < 2) {
        errs.dob = "Student must be at least 2 years old";
      } else if (ageDiff > 20) {
        errs.dob = "Date of birth seems too old for a school student";
      }
    }

    // Gender
    if (!form.gender) {
      errs.gender = "Gender is required";
    }

    // Class
    if (!form.class_standard) {
      errs.class_standard = "Class is required";
    }

    // Admission Session
    if (!form.admission_session.trim()) {
      errs.admission_session = "Admission session is required";
    } else if (!isValidSession(form.admission_session.trim())) {
      errs.admission_session = "Must be YYYY-YYYY format (e.g. 2025-2026)";
    }

    // Father contact (optional but validate format if provided)
    if (form.father_contact.trim() && !PHONE_REGEX.test(form.father_contact.trim())) {
      errs.father_contact = "Enter a valid 10-digit Indian mobile number";
    }

    // Father name (optional but validate format if provided)
    if (form.father_name.trim() && !NAME_REGEX.test(form.father_name.trim())) {
      errs.father_name = "Name must contain only letters, spaces, dots, or hyphens";
    }

    // Mother contact (optional but validate format if provided)
    if (form.mother_contact.trim() && !PHONE_REGEX.test(form.mother_contact.trim())) {
      errs.mother_contact = "Enter a valid 10-digit Indian mobile number";
    }

    // Mother name (optional but validate format if provided)
    if (form.mother_name.trim() && !NAME_REGEX.test(form.mother_name.trim())) {
      errs.mother_name = "Name must contain only letters, spaces, dots, or hyphens";
    }

    return errs;
  };

  const handleSave = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    // Trim all string fields before saving
    const cleanedData = {
      ...form,
      name: form.name.trim(),
      roll_number: form.roll_number.trim(),
      admission_session: form.admission_session.trim(),
      father_name: form.father_name.trim() || undefined,
      father_contact: form.father_contact.trim() || undefined,
      mother_name: form.mother_name.trim() || undefined,
      mother_contact: form.mother_contact.trim() || undefined,
    };

    onSave(cleanedData);
  };

  const fieldStyle = { width: "100%", marginBottom: 4, padding: "8px", boxSizing: "border-box" as const };
  const errorStyle = { color: "#e74c3c", fontSize: 12, marginBottom: 8, display: "block" };

  return (
    <div style={modalStyle}>
      <h3>Add Student</h3>

      {/* Name */}
      <input placeholder="Student Name *" value={form.name} style={fieldStyle}
        onChange={e => setForm({ ...form, name: e.target.value })} />
      {errors.name && <span style={errorStyle}>{errors.name}</span>}

      {/* Roll Number */}
      <input placeholder="Roll Number *" value={form.roll_number} style={fieldStyle}
        onChange={e => setForm({ ...form, roll_number: e.target.value })} />
      {errors.roll_number && <span style={errorStyle}>{errors.roll_number}</span>}

      {/* DOB */}
      <label style={{ fontSize: 12, color: "#999" }}>Date of Birth *</label>
      <input type="date" value={form.dob} style={fieldStyle}
        max={new Date().toISOString().split("T")[0]}
        onChange={e => setForm({ ...form, dob: e.target.value })} />
      {errors.dob && <span style={errorStyle}>{errors.dob}</span>}

      {/* Gender */}
      <select value={form.gender} style={fieldStyle}
        onChange={e => setForm({ ...form, gender: e.target.value })}>
        <option value="">Select Gender *</option>
        {GENDERS.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      {errors.gender && <span style={errorStyle}>{errors.gender}</span>}

      {/* Class Standard */}
      <select value={form.class_standard} style={fieldStyle}
        onChange={e => setForm({ ...form, class_standard: e.target.value })}>
        <option value="">Select Class *</option>
        {CLASS_STANDARDS.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {errors.class_standard && <span style={errorStyle}>{errors.class_standard}</span>}

      {/* Admission Session */}
      <input placeholder="Admission Session (e.g. 2025-2026) *" style={fieldStyle}
        value={form.admission_session}
        onChange={e => setForm({ ...form, admission_session: e.target.value })} />
      {errors.admission_session && <span style={errorStyle}>{errors.admission_session}</span>}

      {/* New Admission */}
      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0", cursor: "pointer" }}>
        <input type="checkbox"
          style={{ width: "auto", margin: 0 }}
          checked={form.is_new_admission === 1}
          onChange={e => setForm({
            ...form,
            is_new_admission: e.target.checked ? 1 : 0
          })} />
        New Admission
      </label>

      {/* Father */}
      <input placeholder="Father's Name" value={form.father_name} style={fieldStyle}
        onChange={e => setForm({ ...form, father_name: e.target.value })} />
      {errors.father_name && <span style={errorStyle}>{errors.father_name}</span>}

      <input placeholder="Father's Contact (10 digits)" value={form.father_contact} style={fieldStyle}
        maxLength={10}
        onChange={e => setForm({ ...form, father_contact: e.target.value })} />
      {errors.father_contact && <span style={errorStyle}>{errors.father_contact}</span>}

      {/* Mother */}
      <input placeholder="Mother's Name" value={form.mother_name} style={fieldStyle}
        onChange={e => setForm({ ...form, mother_name: e.target.value })} />
      {errors.mother_name && <span style={errorStyle}>{errors.mother_name}</span>}

      <input placeholder="Mother's Contact (10 digits)" value={form.mother_contact} style={fieldStyle}
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

export default AddStudentModal;

