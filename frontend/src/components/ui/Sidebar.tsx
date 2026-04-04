import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const NAV_LINKS = [
  { to: "/dashboard",     label: "📊 Dashboard",     roles: ["Admin", "Accountant", "Receptionist"] },
  { to: "/students",      label: "🎓 Students",       roles: ["Admin", "Accountant", "Receptionist"] },
  { to: "/fee-structure", label: "💰 Fee Structure",  roles: ["Admin", "Accountant"] },
  { to: "/payments",      label: "💳 Payments",       roles: ["Admin", "Accountant"] },
  { to: "/ledger",        label: "📒 Ledger",         roles: ["Admin", "Accountant"] },
  { to: "/settings",      label: "⚙️ Settings",       roles: ["Admin"] },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  Admin:        "rgba(99,102,241,0.2)",
  Accountant:   "rgba(16,185,129,0.2)",
  Receptionist: "rgba(245,158,11,0.2)",
};
const ROLE_TEXT_COLORS: Record<string, string> = {
  Admin:        "#6366f1",
  Accountant:   "#10b981",
  Receptionist: "#f59e0b",
};

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "10px 16px",
  margin: "4px 0",
  borderRadius: 6,
  color: isActive ? "#fff" : "var(--text-secondary)",
  background: isActive ? "var(--accent-color)" : "transparent",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
});

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleLinks = NAV_LINKS.filter(link =>
    user?.role && link.roles.includes(user.role)
  );

  return (
    <div style={sidebarStyle}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>Fee Manager</h2>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          School Fee Management
        </p>
      </div>

      <nav style={{ flex: 1 }}>
        {visibleLinks.map(link => (
          <NavLink key={link.to} to={link.to} style={linkStyle}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14, marginTop: 8 }}>
        <p style={{ margin: "0 0 2px 0", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
          {user?.fullName || "User"}
        </p>
        <span style={{
          display: "inline-block",
          fontSize: "0.7rem",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 999,
          background: ROLE_BADGE_COLORS[user?.role || ""] || "var(--bg-tertiary)",
          color: ROLE_TEXT_COLORS[user?.role || ""] || "var(--text-secondary)",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          {user?.role || ""}
        </span>
        <br />
        <button onClick={handleLogout} style={{ width: "100%", marginTop: 4 }}>
          Logout
        </button>
      </div>
    </div>
  );
};

const sidebarStyle = {
  width: 220,
  background: "var(--bg-tertiary)",
  borderRight: "1px solid var(--border-color)",
  color: "var(--text-primary)",
  padding: "20px 14px",
  display: "flex",
  flexDirection: "column" as const,
  minHeight: "100vh",
};

export default Sidebar;
