import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchSettings, updateSettings } from "../services/settingsService";
import { isValidSession, PHONE_REGEX } from "../constants";
import toast from "react-hot-toast";

interface SchoolSettings {
    school_name: string;
    address: string;
    contact_number: string;
    email: string;
    current_academic_session: string;
    logo_path: string;
}

const Settings = () => {
    const { token } = useAuth();
    const [form, setForm] = useState<SchoolSettings | null>(null);
    const [originalSession, setOriginalSession] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasSettings, setHasSettings] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!token) return;
        fetchSettings(token).then((data) => {
            if (data && Object.keys(data).length > 0) {
                const settings: SchoolSettings = {
                    school_name: data.school_name || "",
                    address: data.address || "",
                    contact_number: data.contact_number || "",
                    email: data.email || "",
                    current_academic_session: data.current_academic_session || "",
                    logo_path: data.logo_path || "",
                };
                setForm(settings);
                setOriginalSession(settings.current_academic_session);
                setHasSettings(true);
            }
        });
    }, [token]);

    if (!form) return <p>Loading settings...</p>;

    const validate = (): Record<string, string> => {
        const errs: Record<string, string> = {};

        if (!form.school_name.trim()) {
            errs.school_name = "School name is required";
        }

        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errs.email = "Enter a valid email address";
        }

        if (form.contact_number.trim() && !PHONE_REGEX.test(form.contact_number.trim())) {
            errs.contact_number = "Enter a valid 10-digit phone number";
        }

        if (!form.current_academic_session.trim()) {
            errs.current_academic_session = "Academic session is required";
        } else if (!isValidSession(form.current_academic_session.trim())) {
            errs.current_academic_session = "Must be YYYY-YYYY format (e.g. 2025-2026)";
        }

        return errs;
    };

    const handleSave = async () => {
        if (!token) return;

        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        // Warn if academic session is being changed
        if (
            originalSession &&
            form.current_academic_session.trim() !== originalSession
        ) {
            const confirmed = window.confirm(
                `⚠️ You are changing the academic session from "${originalSession}" to "${form.current_academic_session.trim()}".\n\n` +
                "This will affect all new payment calculations going forward.\n\n" +
                "Are you sure you want to proceed?"
            );
            if (!confirmed) return;
        }

        setLoading(true);
        try {
            await updateSettings(form, token);
            setOriginalSession(form.current_academic_session.trim());
            toast.success("Settings saved successfully");
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = { width: "100%", marginBottom: 4, padding: "8px", boxSizing: "border-box" as const };
    const errorStyle = { color: "#e74c3c", fontSize: 12, marginBottom: 8, display: "block" };

    return (
        <div style={{ padding: 20, maxWidth: 500 }}>
            <h2>School Settings</h2>

            <input placeholder="School Name *" value={form.school_name} style={fieldStyle}
                onChange={(e) => setForm({ ...form, school_name: e.target.value })} />
            {errors.school_name && <span style={errorStyle}>{errors.school_name}</span>}

            <input placeholder="Academic Session (e.g. 2025-2026) *"
                value={form.current_academic_session} style={fieldStyle}
                onChange={(e) => setForm({ ...form, current_academic_session: e.target.value })} />
            {errors.current_academic_session && <span style={errorStyle}>{errors.current_academic_session}</span>}

            <textarea placeholder="Address" value={form.address || ""} style={{ ...fieldStyle, minHeight: 60 }}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />

            <input placeholder="Email" value={form.email || ""} style={fieldStyle}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}

            <input placeholder="Contact Number (10 digits)" value={form.contact_number || ""}
                style={fieldStyle} maxLength={10}
                onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
            {errors.contact_number && <span style={errorStyle}>{errors.contact_number}</span>}

            <button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : hasSettings ? "Update Settings" : "Save Settings"}
            </button>
        </div>
    );
};

export default Settings;