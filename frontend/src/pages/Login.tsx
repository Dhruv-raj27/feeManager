import { useState } from "react";
import { login } from "../auth/authService";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const data = await login(email, password);

            // 🔍 DEBUG LINE (IMPORTANT)
            console.log("LOGIN RESPONSE:", data);

            loginUser(data.token, data.user);

            // ✅ REDIRECT AFTER LOGIN
            navigate("/");
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            setError("Invalid email or password");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "100px auto" }}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br /><br />

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
