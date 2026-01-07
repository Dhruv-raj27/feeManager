import { useEffect, useState } from "react";
import {
    fetchFees,
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
        const data = await fetchFees(token);
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
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                {fees.map((f) => (
                    <tr key={f.class_standard}>
                    <td>{f.class_standard}</td>
                    <td>{f.registration_fee}</td>
                    <td>{f.basic_fee}</td>
                    <td>{f.exam_fee}</td>
                    <td>{f.renewal_fee}</td>
                    <td>
                        {f.registration_fee +
                        f.basic_fee +
                        f.exam_fee +
                        f.renewal_fee}
                    </td>
                    <td>
                        <button onClick={() => setEditing(f)}>Edit</button>
                        <button onClick={() => handleDelete(f.class_standard)}>
                        Delete
                        </button>
                    </td>
                    </tr>
                ))}
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