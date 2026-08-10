/**
 * BioSecure Farm - App With MongoDB Data
 * Replaces static hardcoded data with live MongoDB data after login.
 * Import this in main.jsx instead of App.jsx to enable MongoDB integration.
 */
import { useState } from "react";
import { DataProvider, useData } from "../context/DataContext";

// ── Role-to-MongoDB role mapping ──────────────────────────────────────────
const ROLE_MAP = {
  farmer:       "Farmer",
  veterinarian: "Veterinarian",
  government:   "Government Officer",
  admin:        "Admin",
};

// ── Loading screen shown while MongoDB data is fetching ───────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg, #1a2010 0%, #2d3d1a 40%, #808034 100%)",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "rgba(255,255,255,0.12)", display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: 24,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DBD4FF" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <p style={{ color: "#DBD4FF", fontFamily: "Poppins", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        BioSecure Farm
      </p>
      <p style={{ color: "rgba(219,212,255,0.6)", fontSize: 13, marginBottom: 32 }}>
        Loading data from MongoDB...
      </p>
      <div style={{ width: 200, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4,
          background: "linear-gradient(90deg, #DBD4FF, #808034)",
          animation: "loadbar 1.5s ease-in-out infinite",
          width: "60%",
        }}/>
      </div>
      <style>{`@keyframes loadbar { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }`}</style>
    </div>
  );
}

// ── Error screen shown if MongoDB is not reachable ────────────────────────
function ErrorScreen({ error, onRetry }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#FFFFE3", fontFamily: "Inter",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 40, maxWidth: 420,
        boxShadow: "0 4px 32px rgba(128,128,52,0.12)", textAlign: "center",
        border: "1px solid rgba(128,128,52,0.1)",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: "#fef2f2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "Poppins", color: "#1a1a0e", marginBottom: 8, fontSize: 18 }}>
          MongoDB Not Connected
        </h2>
        <p style={{ color: "#6b6b4a", fontSize: 13, marginBottom: 8 }}>
          Could not connect to the API server. Make sure:
        </p>
        <div style={{
          background: "#f8f8f0", borderRadius: 10, padding: "12px 16px",
          textAlign: "left", marginBottom: 20, fontSize: 12, color: "#6b6b4a",
        }}>
          <p style={{ margin: "4px 0" }}>1. MongoDB is running on <code>localhost:27017</code></p>
          <p style={{ margin: "4px 0" }}>2. Run: <code>node server/index.js</code></p>
          <p style={{ margin: "4px 0" }}>3. Run: <code>node data/seed.js</code></p>
        </div>
        <p style={{ color: "#D32F2F", fontSize: 11, marginBottom: 20, fontFamily: "monospace" }}>
          {error}
        </p>
        <button
          onClick={onRetry}
          style={{
            background: "linear-gradient(135deg, #808034, #5c5c24)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "12px 32px", fontWeight: 600, cursor: "pointer", fontSize: 14,
          }}
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}

// ── Inner component that consumes DataContext ─────────────────────────────
function DataConsumer({ AppComponent, role, onLogout }) {
  const { user, farms, livestock, vaccinations, diseases, biosecurity,
          vetReports, alerts, gisLocations, notifications, analytics,
          allUsers, loading, error, reload } = useData();

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen error={error} onRetry={reload} />;

  // Pass all MongoDB data as props to the original App component
  return (
    <AppComponent
      mongoRole={role}
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
  );
}

// ── Main export: wraps App with MongoDB DataProvider ─────────────────────
export default function AppWithData({ AppComponent }) {
  const [activeRole, setActiveRole] = useState(null);

  if (!activeRole) {
    // Show a minimal role selector before loading MongoDB data
    return (
      <AppComponent
        onMongoLogin={(role) => setActiveRole(ROLE_MAP[role] || "Farmer")}
      />
    );
  }

  return (
    <DataProvider role={activeRole}>
      <DataConsumer
        AppComponent={AppComponent}
        role={activeRole}
        onLogout={() => setActiveRole(null)}
      />
    </DataProvider>
  );
}
