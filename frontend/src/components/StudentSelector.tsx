import { useState, useRef, useEffect } from "react";
import { type Student } from "../services/studentService";
import { CLASS_STANDARDS } from "../constants";

interface Props {
  students: Student[];
  selectedUUID: string;
  onSelect: (uuid: string) => void;
}

export default function StudentSelector({ students, selectedUUID, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive active student object if exists
  const activeStudent = students.find(s => s.uuid === selectedUUID);

  const filtered = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      (s.roll_number && s.roll_number.toLowerCase().includes(search.toLowerCase()));
    const matchesClass = classFilter ? s.class_standard === classFilter : true;
    return matchesSearch && matchesClass;
  }).slice(0, 50); // limit to protect DOM

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 600 }}>
      {/* Dropdown trigger */}
      <div 
        style={{ 
          padding: "10px 14px", 
          border: "1px solid var(--accent-color)", 
          borderRadius: 6, 
          background: "var(--bg-tertiary)",
          cursor: "pointer",
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center"
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontWeight: 500 }}>
          {activeStudent 
            ? `${activeStudent.name} (Roll: ${activeStudent.roll_number}, Class: ${activeStudent.class_standard})` 
            : "🔍 Click here to search and select a student..."}
        </span>
        <span style={{ fontSize: "0.8em", opacity: 0.7 }}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div style={{ 
          position: "absolute", 
          top: "100%", left: 0, right: 0, 
          marginTop: 4, 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border-color)", 
          borderRadius: 8, 
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 1000,
          maxHeight: 400,
          display: "flex", flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Filters */}
          <div style={{ padding: 12, borderBottom: "1px solid var(--border-color)", display: "flex", gap: 8, background: "var(--bg-tertiary)" }}>
            <input 
              autoFocus
              placeholder="Search name or roll number..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ flex: 1, padding: "8px 12px" }}
            />
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)}
              style={{ width: 120, padding: "8px 12px" }}
            >
              <option value="">All Classes</option>
              {CLASS_STANDARDS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, color: "var(--text-secondary)", textAlign: "center" }}>No matches found</div>
            ) : (
              filtered.map(s => (
                <div 
                  key={s.uuid}
                  onClick={() => {
                    onSelect(s.uuid);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-color)",
                    background: s.uuid === selectedUUID ? "var(--accent-color)" : "transparent",
                    color: s.uuid === selectedUUID ? "#fff" : "inherit",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (s.uuid !== selectedUUID) e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    if (s.uuid !== selectedUUID) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: "0.85em", color: s.uuid === selectedUUID ? "rgba(255,255,255,0.8)" : "var(--text-secondary)", marginTop: 4 }}>
                    Roll: {s.roll_number} &nbsp;•&nbsp; Class {s.class_standard} &nbsp;•&nbsp; Guardian: {s.father_name || "N/A"}
                  </div>
                </div>
              ))
            )}
            {students.length > 50 && filtered.length === 50 && (
               <div style={{ padding: 12, fontSize: "0.8em", textAlign: "center", color: "var(--accent-color)", background: "var(--bg-tertiary)", fontWeight: 500 }}>
                 Showing top 50 results. Keep typing to refine the search.
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
