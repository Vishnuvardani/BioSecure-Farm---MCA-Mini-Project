import { createRoot } from "react-dom/client";
import { useState } from "react";
import { DataProvider, useData } from "./context/DataContext";
import App from "./app/App.jsx";
import BiosecurityAssessmentModule from "./app/modules/BiosecurityAssessmentModule.jsx";
import DiseaseReportModule         from "./app/modules/DiseaseReportModule.jsx";
import GISOutbreakMapModule        from "./app/modules/GISOutbreakMapModule.jsx";
import NotificationSystemModule    from "./app/modules/NotificationSystemModule.jsx";
import VetInspectionModule         from "./app/modules/VetInspectionModule.jsx";
import NewModulesPanel             from "./app/modules/NewModulesPanel.jsx";
import "./styles/index.css";

const ROLE_MAP = {
  farmer:       "Farmer",
  veterinarian: "Veterinarian",
  government:   "Government Officer",
  admin:        "Admin",
};

const ROLE_REVERSE = {
  "Farmer":             "farmer",
  "Veterinarian":       "veterinarian",
  "Government Officer": "government",
  "Admin":              "admin",
};

// ── New module renderer ───────────────────────────────────────────────────
function NewModulePage({ module, farms, user, role }) {
  switch (module) {
    case "Biosecurity Assessment":
      return <BiosecurityAssessmentModule farms={farms} user={user} />;
    case "Disease Report":
      return <DiseaseReportModule farms={farms} user={user} />;
    case "Outbreak Map":
      return <GISOutbreakMapModule />;
    case "Notifications":
      return <NotificationSystemModule user={user} role={ROLE_MAP[role] || "Farmer"} />;
    case "Vet Inspection":
      return <VetInspectionModule user={user} />;
    default:
      return null;
  }
}

// ── Sidebar colors per role ───────────────────────────────────────────────
const ROLE_BG = {
  farmer: "#1a2010", veterinarian: "#1e0838",
  government: "#0d1a2d", admin: "#1a2010",
};

// ── Loading ───────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#1a2010,#2d3d1a,#808034)" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DBD4FF" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <p style={{ color: "#DBD4FF", fontFamily: "Poppins", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>BioSecure Farm</p>
      <p style={{ color: "rgba(219,212,255,0.6)", fontSize: 12, marginBottom: 28 }}>Loading data from MongoDB...</p>
      <div style={{ width: 180, height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#DBD4FF,#808034)", animation: "lb 1.4s ease-in-out infinite", width: "55%" }} />
      </div>
      <style>{`@keyframes lb{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}`}</style>
    </div>
  );
}

// ── Error ─────────────────────────────────────────────────────────────────
function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFE3", fontFamily: "Inter" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, maxWidth: 400, boxShadow: "0 4px 32px rgba(128,128,52,0.12)", textAlign: "center", border: "1px solid rgba(128,128,52,0.1)" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 style={{ fontFamily: "Poppins", color: "#1a1a0e", marginBottom: 8, fontSize: 17 }}>MongoDB Not Connected</h2>
        <div style={{ background: "#f8f8f0", borderRadius: 10, padding: "10px 14px", textAlign: "left", marginBottom: 18, fontSize: 11, color: "#6b6b4a" }}>
          <p style={{ margin: "3px 0" }}>1. MongoDB running on <code>localhost:27017</code></p>
          <p style={{ margin: "3px 0" }}>2. Run: <code>node server/index.js</code></p>
          <p style={{ margin: "3px 0" }}>3. Run: <code>node data/seed.js</code></p>
        </div>
        <p style={{ color: "#C62828", fontSize: 10, marginBottom: 18, fontFamily: "monospace" }}>{error}</p>
        <button onClick={onRetry} style={{ background: "linear-gradient(135deg,#808034,#5c5c24)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 28px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          Retry Connection
        </button>
      </div>
    </div>
  );
}

// ── New module full-screen shell ──────────────────────────────────────────
function NewModuleShell({ module, farms, user, role, onBack }) {
  const bg = ROLE_BG[role] || "#1a2010";
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#FFFFE3", fontFamily: "Inter" }}>
      {/* Mini sidebar */}
      <div style={{ width: 200, background: bg, display: "flex", flexDirection: "column", padding: "16px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "0 6px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DBD4FF" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "Poppins" }}>BioSecure</span>
        </div>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 8, textAlign: "left", width: "100%" }}>
          ← Back to Dashboard
        </button>
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
          {module}
        </div>
        <div style={{ marginTop: "auto", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0, fontWeight: 600 }}>{user?.name || "User"}</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, margin: "2px 0 0" }}>{ROLE_MAP[role] || role}</p>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Topbar */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", background: "rgba(255,255,227,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(128,128,52,0.1)" }}>
          <h1 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: "#1a1a0e", margin: 0 }}>{module}</h1>
          <span style={{ fontSize: 9, fontWeight: 700, background: "#808034", color: "#fff", padding: "2px 8px", borderRadius: 8 }}>LIVE · MongoDB</span>
        </div>
        <div style={{ padding: 24 }}>
          <NewModulePage module={module} farms={farms} user={user} role={role} />
        </div>
      </div>
    </div>
  );
}

// ── DataConsumer ──────────────────────────────────────────────────────────
function DataConsumer({ mongoRole, onLogout }) {
  const { user, farms, livestock, vaccinations, diseases, biosecurity,
          vetReports, alerts, gisLocations, notifications, analytics,
          allUsers, loading, error, reload } = useData();

  const [activeNewModule, setActiveNewModule] = useState(null);

  // Expose setter globally so NewModulesPanel can call it
  if (typeof window !== "undefined") {
    window.__biosecureNewModule = setActiveNewModule;
  }

  const shortRole = ROLE_REVERSE[mongoRole] || "farmer";

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen error={error} onRetry={reload} />;

  if (activeNewModule) {
    return (
      <NewModuleShell
        module={activeNewModule}
        farms={farms}
        user={user}
        role={shortRole}
        onBack={() => setActiveNewModule(null)}
      />
    );
  }

  return (
    <>
      <App
        mongoRole={mongoRole}
        mongoUser={user}
        mongoFarms={farms}
        mongoLivestock={livestock}
        mongoVaccinations={vaccinations}
        mongoDiseases={diseases}
        mongoBiosecurity={biosecurity}
        mongoVetReports={vetReports}
        mongoAlerts={alerts}
        mongoGIS={gisLocations}
        mongoNotifications={notifications}
        mongoAnalytics={analytics}
        mongoAllUsers={allUsers}
        onLogout={onLogout}
      />
      {/* Floating panel to access new modules from any page */}
      <NewModulesPanel role={shortRole} />
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
function Root() {
  const [activeRole, setActiveRole] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  if (!activeRole) {
    return (
      <App
        onMongoLogin={(role, user) => {
          setActiveRole(ROLE_MAP[role] || "Farmer");
          setActiveUser(user || null);
        }}
      />
    );
  }

  return (
    <DataProvider role={activeRole} user={activeUser}>
      <DataConsumer
        mongoRole={activeRole}
        onLogout={() => {
          setActiveRole(null);
          setActiveUser(null);
        }}
      />
    </DataProvider>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
