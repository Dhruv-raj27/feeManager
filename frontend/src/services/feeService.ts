const API_URL = "http://localhost:3001";

export interface FeeStructure {
    class_standard: string;
    registration_fee: number;
    basic_fee: number;
    exam_fee: number;
    renewal_fee: number;
}

/* Fetch All */
export const fetchFees = async (token: string): Promise<FeeStructure[]> => {
    const res = await fetch(`${API_URL}/fees`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if(!res.ok) throw new Error("Failed to fetch fee structure");
    return res.json();
};

/* ADD / UPDATE */
export const saveFeeStructure = async (
    data: FeeStructure,
    token: string
) => {
    const res = await fetch(`${API_URL}/fees`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if(!res.ok) throw new Error("Failed to save fee structure");
};

/* DELETE */
export const deleteFeeStructure = async (
    class_standard: string,
    token: string
) => {
    const res = await fetch(`${API_URL}/fees/${class_standard}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if(!res.ok) throw new Error("Failed to delete fee structure");
};