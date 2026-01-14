export default function ReceiptCopy ({
    receipt,
    copyLabel,
    showSignatory = false,
}: any) {
    const { school, student, payment, receipt: meta } = receipt;

    return (
        <div className="receipt-copy">
            <h2>{school.school_name}</h2>
            <p>{school.address}</p>
            <p>
                Phone: {school.contact_number} | Email: {school.email}
            </p>

            <h3> FEE RECEIPT </h3>
            <p><i>{copyLabel}</i></p>

            <hr />

            <p><b>Receipt No:</b> {meta.receipt_number}</p>
            <p><b>Date:</b> {new Date(meta.date).toLocaleString()}</p>
            <p><b>Session:</b> {meta.academic_session}</p>

            <hr />

            <p><b>Name:</b> {student.name}</p>
            <p><b>Class:</b> {student.class_standard}</p>
            <p><b>Roll No:</b> {student.roll_number}</p>
            <p><b>Guardian:</b> {student.guardian}</p>

            <hr />

            <p><b>Quarter:</b> Q{payment.quarter_number}</p>
            <p><b>Payment Mode:</b>{payment.payment_mode}</p>
            <p><b>Discount:</b>₹{payment.discount_amount}</p>

            <hr />

            <p className="amount">
                <b>Amount Paid:</b>₹{payment.amount_paid}
            </p>

            {showSignatory && (
                <div className="mt-10">
                    <p>For {school.school_name}</p>
                    <br />
                    <p><b>Authorised Signatory</b></p>
                </div>
            )}
        </div>
    );
}