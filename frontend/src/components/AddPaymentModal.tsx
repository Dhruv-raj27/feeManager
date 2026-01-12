import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchStudents, type Student } from "../services/studentService";
import { createPayment } from "../services/paymentService";
import { fetchFeeStructures, type FeeStructure } from "../services/feeService";

const AddPaymentModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { token } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    student_uuid: "",
    quarter_number: "",
    payment_mode: "",
    discount_amount: 0,
    discount_reason: "",
  });

  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!token) return;
    fetchStudents(token).then(setStudents);
    fetchFeeStructures(token).then(setFees);
  }, [token]);

  /* ---------- CALCULATE AMOUNT ---------- */
  useEffect(() => {
    const student = students.find((s) => s.uuid === form.student_uuid);
    if (!student || !form.quarter_number) {
      setCalculatedAmount(0);
      return;
    }

    const fee = fees.find(
      (f) => f.class_standard === student.class_standard
    );
    if (!fee) {
      setCalculatedAmount(0);
      return;
    }

    const q = Number(form.quarter_number);
    let amount = 0;

    if (student.is_new_admission === 1) {
      if (q === 1) amount = fee.registration_fee + fee.basic_fee;
      else if (q === 2 || q === 3)
        amount = fee.basic_fee + fee.exam_fee;
      else if (q === 4) amount = fee.basic_fee;
    } else {
      if (q === 1) amount = fee.renewal_fee + fee.basic_fee;
      else if (q === 2 || q === 3)
        amount = fee.basic_fee + fee.exam_fee;
      else if (q === 4) amount = fee.basic_fee;
    }

    const finalAmount = Math.max(amount - form.discount_amount, 0);
    setCalculatedAmount(finalAmount);
  }, [
    form.student_uuid,
    form.quarter_number,
    form.discount_amount,
    students,
    fees,
  ]);

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!token) return;

    if (
      !form.student_uuid ||
      !form.quarter_number ||
      !form.payment_mode
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
        await createPayment(
          {
            student_uuid: form.student_uuid,
            quarter_number: Number(form.quarter_number),
            payment_mode: form.payment_mode,
            discount_amount: form.discount_amount,
            discount_reason: form.discount_reason || undefined,
          },
          token
        );

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyle}>
      <h3>Record Payment</h3>

      {/* Student */}
      <select
        value={form.student_uuid}
        onChange={(e) =>
          setForm({ ...form, student_uuid: e.target.value })
        }
      >
        <option value="">Select Student *</option>
        {students.map((s) => (
          <option key={s.uuid} value={s.uuid}>
            {s.name} (Class {s.class_standard})
          </option>
        ))}
      </select>

      {/* Quarter */}
      <select
        value={form.quarter_number}
        onChange={(e) =>
          setForm({ ...form, quarter_number: e.target.value })
        }
      >
        <option value="">Select Quarter *</option>
        <option value="1">Quarter 1</option>
        <option value="2">Quarter 2</option>
        <option value="3">Quarter 3</option>
        <option value="4">Quarter 4</option>
      </select>

      {/* Payment Mode */}
      <select
        value={form.payment_mode}
        onChange={(e) =>
          setForm({ ...form, payment_mode: e.target.value })
        }
      >
        <option value="">Payment Mode *</option>
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Bank">Bank</option>
      </select>

      {/* Discount */}
      <input
        type="number"
        placeholder="Discount Amount"
        value={form.discount_amount}
        onChange={(e) =>
          setForm({ ...form, discount_amount: Number(e.target.value) })
        }
      />

      <input
        placeholder="Discount Reason (optional)"
        value={form.discount_reason}
        onChange={(e) =>
          setForm({ ...form, discount_reason: e.target.value })
        }
      />

      {/* ---- CALCULATED AMOUNT ---- */}
      <div style={{ marginTop: 10, fontWeight: "bold" }}>
        Payable Amount: ₹{calculatedAmount}
      </div>

      <br />

      <button onClick={handleSave} disabled={loading || calculatedAmount === 0}>
        {loading ? "Saving..." : "Save"}
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

const modalStyle = {
  position: "fixed" as const,
  top: "15%",
  left: "35%",
  background: "#222",
  padding: 20,
  borderRadius: 8,
};

export default AddPaymentModal;
