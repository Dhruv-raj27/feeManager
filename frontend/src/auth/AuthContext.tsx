import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  mustChangePassword: boolean;
  loginUser: (token: string, user: User, mustChangePassword?: boolean) => void;
  clearMustChangePassword: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      // Check token expiry by decoding JWT payload
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token expired — clear and force re-login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          return;
        }
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        return;
      }

      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginUser = (token: string, user: User, mustChange: boolean = false) => {
    setToken(token);
    setUser(user);
    setMustChangePassword(mustChange);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  };

  const clearMustChangePassword = () => {
    setMustChangePassword(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, mustChangePassword, loginUser, clearMustChangePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

