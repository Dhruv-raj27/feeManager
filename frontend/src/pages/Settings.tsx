import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchSettings, updateSettings } from "../services/settingsService";
import { fetchUsers, createUser, updateUserRole, deleteUser, type AppUser } from "../services/userService";
import { isValidSession, PHONE_REGEX } from "../constants";
import toast from "react-hot-toast";

/* ===================== TYPES ===================== */
interface SchoolSettings {
    school_name: string;
    address: string;
    contact_number: string;
    email: string;
    current_academic_session: string;
    logo_path: string;
}

const ROLES = ["Admin", "Accountant", "Receptionist"] as const;
type Role = typeof ROLES[number];

/* ===================== SCHOOL INFO TAB ===================== */
const SchoolInfoTab = ({ token }: { token: string }) => {
    const [form, setForm] = useState<SchoolSettings | null>(null);
    const [originalSession, setOriginalSession] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasSettings, setHasSettings] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchSettings(token).then((data) => {
            if (data && Object.keys(data).length > 0) {
                const s: SchoolSettings = {
                    school_name: data.school_name || "",
                    address: data.address || "",
                    contact_number: data.contact_number || "",
                    email: data.email || "",
                    current_academic_session: data.current_academic_session || "",
                    logo_path: data.logo_path || "",
                };
                setForm(s);
                setOriginalSession(s.current_academic_session);
                setHasSettings(true);
            }
        });
    }, [token]);

    if (!form) return <p style={{ color: "var(--text-secondary)" }}>Loading settings…</p>;

    const validate = (): Record<string, string> => {
        const errs: Record<string, string> = {};
        if (!form.school_name.trim()) errs.school_name = "School name is required";
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
            errs.email = "Enter a valid email address";
        if (form.contact_number.trim() && !PHONE_REGEX.test(form.contact_number.trim()))
            errs.contact_number = "Enter a valid 10-digit phone number";
        if (!form.current_academic_session.trim())
            errs.current_academic_session = "Academic session is required";
        else if (!isValidSession(form.current_academic_session.trim()))
            errs.current_academic_session = "Must be YYYY-YYYY format (e.g. 2025-2026)";
        return errs;
    };

    const handleSave = async () => {
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
        if (originalSession && form.current_academic_session.trim() !== originalSession) {
            const confirmed = window.confirm(
                `⚠️ You are changing the academic session from "${originalSession}" to "${form.current_academic_session.trim()}".\n\n` +
                "This will affect all new payment calculations going forward.\n\nAre you sure?"
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

    const field = { width: "100%", marginBottom: 4 } as const;
    const err = { color: "var(--danger-color)", fontSize: 12, marginBottom: 8, display: "block" } as const;

    return (
        <div style={{ maxWidth: 500 }}>
            <input placeholder="School Name *" value={form.school_name} style={field}
                onChange={(e) => setForm({ ...form, school_name: e.target.value })} />
            {errors.school_name && <span style={err}>{errors.school_name}</span>}

            <input placeholder="Academic Session (e.g. 2025-2026) *"
                value={form.current_academic_session} style={field}
                onChange={(e) => setForm({ ...form, current_academic_session: e.target.value })} />
            {errors.current_academic_session && <span style={err}>{errors.current_academic_session}</span>}

            <textarea placeholder="Address" value={form.address || ""} style={{ ...field, minHeight: 60 }}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />

            <input placeholder="Email" value={form.email || ""} style={field}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span style={err}>{errors.email}</span>}

            <input placeholder="Contact Number (10 digits)" value={form.contact_number || ""}
                style={field} maxLength={10}
                onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
            {errors.contact_number && <span style={err}>{errors.contact_number}</span>}

            <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
                {loading ? "Saving…" : hasSettings ? "Update Settings" : "Save Settings"}
            </button>
        </div>
    );
};

/* ===================== USER MANAGEMENT TAB ===================== */
const UserManagementTab = ({ token, currentUserUuid }: { token: string; currentUserUuid: string }) => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ full_name: "", email: "", role: "Accountant" as Role });
    const [adding, setAdding] = useState(false);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers(token);
            setUsers(data);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, [token]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.full_name.trim() || !newUser.email.trim()) {
            toast.error("Name and email are required");
            return;
        }
        setAdding(true);
        try {
            await createUser(newUser, token);
            toast.success(`User created! They must log in with: ChangeMe@FirstLogin`);
            setNewUser({ full_name: "", email: "", role: "Accountant" });
            setShowAddForm(false);
            await loadUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to create user");
        } finally {
            setAdding(false);
        }
    };

    const handleRoleChange = async (uuid: string, role: string) => {
        try {
            await updateUserRole(uuid, role, token);
            toast.success("Role updated");
            await loadUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to update role");
        }
    };

    const handleDelete = async (uuid: string, name: string) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await deleteUser(uuid, token);
            toast.success("User deleted");
            await loadUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete user");
        }
    };

    if (loading) return <p style={{ color: "var(--text-secondary)" }}>Loading users…</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {users.length} user{users.length !== 1 ? "s" : ""} — new users must login with <code style={{ background: "var(--bg-tertiary)", padding: "1px 6px", borderRadius: 4 }}>ChangeMe@FirstLogin</code>
                </p>
                <button className="btn-primary" onClick={() => setShowAddForm(v => !v)}>
                    {showAddForm ? "✕ Cancel" : "+ Add User"}
                </button>
            </div>

            {/* Add User Form */}
            {showAddForm && (
                <form onSubmit={handleAddUser} style={{
                    background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
                    borderRadius: 8, padding: 16, marginBottom: 20,
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end"
                }}>
                    <div>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Full Name *</label>
                        <input placeholder="e.g. Ramesh Kumar" value={newUser.full_name}
                            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Email *</label>
                        <input type="email" placeholder="e.g. ramesh@school.local" value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Role *</label>
                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" disabled={adding}>
                        {adding ? "Creating…" : "Create"}
                    </button>
                </form>
            )}

            {/* Users Table */}
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => {
                        const isMe = u.uuid === currentUserUuid;
                        return (
                            <tr key={u.uuid}>
                                <td style={{ fontWeight: 500 }}>
                                    {u.full_name}
                                    {isMe && <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "var(--text-secondary)" }}>(you)</span>}
                                </td>
                                <td style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{u.email}</td>
                                <td>
                                    <select
                                        value={u.role}
                                        disabled={isMe}
                                        onChange={(e) => handleRoleChange(u.uuid, e.target.value)}
                                        style={{ width: "auto", padding: "4px 8px", fontSize: "0.85rem" }}
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </td>
                                <td>
                                    {u.must_change_password
                                        ? <span className="badge badge-warning">Pending Setup</span>
                                        : <span className="badge badge-success">Active</span>
                                    }
                                </td>
                                <td>
                                    <button
                                        className="btn-danger"
                                        disabled={isMe}
                                        onClick={() => handleDelete(u.uuid, u.full_name)}
                                        style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

/* ===================== SETTINGS PAGE ===================== */
type Tab = "school" | "users";

const Settings = () => {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("school");

    // Decode UUID from JWT (we stored it in the token payload)
    const currentUserUuid = (() => {
        try {
            return JSON.parse(atob(token!.split(".")[1])).uuid as string;
        } catch { return ""; }
    })();

    if (!token) return null;

    const tabBtnStyle = (tab: Tab) => ({
        padding: "8px 20px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.9rem",
        background: activeTab === tab ? "var(--accent-color)" : "var(--bg-tertiary)",
        color: activeTab === tab ? "#fff" : "var(--text-secondary)",
        transition: "all 0.2s ease",
    });

    return (
        <div style={{ padding: 20, maxWidth: 800 }}>
            <h2 style={{ marginBottom: 4 }}>Settings</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20, marginTop: 0 }}>
                Manage school configuration and user accounts.
            </p>

            {/* Tab Bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <button style={tabBtnStyle("school")} onClick={() => setActiveTab("school")}>
                    🏫 School Info
                </button>
                {user?.role === "Admin" && (
                    <button style={tabBtnStyle("users")} onClick={() => setActiveTab("users")}>
                        👥 User Management
                    </button>
                )}
            </div>

            {activeTab === "school" && <SchoolInfoTab token={token} />}
            {activeTab === "users" && user?.role === "Admin" && (
                <UserManagementTab token={token} currentUserUuid={currentUserUuid} />
            )}
        </div>
    );
};

export default Settings;