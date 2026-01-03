const API_BASE = "http://localhost:3001";

export interface RecentTransaction {
    receipt_number: string;
    student_name: string;
    class_at_time_of_payment: string;
    amount_paid: number;
    payment_date: string; 
}

export interface DashboardSummary {
    totalStudents: number;
    todayCollection: number;
    monthlyCollection: number;
    totalTransactions: number;
    recentTransactions: RecentTransaction[];
}

export async function fetchDashboardSummary(token: string): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if(!res.ok) {
        throw new Error("Failed to fetch dashboard summary");
    }
    
    return res.json();
}