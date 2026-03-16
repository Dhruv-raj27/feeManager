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

  const fieldStyle = { width: "100%", marginBottom: 4, padding: "8px", boxSizing: "border-box" as const };
  const errorStyle = { color: "var(--danger-color)", fontSize: 12, marginBottom: 8, display: "block" };
  const helperStyle = { fontSize: 11, color: "var(--text-secondary)", marginBottom: 12, display: "block" };

  return (
    <>
      <div className="modal-overlay" style={overlayStyle} onClick={onClose} />
      <div className="card" style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>{initialData ? "Edit" : "Add"} Fee Structure</h3>
          <button onClick={onClose} style={{ padding: '4px 8px', background: 'transparent' }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Class Standard *</label>
          <select
            value={form.class_standard}
            style={fieldStyle}
            disabled={!!initialData}
            onChange={(e) => handleChange("class_standard", e.target.value)}
          >
            <option value="">Select Class...</option>
            {CLASS_STANDARDS.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
          {errors.class_standard && <span style={errorStyle}>{errors.class_standard}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* One-Time & Annual Fees */}
          <div>
            <div style={{ marginBottom: 16, background: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', color: 'var(--accent-color)' }}>
                Registration Fee (One-Time)
              </label>
              <span style={helperStyle}>Charged in Q1 for new admissions only.</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-secondary)' }}>₹</span>
                <input type="number" min={0} value={form.registration_fee} 
                  style={{ ...fieldStyle, paddingLeft: 24, textAlign: 'right' }}
                  onChange={(e) => handleChange("registration_fee", e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16, background: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', color: 'var(--accent-color)' }}>
                Renewal Fee (Annual)
              </label>
              <span style={helperStyle}>Charged in Q1 for returning students.</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-secondary)' }}>₹</span>
                <input type="number" min={0} value={form.renewal_fee} 
                  style={{ ...fieldStyle, paddingLeft: 24, textAlign: 'right' }}
                  onChange={(e) => handleChange("renewal_fee", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Recurring & Periodic Fees */}
          <div>
            <div style={{ marginBottom: 16, background: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', color: 'var(--success-color)' }}>
                Basic Fee (Recurring)
              </label>
              <span style={helperStyle}>Charged every quarter (Q1, Q2, Q3, Q4).</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-secondary)' }}>₹</span>
                <input type="number" min={0} value={form.basic_fee} 
                  style={{ ...fieldStyle, paddingLeft: 24, textAlign: 'right' }}
                  onChange={(e) => handleChange("basic_fee", e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16, background: 'rgba(0,0,0,0.1)', padding: 12, borderRadius: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', color: 'var(--warning-color)' }}>
                Exam Fee (Periodic)
              </label>
              <span style={helperStyle}>Charged only in Q2 and Q3.</span>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-secondary)' }}>₹</span>
                <input type="number" min={0} value={form.exam_fee} 
                  style={{ ...fieldStyle, paddingLeft: 24, textAlign: 'right' }}
                  onChange={(e) => handleChange("exam_fee", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {errors.all_zero && <span style={{...errorStyle, textAlign: 'center'}}>{errors.all_zero}</span>}

        <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save Structure</button>
        </div>
      </div>
    </>
  );
};

const overlayStyle = {
  position: "fixed" as const,
  top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 999,
};

const modalStyle = {
  position: "fixed" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "90vh",
  overflowY: "auto" as const,
  zIndex: 1000,
};

export default FeeStructureModal;

