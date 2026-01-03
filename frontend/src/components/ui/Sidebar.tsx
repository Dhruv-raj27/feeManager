import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: "block",
    padding: "10px 14px",
    marginBottom: 6,
    color: isActive ? "#ffffff" : "#9ca3af",
    backgroundColor: isActive ? "#2563eb" : "transparent",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 500,
  });

  return (
    <aside
      style={{
        width: 240,
        background: "#0f172a",
        color: "#fff",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top */}
      <div>
        <h2 style={{ marginBottom: 20 }}>Fee Manager</h2>

        <nav>
          <NavLink to="/" style={linkStyle} end>
            Dashboard
          </NavLink>

          <NavLink to="/students" style={linkStyle}>
            Students
          </NavLink>
{/* 
          <NavLink to="/fee-structure" style={linkStyle}>
            Fee Structure
          </NavLink>

          <NavLink to="/payments" style={linkStyle}>
            Payments
          </NavLink> */}
        </nav>
      </div>

      {/* Bottom */}
      <div>
        <p style={{ fontSize: 14, marginBottom: 10 }}>
          {user?.fullName}
          <br />
          <span style={{ color: "#9ca3af" }}>{user?.role}</span>
        </p>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: 6,
            border: "none",
            background: "#1f2937",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
