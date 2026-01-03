const API_BASE = "http://localhost:3001";

export interface Student {
    uuid: string;
    name: string;
    roll_number: string;
    class_standard: string;
    father_name?: string;
    father_contact?: string;
    created_at: string;
}

export const fetchStudents = async (token: string): Promise<Student[]> => {
    const res = await fetch(`${API_BASE}/students`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });

    if(!res.ok) {
        throw new Error("Failed to fetch students");
    }

    return res.json();
};

export const createStudent = async (
    token: string,
    payload: Omit<Student, "uuid" | "created_at">
) => {
    const res = await fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body:JSON.stringify(payload)
    });

    if(!res.ok) {
        throw new Error("Failed to create student");
    }

    return res.json();
};