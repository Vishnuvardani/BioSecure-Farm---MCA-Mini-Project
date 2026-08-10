/**
 * NewModulesPanel.jsx
 * Renders a floating panel of new module shortcuts that appears
 * on top of the existing App dashboard. Connects to the new modules
 * via the window.__biosecureNewModule bridge.
 */
import { useState } from "react";
import { Shield, AlertTriangle, MapPin, Bell, Stethoscope, ChevronRight, X } from "lucide-react";

const NEW_MODULES = [
  { label: "Biosecurity Assessment", icon: Shield,        color: "#808034", desc: "Score your farm biosecurity (0–100)" },
  { label: "Disease Report",         icon: AlertTriangle, color: "#C62828", desc: "Report suspected disease symptoms" },
  { label: "Outbreak Map",           icon: MapPin,        color: "#1565C0", desc: "Live GIS outbreak map with risk zones" },
  { label: "Notifications",          icon: Bell,          color: "#F9A825", desc: "Role-based notification center" },
  { label: "Vet Inspection",         icon: Stethoscope,   color: "#6d28d9", desc: "Veterinary inspection workflow" },
];

export default function NewModulesPanel({ role }) {
  const [open, setOpen] = useState(false);

  const navigate = (label) => {
    if (typeof window !== "undefined" && window.__biosecureNewModule) {
      window.__biosecureNewModule(label);
    }
    setOpen(false);
  };

  // Only show relevant modules per role
  const visible = NEW_MODULES.filter(m => {
    if (m.label === "Vet Inspection" && role !== "veterinarian") return false;
    return true;
  });

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #808034, #5c5c24)",
          border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(128,128,52,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 22, fontWeight: 700,
          transition: "transform 0.2s",
        }}
        title="New Modules"
      >
        {open ? <X size={20} /> : "⚡"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 998,
          background: "#fff", borderRadius: 18, padding: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)", width: 280,
          border: "1px solid rgba(128,128,52,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontFamily: "Poppins", fontSize: 13, fontWeight: 700, color: "#1a1a0e", margin: 0 }}>
              New Modules
            </p>
            <span style={{ fontSize: 10, background: "#808034", color: "#fff", padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>
              LIVE
            </span>
          </div>
          {visible.map(m => {
            const Icon = m.icon;
            return (
              <button key={m.label} onClick={() => navigate(m.label)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "#f9fafb", marginBottom: 6, textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = m.color + "12"}
                onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: m.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={m.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1a0e", margin: 0 }}>{m.label}</p>
                  <p style={{ fontSize: 10, color: "#6b7280", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.desc}</p>
                </div>
                <ChevronRight size={13} color="#9ca3af" />
              </button>
            );
          })}
          <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", marginTop: 8, marginBottom: 0 }}>
            Connected to MongoDB · Live data
          </p>
        </div>
      )}
    </>
  );
}
