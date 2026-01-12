const API_URL = "http://localhost:3001";

export interface SchoolSettings {
    school_name: string;
    address?: string;
    contact_number?: string;
    email?: string;
    current_academic_session: string;
    logo_path?: string;
}

export const fetchSettings = async (token : string)  => {
    const res = await fetch(`${API_URL}/settings`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if(!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
    };

    export const updateSettings = async (data: SchoolSettings, token: string) => {
        const res = await fetch(`${API_URL}/settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if(!res.ok) throw new Error("Failed to update settings");
    };