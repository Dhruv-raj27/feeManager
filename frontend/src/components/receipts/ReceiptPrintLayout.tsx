import "./receipt.css";
import { formatToIST } from "../../utils/dateUtils";

export default function ReceiptPrintLayout({ data }: { data: any }) {
  if (!data) return null;

  const { school, receipt, student, payment } = data;

  return (
    <div className="print-root">
      <ReceiptCopy
        title="Guardian Copy"
        school={school}
        receipt={receipt}
        student={student}
        payment={payment}
        showSignatory={true}
      />

      <div className="divider" />

      <ReceiptCopy
        title="School Copy"
        school={school}
        receipt={receipt}
        student={student}
        payment={payment}
        showSignatory={false}
      />
    </div>
  );
}

function ReceiptCopy({
  title,
  school,
  receipt,
  student,
  payment,
  showSignatory,
}: any) {
  return (
    <div className="receipt-half">
      <h2>{school.school_name}</h2>
      <p>{school.address}</p>
      <p>Phone: {school.contact_number} | Email: {school.email}</p>

      <h3>FEE RECEIPT</h3>
      <i>{title}</i>

      <hr />

      <p><b>Receipt No:</b> {receipt.receipt_number}</p>
      <p><b>Date:</b> {formatToIST(receipt.date)}</p>
      <p><b>Session:</b> {receipt.academic_session}</p>

      <hr />

      <p><b>Name:</b> {student.name}</p>
      <p><b>Class:</b> {student.class_standard}</p>
      <p><b>Roll No:</b> {student.roll_number || "-"}</p>
      <p><b>Guardian:</b> {student.guardian}</p>

      <hr />

      <p><b>Quarter:</b> Q{payment.quarter_number}</p>
      <p><b>Payment Mode:</b> {payment.payment_mode}</p>
      <p><b>Discount:</b> ₹{payment.discount_amount}</p>

      <hr />

      <div className="amount-row">
        <b>Amount Paid:</b> ₹{payment.amount_paid}
      </div>

      {showSignatory && (
        <div className="signatory">
          <p>For {school.school_name}</p>
          <p><b>Authorised Signatory</b></p>
        </div>
      )}
    </div>
  );
}
