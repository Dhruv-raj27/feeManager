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
      </div>
    </div>
  );
};

export default Login;

