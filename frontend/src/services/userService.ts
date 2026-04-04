import { API_URL } from "../config";

export interface AppUser {
    uuid: string;
    full_name: string;
    email: string;
    role: string;
    must_change_password: number;
    created_at: string;
}

export const fetchUsers = async (token: string): Promise<AppUser[]> => {
    const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
};

export const createUser = async (
    data: { full_name: string; email: string; role: string },
    token: string
): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create user");
    return json;
};

export const updateUserRole = async (
    uuid: string,
    role: string,
    token: string
): Promise<void> => {
    const res = await fetch(`${API_URL}/users/${uuid}/role`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to update role");
    }
};

export const deleteUser = async (uuid: string, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/users/${uuid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to delete user");
    }
};
