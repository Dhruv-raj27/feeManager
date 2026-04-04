import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AppLayout from "./layouts/AppLayout";
import FeeStructure from "./pages/FeeStructure";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import Ledger from "./pages/Ledger";

/* ---------- App ---------- */

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Protected App */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students"  element={<Students />} />
            <Route path="/fee-structure" element={
              <ProtectedRoute allowedRoles={["Admin", "Accountant"]}>
                <FeeStructure />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute allowedRoles={["Admin", "Accountant"]}>
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="/ledger" element={
              <ProtectedRoute allowedRoles={["Admin", "Accountant"]}>
                <Ledger />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Settings />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
