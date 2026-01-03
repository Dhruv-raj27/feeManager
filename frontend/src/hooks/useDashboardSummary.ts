import { useEffect, useState } from "react";
import { fetchDashboardSummary, type DashboardSummary } from "../services/dashboardService";
import { useAuth } from "../auth/AuthContext";

export const useDashboardSummary = () => {
    const { token } = useAuth();

    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            setLoading(true);

            fetchDashboardSummary(token)
                .then(setData)
                .catch(() => setError("Failed to load dashboard summary"))
                .finally(() => setLoading(false));
        }
    }, [token]);

    return { data, loading, error };
};