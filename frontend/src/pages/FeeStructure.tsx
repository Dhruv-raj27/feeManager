import { useEffect, useState } from "react";
import {
    fetchFeeStructures,
    saveFeeStructure,
    deleteFeeStructure,
    type FeeStructure,
} from "../services/feeService";
import FeeStructureModal from "../components/FeeStructureModal";
import { useAuth } from "../auth/AuthContext";

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
        await saveFeeStructure(data, token);
        setAdding(false);
        setEditing(null);
        loadFees();
    };

    const handleDelete = async (class_standard: string) => {
        if (!token) return;
        if (!confirm("Delete fee structure for this class?")) return;

        await deleteFeeStructure(class_standard, token);
        loadFees();
    };

    return (
        <div style={{ padding: 20}}>
            <h2>Fee Structure</h2>

            <button onClick={() => setAdding(true)}>➕ Add Fee Structure</button>

            <table style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Class</th>
                        <th>Registration</th>
                        <th>Basic</th>
                        <th>Exam</th>
                        <th>Renewal</th>
                        <th>Q1 (New)</th>
                        <th>Q2</th>
                        <th>Q3</th>
                        <th>Q4</th>
                        <th>Total (New)</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                {fees.map((f) => {
                    // Calculate quarterly amounts for new admission
                    const q1New = f.registration_fee + f.basic_fee;
                    const q2 = f.basic_fee + f.exam_fee;
                    const q3 = f.basic_fee + f.exam_fee;
                    const q4 = f.basic_fee;
                    const totalNew = q1New + q2 + q3 + q4;
                    
                    return (
                    <tr key={f.class_standard}>
                    <td>{f.class_standard}</td>
                    <td>{f.registration_fee}</td>
                    <td>{f.basic_fee}</td>
                    <td>{f.exam_fee}</td>
                    <td>{f.renewal_fee}</td>
                    <td>{q1New}</td>
                    <td>{q2}</td>
                    <td>{q3}</td>
                    <td>{q4}</td>
                    <td>{totalNew}</td>
                    <td>
                        <button onClick={() => setEditing(f)}>Edit</button>
                        <button onClick={() => handleDelete(f.class_standard)}>
                        Delete
                        </button>
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