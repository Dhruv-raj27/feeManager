import { useState } from "react";
import { type FeeStructure } from "../services/feeService";
import { CLASS_STANDARDS } from "../constants";

interface Props {
    initialData?: FeeStructure;
  onSave: (fee: FeeStructure) => void;
  onClose: () => void;
}

const FeeStructureModal = ({ initialData, onSave, onClose }: Props) => {
    const [form, setForm] = useState<FeeStructure>(
        initialData || {
            class_standard: "",
            registration_fee: 0,
            basic_fee: 0,
            exam_fee: 0,
            renewal_fee: 0,
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setForm({
      ...form,
      [key]:
        key === "class_standard"
          ? value
          : Math.max(0, Number(value)),  // Ensure non-negative
    });
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!form.class_standard) {
      errs.class_standard = "Class is required";
    }

    if (
      form.registration_fee === 0 &&
      form.basic_fee === 0 &&
      form.exam_fee === 0 &&
      form.renewal_fee === 0
    ) {
      errs.all_zero = "All fee amounts are zero. Please set at least one fee.";
    }

    return errs;
  };

  const handleSave = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSave(form);
  };

  const fieldStyle = { width: "100%", marginBottom: 8, padding: "8px", boxSizing: "border-box" as const };
  const errorStyle = { color: "#e74c3c", fontSize: 12, marginBottom: 8, display: "block" };

  return (
    <div style={modalStyle}>
      <h3>{initialData ? "Edit" : "Add"} Fee Structure</h3>

      <select
        value={form.class_standard}
        style={fieldStyle}
        disabled={!!initialData}  // Don't allow changing class when editing
        onChange={(e) => handleChange("class_standard", e.target.value)}
      >
        <option value="">Select Class *</option>
        {CLASS_STANDARDS.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {errors.class_standard && <span style={errorStyle}>{errors.class_standard}</span>}

      <input type="number" placeholder="Registration Fee" min={0}
        value={form.registration_fee} style={fieldStyle}
        onChange={(e) => handleChange("registration_fee", e.target.value)} />

      <input type="number" placeholder="Basic Fee (per quarter)" min={0}
        value={form.basic_fee} style={fieldStyle}
        onChange={(e) => handleChange("basic_fee", e.target.value)} />

      <input type="number" placeholder="Exam Fee" min={0}
        value={form.exam_fee} style={fieldStyle}
        onChange={(e) => handleChange("exam_fee", e.target.value)} />

      <input type="number" placeholder="Renewal Fee" min={0}
        value={form.renewal_fee} style={fieldStyle}
        onChange={(e) => handleChange("renewal_fee", e.target.value)} />

      {errors.all_zero && <span style={errorStyle}>{errors.all_zero}</span>}

      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </div>
  );
};

const modalStyle = {
  position: "fixed" as const,
  top: "20%",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#222",
  padding: 20,
  borderRadius: 8,
  width: 360,
};

export default FeeStructureModal;

