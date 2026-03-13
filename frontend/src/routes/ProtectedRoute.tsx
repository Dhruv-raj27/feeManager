import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { type ReactElement } from "react";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
    const { user, mustChangePassword } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (mustChangePassword) {
        return <Navigate to="/change-password" replace />;
    }

    return children;
};

export default ProtectedRoute;