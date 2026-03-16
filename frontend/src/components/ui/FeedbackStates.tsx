export const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
    <div className="spinner"></div>
    <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{message}</p>
  </div>
);

export const EmptyState = ({ title, message, icon = "📁" }: { title: string, message: string, icon?: string }) => (
  <div style={{ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
    padding: '60px 20px', textAlign: 'center', background: 'var(--bg-secondary)', 
    borderRadius: '8px', border: '1px dashed var(--border-color)', marginTop: '20px'
  }}>
    <div style={{ fontSize: '48px', opacity: 0.5, marginBottom: '16px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{title}</h3>
    <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '400px' }}>{message}</p>
  </div>
);
