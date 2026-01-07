import { useState } from "react";
import { type FeeStructure } from "../services/feeService";

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

  const handleChange = (key: string, value: string) => {
    setForm({
      ...form,
      [key]:
        key === "class_standard"
          ? value
          : Number(value),
    });
  };

  return (
    <div style={modalStyle}>
      <h3>Add Fee Structure</h3>

      <input
        placeholder="Class Standard (e.g. LKG, UKG, 1)"
        value={form.class_standard}
        onChange={(e) =>
          handleChange("class_standard", e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Registration Fee"
        value={form.registration_fee}
        onChange={(e) =>
          handleChange("registration_fee", e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Basic Fee"
        value={form.basic_fee}
        onChange={(e) =>
          handleChange("basic_fee", e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Exam Fee"
        value={form.exam_fee}
        onChange={(e) =>
          handleChange("exam_fee", e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Renewal Fee"
        value={form.renewal_fee}
        onChange={(e) =>
          handleChange("renewal_fee", e.target.value)
        }
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={() => onSave(form)}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
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
  width: 360,
};

export default FeeStructureModal;
