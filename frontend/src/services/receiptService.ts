const API_URL = "http://localhost:3001";

export const fetchReceiptByPaymentUUID = async (paymentUUID: string, token: string) => {
    const res = await fetch(
        `${API_URL}/receipts/${paymentUUID}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!res.ok) {
        throw new Error("Failed to fetch receipt");
    }

    return res.json();
};