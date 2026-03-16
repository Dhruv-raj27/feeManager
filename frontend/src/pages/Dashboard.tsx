import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { formatToIST } from "../utils/dateUtils";
import { LoadingSpinner, EmptyState } from "../components/ui/FeedbackStates";
import { useTheme } from "../hooks/useTheme";

const Dashboard = () => {
    const { data, loading, error } = useDashboardSummary();
    const { theme, toggleTheme } = useTheme();

    if(loading) {
        return <LoadingSpinner message="Loading your dashboard..." />;
    }

    if(error || !data) {
        return <p style={{ padding: 24, color: "red" }}>{error}</p>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ margin: 0 }}>Dashboard</h1>
                    <p style={{ margin: "4px 0 0 0" }}>Overview of school's fee collection</p>
                </div>
                <button 
                  onClick={toggleTheme} 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: '20px' }}>
                    {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>

            {data.birthdaysToday && data.birthdaysToday.length > 0 && (
                <div style={{
                    marginBottom: 30,
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, var(--accent-color) 0%, #a855f7 100%)',
                    borderRadius: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    animation: 'logo-spin 1s ease-out forwards', /* Quick spin on load */
                }}>
                    <div style={{ fontSize: '32px' }}>🎉</div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2em', fontWeight: 600 }}>Happy Birthday!</h3>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.95, fontSize: '1.05em' }}>
                            Wishing a wonderful birthday to{' '}
                            {data.birthdaysToday.map((b, i) => (
                                <span key={i}>
                                    <strong>{b.name}</strong> (Class {b.class_standard})
                                    {i < data.birthdaysToday!.length - 2 ? ', ' : i === data.birthdaysToday!.length - 2 ? ' and ' : ''}
                                </span>
                            ))}
                            ! 🥳
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="card">
                    <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Students</h4>
                    <h2 style={{ margin: '10px 0 0 0', color: 'var(--accent-color)' }}>{data.totalStudents}</h2>
                </div>
                <div className="card">
                    <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Today's Collection</h4>
                    <h2 style={{ margin: '10px 0 0 0', color: 'var(--success-color)' }}>₹{data.todayCollection}</h2>
                </div>
                <div className="card">
                    <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Monthly Collection</h4>
                    <h2 style={{ margin: '10px 0 0 0', color: 'var(--success-color)' }}>₹{data.monthlyCollection}</h2>
                </div>
                <div className="card">
                    <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Transactions</h4>
                    <h2 style={{ margin: '10px 0 0 0', color: 'var(--warning-color)' }}>{data.totalTransactions}</h2>
                </div>
            </div>

            <h3 style={{ marginTop: '40px' }}>Recent Transactions</h3>

            {data.recentTransactions.length === 0 ? (
                <EmptyState 
                    icon="📊" 
                    title="No Transactions Today" 
                    message="There hasn't been any fee collection activity yet." 
                />
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                        <thead style={{ background: 'transparent' }}>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th className="numeric">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentTransactions.map((t, index) => (
                                <tr key={`${t.payment_date}-${t.student_name}-${index}`}>
                                    <td>{formatToIST(t.payment_date)}</td>
                                    <td>{t.student_name}</td>
                                    <td className="numeric">
                                        <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                                            + ₹{t.amount_paid}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;