import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/authService";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const data = await login(trimmedEmail, trimmedPassword);

      loginUser(data.token, data.user, data.mustChangePassword);

      if (data.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 300, width: "100%", padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "var(--accent-color)" }}>Fee Management</h1>
        <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)" }}>System Administrator</p>
      </div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <details style={{ marginTop: 24, fontSize: "0.8rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-color)", paddingTop: 12 }}>
        <summary style={{ cursor: "pointer", userSelect: "none" }}>First time setup?</summary>
        <div style={{ marginTop: 8, padding: "10px 12px", background: "var(--card-bg)", borderRadius: 6, border: "1px solid var(--border-color)" }}>
          <p style={{ margin: "0 0 6px 0" }}>Use the default admin credentials on a fresh install:</p>
          <p style={{ margin: "2px 0", fontFamily: "monospace" }}>📧 admin@aadharshila.local</p>
          <p style={{ margin: "2px 0", fontFamily: "monospace" }}>🔑 ChangeMe@FirstLogin</p>
          <p style={{ margin: "8px 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)" }}>You will be prompted to set a new password after logging in.</p>
        </div>
      </details>

      </div>
    </div>
  );
};

export default Login;
