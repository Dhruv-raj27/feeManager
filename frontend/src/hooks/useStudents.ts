import { useEffect, useState } from "react";
import { fetchStudents, type Student } from "../services/studentService";
import { useAuth } from "../auth/AuthContext";

export const useStudents = () => {
    const { token } = useAuth();
    const [ students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(!token) return;

        fetchStudents(token)
            .then(setStudents)
            .catch(() => setError("Failed to load students"))
            .finally(() => setLoading(false));
    }, [token]);

    return { students, loading, error };
};