import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "10px 16px",
  margin: "6px 0",
  borderRadius: 6,
  color: isActive ? "#fff" : "var(--text-secondary)",
  background: isActive ? "var(--accent-color)" : "transparent",
  textDecoration: "none",
  fontWeight: 500,
  transition: "all 0.2s ease"
});

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={sidebarStyle}>
      <h2>Fee Manager</h2>

      <NavLink to="/" style={linkStyle}>
        Dashboard
      </NavLink>

      <NavLink to="/students" style={linkStyle}>
        Students
      </NavLink>

      <NavLink to="/fee-structure" style={linkStyle}>
        Fee Structure
      </NavLink>

      <NavLink to="/payments" style={linkStyle}>
        Payments
      </NavLink>

      <NavLink to="/settings" style={linkStyle}>
        Settings
      </NavLink>

      <NavLink to="/ledger" style={linkStyle}>
        Ledger
      </NavLink>

      <div style={{ marginTop: "auto" }}>
        <p>{user?.fullName || "User"}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

const sidebarStyle = {
  width: 240,
  background: "var(--bg-tertiary)",
  borderRight: "1px solid var(--border-color)",
  color: "var(--text-primary)",
  padding: 16,
  display: "flex",
  flexDirection: "column" as const,
};

export default Sidebar;
