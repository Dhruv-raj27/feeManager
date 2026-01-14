import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import AddPaymentModal from "../components/AddPaymentModal";
import { formatToIST } from "../utils/dateUtils";
import ReceiptPreviewModal from "../components/receipts/ReceiptPreviewModal";
import { fetchReceiptByPaymentUUID } from "../services/receiptService";

interface Payment {
  uuid: string;
  student_name: string;
  class_at_time_of_payment: string;
  amount_paid: number;
  quarter_number: number;
  academic_session: string;
  payment_mode: string;
  payment_date: string;
}

const Payments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ showReceiptModal, setShowReceiptModal ] = useState(false);
  const [ receiptData, setReceiptData ] = useState<any>(null);
  const [ loadingReceipt, setLoadingReceipt ] = useState(false);

  const loadPayments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPayments(data);
    } catch {
      console.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (uuid: string) => {
    if (!token) return;
    if (!confirm("Delete this payment?")) return;

    await fetch(`http://localhost:3001/payments/${uuid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadPayments();
  };

  useEffect(() => {
    loadPayments();
  }, [token]);

  async function handlePrintReceipt(paymentUUID: string) {
    try {
      const data = await fetchReceiptByPaymentUUID(paymentUUID);
      setReceiptData(data);
    } catch {
      alert("Failed to load receipt");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Payments</h2>

      <button onClick={() => setAdding(true)}>➕ Record Payment</button>

      {loading && <p>Loading payments...</p>}

      {!loading && payments.length === 0 && (
        <p>No payments recorded yet.</p>
      )}

      {payments.length > 0 && (
        <table style={{ marginTop: 20, width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Class</th>
              <th>Quarter</th>
              <th>Session</th>
              <th>Mode</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.uuid}>
                <td>{formatToIST(p.payment_date)}</td>
                <td>{p.student_name}</td>
                <td>{p.class_at_time_of_payment}</td>
                <td>Q{p.quarter_number}</td>
                <td>{p.academic_session}</td>
                <td>{p.payment_mode}</td>
                <td>₹{p.amount_paid}</td>
                <td>
                  <button onClick={() => deletePayment(p.uuid)}>
                    🗑 Delete
                  </button>
                  <button 
                    onClick={() => handlePrintReceipt(p.uuid)}
                    className="btn-primary"
                    disabled={loadingReceipt}
                  >
                    {loadingReceipt ? 'Loading...' : 'Print Receipt'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {adding && (
        <AddPaymentModal
          onClose={() => setAdding(false)}
          onSuccess={loadPayments}
        />
      )}
      {receiptData && (
        <ReceiptPreviewModal
          data={receiptData}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
};

export default Payments;
