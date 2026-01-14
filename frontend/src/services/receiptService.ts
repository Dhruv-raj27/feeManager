const API_URL = "http://localhost:3001";

export const fetchReceiptByPaymentUUID = async (paymentUUID: string) => {
    const res = await fetch(
        `${API_URL}/receipts/${paymentUUID}`
    );
    if (!res.ok) {
        throw new Error("Failed to fetch receipt");
    }

    return res.json();
};