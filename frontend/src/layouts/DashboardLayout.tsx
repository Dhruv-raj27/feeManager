import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, padding: 16, background: "#111", color: "#fff" }}>
        <h3>Fee Manager</h3>

        <nav style={{ marginTop: 24 }}>
          <p><a href="/dashboard">Dashboard</a></p>
          <p><a href="/students">Students</a></p>
          <p><a href="/fees">Fee Structure</a></p>
          <p><a href="/payments">Payments</a></p>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <p>{user?.fullName}</p>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* Page Content */}
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
