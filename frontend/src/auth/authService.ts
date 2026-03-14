import { API_URL } from "../config";

export const login = async (email : string, password : string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || "Login failed");
    }

    return response.json();
}