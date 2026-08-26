import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ClipboardList, Leaf, Map, MapPin, Navigation, Search } from "lucide-react";
import { getDiseaseReports, getFarms } from "../../api/mongoService";

const P = {
  red: "#C62828", redBg: "#fef2f2", yellow: "#F9A825", yellowBg: "#fffde7",
  green: "#4CAF50", greenBg: "#f0fdf4", purple: "#6d28d9", purpleBg: "#f5f3ff",
  gray: "#6b7280", dark: "#1a1a2e", white: "#ffffff", mapBg: "#1a2810",
};

const normalize = (value) => String(value || "").trim().toLowerCase();

function coordinatesFor(farm) {
  const latitude = Number(farm.latitude);
  const longitude = Number(farm.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

function mapBounds(farms, outbreaks) {
  const points = [...farms, ...outbreaks]
    .map(coordinatesFor)
    .filter(Boolean);
  if (!points.length) return { minLat: 6, maxLat: 37, minLon: 68, maxLon: 98 };

  const lats = points.map(point => point.latitude);
  const lons = points.map(point => point.longitude);
  const latPad = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.2, 0.15);
  const lonPad = Math.max((Math.max(...lons) - Math.min(...lons)) * 0.2, 0.15);
  return {
    minLat: Math.min(...lats) - latPad,
    maxLat: Math.max(...lats) + latPad,
    minLon: Math.min(...lons) - lonPad,
    maxLon: Math.max(...lons) + lonPad,
  };
}

function pointToMap(farm, bounds, width, height) {
  const { latitude, longitude } = coordinatesFor(farm);
  const x = ((longitude - bounds.minLon) / (bounds.maxLon - bounds.minLon || 1)) * width;
  const y = height - ((latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * height;
  return { x: Math.max(18, Math.min(width - 18, x)), y: Math.max(18, Math.min(height - 18, y)) };
}

function riskForFarm(farmId, reports) {
  const risks = reports.filter(report => report.farmId === farmId).map(report => report.riskLevel);
  if (risks.includes("HIGH")) return "HIGH";
  if (risks.includes("MODERATE")) return "MODERATE";
  if (risks.includes("LOW")) return "LOW";
  return "NO REPORTS";
}

function riskColor(risk) {
  if (risk === "HIGH") return P.red;
  if (risk === "MODERATE") return P.yellow;
  return P.green;
}

function isAssignedToVet(farm, reports, user) {
  const vetId = normalize(user?.userId || user?.id);
  const vetName = normalize(user?.fullName || user?.name);
  const directAssignments = [
    farm.veterinarianId,
    farm.assignedVeterinarianId,
    farm.assignedVetId,
    farm.vetId,
    ...(Array.isArray(farm.assignedVeterinarianIds) ? farm.assignedVeterinarianIds : []),
  ].map(normalize);

  if (vetId && directAssignments.includes(vetId)) return true;

  return reports.some(report => report.farmId === farm.farmId && (
    (vetId && normalize(report.veterinarianId) === vetId) ||
    (vetName && normalize(report.veterinarianName) === vetName)
  ));
}

function OutbreakMap({ farms, outbreaks, selectedFarm, onSelectFarm }) {
  const width = 760;
  const height = 360;
  const bounds = mapBounds(farms, outbreaks);
  const visibleOutbreaks = outbreaks.filter(coordinatesFor);

  return (
    <div style={{ position: "relative", background: P.mapBg, minHeight: 260 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ display: "block", width: "100%", minHeight: 260 }} role="img" aria-label="Outbreak map showing assigned farms">
        {[...Array(9)].map((_, index) => <line key={`row-${index}`} x1="0" y1={(index * height) / 8} x2={width} y2={(index * height) / 8} stroke="#2d4a1a" strokeWidth="0.7" />)}
        {[...Array(13)].map((_, index) => <line key={`column-${index}`} x1={(index * width) / 12} y1="0" x2={(index * width) / 12} y2={height} stroke="#2d4a1a" strokeWidth="0.7" />)}

        {visibleOutbreaks.map(report => {
          const { x, y } = pointToMap(report, bounds, width, height);
          return (
            <g key={report.reportId} aria-label={`Outbreak: ${report.suspectedDisease}`}>
              <circle cx={x} cy={y} r="16" fill={P.red} fillOpacity="0.13" />
              <circle cx={x} cy={y} r="6" fill={P.red} stroke={P.white} strokeWidth="2" />
              <path d={`M ${x - 3} ${y - 3} L ${x + 3} ${y + 3} M ${x + 3} ${y - 3} L ${x - 3} ${y + 3}`} stroke={P.white} strokeWidth="1.5" />
            </g>
          );
        })}

        {farms.filter(coordinatesFor).map(farm => {
          const { x, y } = pointToMap(farm, bounds, width, height);
          const selected = selectedFarm?.farmId === farm.farmId;
          const color = riskColor(farm.risk);
          return (
            <g key={farm.farmId} onClick={() => onSelectFarm(farm)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={selected ? 17 : 12} fill={color} fillOpacity="0.18" />
              <circle cx={x} cy={y} r={selected ? 8 : 6} fill={color} stroke={P.white} strokeWidth="2" />
              {selected && <text x={x} y={y - 20} textAnchor="middle" fill={P.white} fontSize="11" fontWeight="700">{farm.farmName?.slice(0, 22)}</text>}
            </g>
          );
        })}
        <text x={width - 18} y="20" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11">N</text>
      </svg>
    </div>
  );
}

export default function VetAssignedFarmsModule({ farms = [], user }) {
  const [reports, setReports] = useState([]);
  const [farmData, setFarmData] = useState(farms);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFarm, setSelectedFarm] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([getDiseaseReports(), getFarms()])
      .then(([reportData, latestFarms]) => {
        if (!active) return;
        setReports(Array.isArray(reportData) ? reportData : []);
        setFarmData(Array.isArray(latestFarms) ? latestFarms : farms);
      })
      .catch(() => {
        if (!active) return;
        setReports([]);
        setFarmData(farms);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [farms]);

  const assignedFarms = useMemo(() => farmData
    .filter(farm => isAssignedToVet(farm, reports, user))
    .map(farm => ({ ...farm, risk: riskForFarm(farm.farmId, reports) })), [farmData, reports, user]);

  const outbreakReports = useMemo(() => reports.filter(report => ["HIGH", "MODERATE"].includes(report.riskLevel)), [reports]);
  const visibleFarms = useMemo(() => {
    const needle = normalize(search);
    return !needle ? assignedFarms : assignedFarms.filter(farm => [farm.farmName, farm.farmId, farm.district, farm.farmType].some(value => normalize(value).includes(needle)));
  }, [assignedFarms, search]);

  const selectFarm = (farm) => {
    setSelectedFarm(farm);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const visitFarm = (farm) => {
    selectFarm(farm);
    const coordinates = coordinatesFor(farm);
    if (coordinates) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`, "_blank", "noopener,noreferrer");
    }
  };

  const highRiskCount = assignedFarms.filter(farm => farm.risk === "HIGH").length;

  return (
    <div style={{ fontFamily: "Inter", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "16px 20px", background: P.purpleBg, border: `1px solid ${P.purple}28`, borderRadius: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 8, background: P.purple, display: "flex", alignItems: "center", justifyContent: "center" }}><Map size={20} color={P.white} /></div>
        <div>
          <h2 style={{ margin: 0, color: P.dark, fontFamily: "Poppins", fontSize: 17 }}>My Assigned Farms</h2>
          <p style={{ margin: "3px 0 0", color: P.gray, fontSize: 12 }}>Outbreak context and visits for {user?.fullName || user?.name || "this veterinarian"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {[[Leaf, "Assigned farms", assignedFarms.length, P.purple, P.purpleBg], [AlertTriangle, "High-risk farms", highRiskCount, P.red, P.redBg], [ClipboardList, "Open reports", reports.filter(report => assignedFarms.some(farm => farm.farmId === report.farmId) && !["RESOLVED", "RULED_OUT"].includes(report.status)).length, P.yellow, P.yellowBg]].map(([Icon, label, value, color, background]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, background: P.white, border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={15} color={color} /></div>
            <div><div style={{ fontSize: 19, fontWeight: 700, color: P.dark }}>{loading ? "-" : value}</div><div style={{ fontSize: 11, color: P.gray }}>{label}</div></div>
          </div>
        ))}
      </div>

      <section ref={mapRef} style={{ background: P.white, border: "1px solid rgba(109,40,217,0.2)", borderRadius: 8, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}>
          <div><h3 style={{ margin: 0, color: P.dark, fontFamily: "Poppins", fontSize: 14 }}>Assigned farms outbreak map</h3><p style={{ margin: "3px 0 0", color: P.gray, fontSize: 11 }}>Farm pins belong only to the signed-in veterinarian. Red markers are reported outbreaks.</p></div>
          <div style={{ display: "flex", gap: 10, fontSize: 10, color: P.gray }}><span><b style={{ color: P.red }}>●</b> Outbreak</span><span><b style={{ color: P.yellow }}>●</b> Moderate risk</span><span><b style={{ color: P.green }}>●</b> Assigned farm</span></div>
        </div>
        <OutbreakMap farms={assignedFarms} outbreaks={outbreakReports} selectedFarm={selectedFarm} onSelectFarm={setSelectedFarm} />
        {selectedFarm && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 18px", background: "#fafafa", flexWrap: "wrap" }}><div><strong style={{ fontSize: 13, color: P.dark }}>{selectedFarm.farmName}</strong><span style={{ marginLeft: 8, color: P.gray, fontSize: 11 }}>{selectedFarm.farmId} · {selectedFarm.district || "Location unavailable"} · {selectedFarm.risk}</span></div><button onClick={() => visitFarm(selectedFarm)} title="Open directions to this farm" style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 6, padding: "8px 12px", background: P.purple, color: P.white, cursor: "pointer", fontWeight: 700, fontSize: 12 }}><Navigation size={14} /> Visit farm</button></div>}
      </section>

      <section style={{ background: P.white, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}><h3 style={{ margin: 0, color: P.dark, fontFamily: "Poppins", fontSize: 14 }}>All assigned farms</h3><label style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 6 }}><Search size={14} color={P.gray} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search farms" style={{ border: "none", outline: "none", background: "transparent", color: P.dark, fontSize: 12, width: 180 }} /></label></div>
        {loading ? <div style={{ padding: 28, textAlign: "center", color: P.gray, fontSize: 12 }}>Loading assigned farms...</div> : visibleFarms.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: P.gray, fontSize: 12 }}>No farms are assigned to this veterinarian yet.</div> : visibleFarms.map(farm => <div key={farm.farmId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `${riskColor(farm.risk)}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={16} color={riskColor(farm.risk)} /></div><div style={{ flex: 1, minWidth: 190 }}><div style={{ color: P.dark, fontWeight: 700, fontSize: 13 }}>{farm.farmName}</div><div style={{ color: P.gray, fontSize: 11, marginTop: 2 }}>{farm.farmId} · {farm.farmType || "Farm"} · {farm.district || "Location unavailable"}</div></div><span style={{ color: riskColor(farm.risk), background: `${riskColor(farm.risk)}18`, borderRadius: 999, padding: "4px 8px", fontSize: 10, fontWeight: 700 }}>{farm.risk.replace("NO REPORTS", "NO REPORTS")}</span><button onClick={() => visitFarm(farm)} title={`Visit ${farm.farmName}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${P.purple}30`, borderRadius: 6, padding: "8px 11px", background: P.purpleBg, color: P.purple, cursor: "pointer", fontWeight: 700, fontSize: 12 }}><Navigation size={14} /> Visit</button></div>)}
      </section>
    </div>
  );
}
