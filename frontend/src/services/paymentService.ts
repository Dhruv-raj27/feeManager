const API_URL = "http://localhost:3001";

export interface PaymentPayload {
  student_uuid: string;
  quarter_number: number;
  payment_mode: string;
  discount_amount?: number;
  discount_reason?: string;
}

export const createPayment = async (
  data: PaymentPayload,
  token: string
) => {
  const res = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to create payment");
  }

  return result;
};
