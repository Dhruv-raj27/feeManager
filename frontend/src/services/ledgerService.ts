const API_URL = "http://localhost:3001";

export const fetchStudentLedger = async (
    student_uuid: string,
    token: string,
    session?: string
) => {
    const url = session
        ? `${API_URL}/ledger/${student_uuid}?session=${session}`
        : `${API_URL}/ledger/${student_uuid}`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if(!res.ok) {
        const err = await res.json();
        throw new Error (err.message || "Failed to load ledger");
    }

    return res.json();
};