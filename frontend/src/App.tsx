import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

/* ---------------- Dashboard ---------------- */

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h2>
        Welcome, {user?.fullName} ({user?.role})
      </h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

/* ---------------- Login Route Wrapper ----------------
   Prevents logged-in users from seeing /login again
------------------------------------------------------ */

const LoginRoute = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
};

/* ---------------- App ---------------- */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<LoginRoute />} />

          {/* Protected Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
