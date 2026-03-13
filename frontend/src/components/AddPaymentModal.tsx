import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchStudents, type Student } from "../services/studentService";
import { createPayment } from "../services/paymentService";
import { fetchFeeStructures, type FeeStructure } from "../services/feeService";
import { fetchStudentLedger } from "../services/ledgerService";
import {
  PAYMENT_MODES,
  PAYMENT_MODES_WITH_REFERENCE,
  PAYMENT_MODES_WITH_INSTRUMENT,
  PAYMENT_MODES_WITH_BANK,
  type PaymentMode,
} from "../constants";

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
    payment_mode: "" as PaymentMode | "",
    discount_amount: 0,
    discount_reason: "",
    reference_number: "",   // For UPI/RTGS/NEFT
    instrument_number: "",  // For Cheque/DD
    bank_name: "",          // For RTGS/NEFT/Cheque/DD
  });

  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [remainingDue, setRemainingDue] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!token) return;
    fetchStudents(token).then(setStudents);
    fetchFeeStructures(token).then(setFees);
  }, [token]);

  /* ---------- FETCH REMAINING DUE FOR SELECTED QUARTER ---------- */
  useEffect(() => {
    const fetchDueAmount = async () => {
      if (!token || !form.student_uuid || !form.quarter_number) {
        setRemainingDue(null);
        return;
      }

      try {
        const ledgerData = await fetchStudentLedger(form.student_uuid, token);
        const quarter = ledgerData.quarters?.find(
          (q: any) => q.quarter === Number(form.quarter_number)
        );
        
        if (quarter) {
          const due = quarter.expected - quarter.paid;
          setRemainingDue(due > 0 ? due : 0);
        } else {
          setRemainingDue(null);
        }
      } catch (err) {
        console.error("Failed to fetch ledger:", err);
        setRemainingDue(null);
      }
    };

    fetchDueAmount();
  }, [form.student_uuid, form.quarter_number, token]);

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

    const discount = Math.min(Math.max(form.discount_amount, 0), amount);
    const finalAmount = amount - discount;
    setCalculatedAmount(finalAmount);
  }, [
    form.student_uuid,
    form.quarter_number,
    form.discount_amount,
    students,
    fees,
  ]);

  /* ---------- HELPERS ---------- */
  const needsReference = PAYMENT_MODES_WITH_REFERENCE.includes(form.payment_mode as PaymentMode);
  const needsInstrument = PAYMENT_MODES_WITH_INSTRUMENT.includes(form.payment_mode as PaymentMode);
  const needsBank = PAYMENT_MODES_WITH_BANK.includes(form.payment_mode as PaymentMode);

  /* ---------- VALIDATE ---------- */
  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!form.student_uuid) errs.student_uuid = "Please select a student";
    if (!form.quarter_number) errs.quarter_number = "Please select a quarter";
    if (!form.payment_mode) errs.payment_mode = "Please select a payment mode";

    // Check if quarter is already fully paid
    if (remainingDue === 0) {
      errs.quarter_paid = "This quarter is already fully paid";
    }

    // Discount validation — discount cannot exceed the gross fee amount
    const grossAmount = calculatedAmount + form.discount_amount; // reverse-calculate gross
    if (form.discount_amount < 0) {
      errs.discount_amount = "Discount cannot be negative";
    } else if (grossAmount > 0 && form.discount_amount > grossAmount) {
      errs.discount_amount = "Discount cannot exceed the fee amount";
    }

    // Payment mode-specific validations
    if (needsReference && !form.reference_number.trim()) {
      errs.reference_number = `Transaction/Reference ID is required for ${form.payment_mode}`;
    }
    if (needsInstrument && !form.instrument_number.trim()) {
      errs.instrument_number = `${form.payment_mode} number is required`;
    }
    if (needsBank && !form.bank_name.trim()) {
      errs.bank_name = `Bank name is required for ${form.payment_mode}`;
    }

    if (form.discount_amount > 0 && !form.discount_reason.trim()) {
      errs.discount_reason = "Please provide a reason for the discount";
    }

    return errs;
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!token) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
        await createPayment(
          {
            student_uuid: form.student_uuid,
            quarter_number: Number(form.quarter_number),
            payment_mode: form.payment_mode,
            discount_amount: Math.max(form.discount_amount, 0),
            discount_reason: form.discount_reason.trim() || undefined,
            reference_number: form.reference_number.trim() || undefined,
            instrument_number: form.instrument_number.trim() || undefined,
            bank_name: form.bank_name.trim() || undefined,
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

  const fieldStyle = { width: "100%", marginBottom: 4, padding: "8px", boxSizing: "border-box" as const };
  const errorStyle = { color: "#e74c3c", fontSize: 12, marginBottom: 8, display: "block" };
  const isQuarterPaid = remainingDue === 0;

  return (
    <div style={modalStyle}>
      <h3>Record Payment</h3>

      {/* Student */}
      <select value={form.student_uuid} style={fieldStyle}
        onChange={(e) => setForm({ ...form, student_uuid: e.target.value })}
      >
        <option value="">Select Student *</option>
        {students.map((s) => (
          <option key={s.uuid} value={s.uuid}>
            {s.name} (Class {s.class_standard})
          </option>
        ))}
      </select>
      {errors.student_uuid && <span style={errorStyle}>{errors.student_uuid}</span>}

      {/* Quarter */}
      <select value={form.quarter_number} style={fieldStyle}
        onChange={(e) => setForm({ ...form, quarter_number: e.target.value })}
      >
        <option value="">Select Quarter *</option>
        <option value="1">Quarter 1</option>
        <option value="2">Quarter 2</option>
        <option value="3">Quarter 3</option>
        <option value="4">Quarter 4</option>
      </select>
      {errors.quarter_number && <span style={errorStyle}>{errors.quarter_number}</span>}

      {/* Payment Mode */}
      <select value={form.payment_mode} style={fieldStyle}
        onChange={(e) => setForm({
          ...form,
          payment_mode: e.target.value as PaymentMode | "",
          reference_number: "",
          instrument_number: "",
          bank_name: "",
        })}
      >
        <option value="">Payment Mode *</option>
        {PAYMENT_MODES.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      {errors.payment_mode && <span style={errorStyle}>{errors.payment_mode}</span>}

      {/* Payment mode-specific fields */}
      {needsReference && (
        <>
          <input placeholder={`${form.payment_mode} Transaction/Reference ID *`}
            value={form.reference_number} style={fieldStyle}
            onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
          {errors.reference_number && <span style={errorStyle}>{errors.reference_number}</span>}
        </>
      )}

      {needsInstrument && (
        <>
          <input placeholder={`${form.payment_mode} Number *`}
            value={form.instrument_number} style={fieldStyle}
            onChange={(e) => setForm({ ...form, instrument_number: e.target.value })} />
          {errors.instrument_number && <span style={errorStyle}>{errors.instrument_number}</span>}
        </>
      )}

      {needsBank && (
        <>
          <input placeholder="Bank Name *"
            value={form.bank_name} style={fieldStyle}
            onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
          {errors.bank_name && <span style={errorStyle}>{errors.bank_name}</span>}
        </>
      )}

      {/* Discount */}
      <input type="number" placeholder="Discount Amount" min={0}
        value={form.discount_amount} style={fieldStyle}
        onChange={(e) => setForm({
          ...form,
          discount_amount: Math.max(0, Number(e.target.value))
        })}
      />
      {errors.discount_amount && <span style={errorStyle}>{errors.discount_amount}</span>}

      <input placeholder="Discount Reason (required if discount > 0)"
        value={form.discount_reason} style={fieldStyle}
        onChange={(e) => setForm({ ...form, discount_reason: e.target.value })}
      />
      {errors.discount_reason && <span style={errorStyle}>{errors.discount_reason}</span>}

      {/* ---- CALCULATED AMOUNT ---- */}
      <div style={{ marginTop: 10, fontWeight: "bold" }}>
        {isQuarterPaid ? (
          <div style={{ color: "#2ecc71" }}>
            ✓ This quarter is already fully paid
          </div>
        ) : remainingDue !== null && remainingDue > 0 ? (
          <>
            <div style={{ color: "#f39c12" }}>
              ⚠️ Remaining Due for this Quarter: ₹{remainingDue}
            </div>
            <div>Full Quarter Amount: ₹{calculatedAmount}</div>
          </>
        ) : (
          <div>Payable Amount: ₹{calculatedAmount}</div>
        )}
      </div>

      {errors.quarter_paid && <span style={errorStyle}>{errors.quarter_paid}</span>}

      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave}
          disabled={loading || calculatedAmount === 0 || isQuarterPaid}>
          {loading ? "Saving..." : "Save"}
        </button>
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

export default AddPaymentModal;

