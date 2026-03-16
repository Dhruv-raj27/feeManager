import { useEffect, useState } from "react";
import {
    fetchFeeStructures,
    saveFeeStructure,
    deleteFeeStructure,
    type FeeStructure,
} from "../services/feeService";
import FeeStructureModal from "../components/FeeStructureModal";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

const FeeStructurePage = () => {
    const { token } = useAuth();
    const [fees, setFees ] = useState<FeeStructure[]>([]);
    const [editing, setEditing ] = useState<FeeStructure | null>(null);
    const [adding, setAdding ] = useState(false);

    const loadFees = async () => {
        if (!token) return;
        const data = await fetchFeeStructures(token);
        setFees(data);
    };

    useEffect(() => {
        loadFees();
    }, [token]);

    const handleSave = async (data: FeeStructure) => {
        if (!token) return;
        try {
            await saveFeeStructure(data, token);
            setAdding(false);
            setEditing(null);
            loadFees();
            toast.success("Fee structure saved successfully");
        } catch (err: unknown) {
            toast.error((err as Error).message || "Failed to save fee structure");
        }
    };

    const handleDelete = async (class_standard: string) => {
        if (!token) return;
        if (!window.confirm("Delete fee structure for this class?")) return;

        try {
            await deleteFeeStructure(class_standard, token);
            loadFees();
            toast.success(`Fee structure for Class ${class_standard} deleted`);
        } catch (err: unknown) {
            toast.error((err as Error).message || "An error occurred while deleting.");
        }
    };

    return (
        <div style={{ padding: 20}}>
            <h2>Fee Structure</h2>

            <button onClick={() => setAdding(true)} className="btn-primary">
                ➕ Add Fee Structure
            </button>

            <table>
                <thead>
                    <tr>
                        <th style={{ width: "15%" }}>Class</th>
                        <th style={{ width: "25%" }} className="numeric">Base Fees</th>
                        <th style={{ width: "25%" }} className="numeric">Quarterly Breakdown</th>
                        <th style={{ width: "20%" }} className="numeric">Total (New Adm.)</th>
                        <th style={{ width: "15%" }}>Actions</th>
                    </tr>
                </thead>

                <tbody>
                {fees.map((f) => {
                    // Calculate quarterly amounts for new admission
                    const q1New = f.registration_fee + f.basic_fee + f.renewal_fee;
                    const q2 = f.basic_fee + f.exam_fee;
                    const q3 = f.basic_fee + f.exam_fee;
                    const q4 = f.basic_fee;
                    const totalNew = q1New + q2 + q3 + q4;
                    
                    return (
                    <tr key={f.class_standard}>
                    <td>
                        <div style={{ fontWeight: 600, fontSize: "1.1em" }}>{f.class_standard}</div>
                    </td>
                    <td className="numeric">
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Reg: <strong>₹{f.registration_fee}</strong></div>
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Basic: <strong>₹{f.basic_fee}</strong></div>
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Exam: <strong>₹{f.exam_fee}</strong></div>
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Renewal: <strong>₹{f.renewal_fee}</strong></div>
                    </td>
                    <td className="numeric">
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Q1: <strong style={{color:"var(--text-primary)"}}>₹{q1New}</strong></div>
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Q2: <strong style={{color:"var(--text-primary)"}}>₹{q2}</strong></div>
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Q3: <strong style={{color:"var(--text-primary)"}}>₹{q3}</strong></div>
                        <div style={{ fontSize: "0.9em", color: "var(--text-secondary)" }}>Q4: <strong style={{color:"var(--text-primary)"}}>₹{q4}</strong></div>
                    </td>
                    <td className="numeric">
                        <span style={{ fontWeight: 700, fontSize: "1.1em", color: "var(--success-color)" }}>₹{totalNew}</span>
                    </td>
                    <td>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button onClick={() => setEditing(f)} style={{ padding: "4px 10px" }}>Edit</button>
                            <button onClick={() => handleDelete(f.class_standard)} className="btn-danger" style={{ padding: "4px 10px" }}>Delete</button>
                        </div>
                    </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>

            {adding && (
                <FeeStructureModal
                onSave={handleSave}
                onClose={() => setAdding(false)}
                />
            )}

            {editing && (
                <FeeStructureModal
                initialData={editing} 
                onSave={handleSave}
                onClose={() => setEditing(null)}
                />
            )}            
        </div>
    );
};

export default FeeStructurePage;