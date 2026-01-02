import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { type ReactElement } from "react";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
    const { user } = useAuth();

    if(!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;