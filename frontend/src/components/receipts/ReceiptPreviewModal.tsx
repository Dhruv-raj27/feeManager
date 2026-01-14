import ReceiptPrintLayout from "./ReceiptPrintLayout";

interface Props {
  data: any;
  onClose: () => void;
}

export default function ReceiptPreviewModal({ data, onClose }: Props) {
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>✕</button>

        <ReceiptPrintLayout data={data} />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => window.print()}>Print</button>
        </div>
      </div>
    </div>
  );
}
