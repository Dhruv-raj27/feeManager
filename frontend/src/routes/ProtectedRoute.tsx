import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { type ReactElement } from "react";

interface Props {
    children: ReactElement;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const { user, mustChangePassword } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (mustChangePassword) {
        return <Navigate to="/change-password" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;