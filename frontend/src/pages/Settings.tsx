import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchSettings, updateSettings } from "../services/settingsService";

const Settings = () => {
    const { token } = useAuth();
    const [ form, setForm ] = useState<any>(null);
    const [ loading, setLoading ] = useState(false);
    const [hasSettings, setHasSettings] = useState(false);

    useEffect(() => {
        if(!token) return;
        fetchSettings(token).then((data) => {
            if (data && Object.keys(data).length > 0) {
                setForm({
                    school_name: data.school_name || "",
                    address: data.address || "",
                    contact_number: data.contact_number || "",
                    email: data.email || "",
                    current_academic_session: data.current_academic_session || "",
                    logo_path: data.logo_path || "",
                });

            setHasSettings(true);
        }
    });
    }, [token]);

    if(!form) return <p>Loading settings...</p>;

    const handleSave = async () => {
        if(!token) return;
        setLoading(true);
        try {
            await updateSettings(form, token);
            alert("Settings saved successfully");
        } catch {
            alert("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>School Settings</h2>

            <input
                placeholder="School Name"
                value={form.school_name}
                onChange={(e) => setForm({ ...form, school_name: e.target.value })
            }
            />

            <input
                placeholder="Academic Session (e.g. 2025-2026)"
                value={form.current_academic_session}
                onChange={(e) => setForm({ ...form, current_academic_session: e.target.value })
            }
            />

            <textarea
                placeholder="Address"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })
            }
            />

            <input
                placeholder="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })
            }
            />

            <input
                placeholder="Contact Number"
                value={form.contact_number || ""}
                onChange={(e) => setForm({ ...form, contact_number: e.target.value })
            }
            />

            <button onClick={handleSave}>
                {hasSettings ? "Update Settings" : "Save Settings"}
            </button>
        </div>
    );
};

export default Settings;