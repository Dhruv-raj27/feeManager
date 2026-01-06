import { useState } from "react";

interface Props {
  onSave: (data: any) => void;
  onClose: () => void;
}

const AddStudentModal = ({ onSave, onClose }: Props) => {
  const [form, setForm] = useState({
    name: "",
    roll_number: "",
    dob: "",
    gender: "",
    class_standard: "",
    father_name: "",
    father_contact: "",
  });

  const handleSave = () => {
    if (!form.name || !form.roll_number || !form.dob || !form.gender || !form.class_standard) {
      alert("Please fill all required fields");
      return;
    }
    onSave(form);
  };

  return (
    <div style={modalStyle}>
      <h3>Add Student</h3>

      <input placeholder="Name" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })} />

      <input placeholder="Roll Number" value={form.roll_number}
        onChange={e => setForm({ ...form, roll_number: e.target.value })} />

      <input type="date" value={form.dob}
        onChange={e => setForm({ ...form, dob: e.target.value })} />

      <select value={form.gender}
        onChange={e => setForm({ ...form, gender: e.target.value })}>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <input placeholder="Class (LKG, UKG, 1...)" value={form.class_standard}
        onChange={e => setForm({ ...form, class_standard: e.target.value })} />

      <input placeholder="Father Name" value={form.father_name}
        onChange={e => setForm({ ...form, father_name: e.target.value })} />

      <input placeholder="Father Contact" value={form.father_contact}
        onChange={e => setForm({ ...form, father_contact: e.target.value })} />

      <br />
      <button onClick={handleSave}>Save</button>
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

export default AddStudentModal;
