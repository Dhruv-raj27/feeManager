import { useDashboardSummary } from "../hooks/useDashboardSummary";

const Dashboard = () => {
    const { data, loading, error } = useDashboardSummary();

    if(loading) {
        return <p style={{ padding: 24 }}>Loading dashboard...</p>;
    }

    if(error || !data) {
        return <p style={{ padding: 24, color: "red" }}>{error}</p>;
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>Dashboard</h1>
            <p>Overview of school's fee collection</p>

            <ul>
                <li>Total Students: {data.totalStudents}</li>
                <li>Today's Collection: ₹{data.todayCollection}</li>
                <li>Monthly Collection: ₹{data.monthlyCollection}</li>
                <li>Total Transactions: {data.totalTransactions}</li>                
            </ul>

            <h3>Recent Transactions</h3>

            {data.recentTransactions.length === 0 ? (
                <p>No Transactions yet</p>
            ) : (
                <ul>
                    {data.recentTransactions.map((tx) => (
                        <li key={tx.receipt_number}>
                            {tx.payment_date} - {tx.student_name} (Class {tx.class_at_time_of_payment}) paid ₹{tx.amount_paid} - Receipt #{tx.receipt_number}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dashboard;