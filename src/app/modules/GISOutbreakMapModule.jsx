import { useState, useEffect } from "react";
import { MapPin, AlertTriangle, RefreshCw, Layers, ZoomIn, ZoomOut, Info } from "lucide-react";
import { getGISFarms, getGISOutbreaks, getNearbyFarms } from "../../api/mongoService";

const P = {
  red: "#C62828", redBg: "#fef2f2",
  yellow: "#F9A825", yellowBg: "#fffde7",
  green: "#4CAF50", greenBg: "#f0fdf4",
  orange: "#E65100", orangeBg: "#fff3e0",
  blue: "#1565C0", blueBg: "#e3f2fd",
  gray: "#6b7280", dark: "#1a1a2e", white: "#ffffff",
  olive: "#808034", mapBg: "#1a2810",
};

// Convert lat/lon to SVG x/y within a bounding box
function latLonToXY(lat, lon, bounds, svgW, svgH) {
  const { minLat, maxLat, minLon, maxLon } = bounds;
  const x = ((lon - minLon) / (maxLon - minLon)) * svgW;
  const y = svgH - ((lat - minLat) / (maxLat - minLat)) * svgH;
  return { x: Math.max(10, Math.min(svgW - 10, x)), y: Math.max(10, Math.min(svgH - 10, y)) };
}

function getBounds(farms, outbreaks) {
  const all = [...farms, ...outbreaks].filter(f => f.latitude && f.longitude);
  if (!all.length) return { minLat: 8, maxLat: 12, minLon: 79, maxLon: 82 };
  const lats = all.map(f => f.latitude);
  const lons = all.map(f => f.longitude);
  const pad = 0.3;
  return { minLat: Math.min(...lats) - pad, maxLat: Math.max(...lats) + pad, minLon: Math.min(...lons) - pad, maxLon: Math.max(...lons) + pad };
}

function markerColor(riskLevel) {
  if (riskLevel === "HIGH")     return P.red;
  if (riskLevel === "MODERATE") return P.yellow;
  return P.green;
}

function PopupCard({ item, type, onClose }) {
  if (!item) return null;
  const isOutbreak = type === "outbreak";
  const color = isOutbreak ? P.red : markerColor(item.riskLevel);
  return (
    <div style={{ position: "absolute", top: 10, right: 10, background: P.white, borderRadius: 14, border: `2px solid ${color}40`, padding: 16, minWidth: 240, maxWidth: 280, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: P.dark }}>{isOutbreak ? "⚠ Suspected Outbreak" : "Farm"}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: P.gray, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ borderTop: `1px solid ${color}20`, paddingTop: 10 }}>
        {isOutbreak ? (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: P.dark, margin: "0 0 6px" }}>{item.farmName || item.farmId}</p>
            {[
              ["Disease", `Suspected ${item.suspectedDisease}`],
              ["Risk", item.riskLevel],
              ["Affected Animals", item.affectedAnimals],
              ["Deaths", item.deaths],
              ["Reported", new Date(item.reportedDate).toLocaleDateString()],
              ["Status", item.status?.replace(/_/g, " ")],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: P.gray }}>{k}</span>
                <span style={{ fontWeight: 600, color: k === "Risk" ? color : P.dark }}>{String(v)}</span>
              </div>
            ))}
            {item.nearbyFarms?.length > 0 && (
              <p style={{ fontSize: 11, color: P.orange, marginTop: 8, fontWeight: 600 }}>⚠ {item.nearbyFarms.length} nearby farm(s) in risk zone</p>
            )}
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: P.dark, margin: "0 0 6px" }}>{item.farmName || item.farmId}</p>
            {[
              ["District", item.district],
              ["Farm Type", item.farmType],
              ["Risk Level", item.riskLevel || "LOW"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: P.gray }}>{k}</span>
                <span style={{ fontWeight: 600, color: k === "Risk Level" ? color : P.dark }}>{String(v || "—")}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function GISMapSVG({ farms, outbreaks, selectedOutbreak, onFarmClick, onOutbreakClick, showRiskZones, zoom }) {
  const svgW = 600, svgH = 380;
  const bounds = getBounds(farms, outbreaks);
  const scale = zoom / 100;

  // Draw risk zone circle (approximate radius in SVG units)
  function riskCircleR(radiusKm) {
    const degPerKm = 1 / 111;
    const latRange = bounds.maxLat - bounds.minLat;
    return ((radiusKm * degPerKm) / latRange) * svgH * scale;
  }

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "100%", background: P.mapBg, borderRadius: 16 }}>
      {/* Grid */}
      {[...Array(8)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 50} x2={svgW} y2={i * 50} stroke="#2d4a1a" strokeWidth="0.5" />
      ))}
      {[...Array(12)].map((_, i) => (
        <line key={`v${i}`} x1={i * 55} y1="0" x2={i * 55} y2={svgH} stroke="#2d4a1a" strokeWidth="0.5" />
      ))}

      {/* Risk zones for outbreaks */}
      {showRiskZones && outbreaks.map((o, i) => {
        if (!o.latitude || !o.longitude) return null;
        const { x, y } = latLonToXY(o.latitude, o.longitude, bounds, svgW, svgH);
        const r = riskCircleR(5);
        return (
          <g key={`zone-${i}`}>
            <circle cx={x} cy={y} r={r} fill={P.orange} fillOpacity="0.12" stroke={P.orange} strokeWidth="1.5" strokeDasharray="6 3" />
            <circle cx={x} cy={y} r={r * 0.4} fill={P.red} fillOpacity="0.15" />
          </g>
        );
      })}

      {/* Farm markers */}
      {farms.map((f, i) => {
        if (!f.latitude || !f.longitude) return null;
        const { x, y } = latLonToXY(f.latitude, f.longitude, bounds, svgW, svgH);
        const col = markerColor(f.riskLevel);
        return (
          <g key={`farm-${i}`} onClick={() => onFarmClick(f)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={14} fill={col} fillOpacity="0.15" />
            <circle cx={x} cy={y} r={7} fill={col} />
            <circle cx={x} cy={y} r={3} fill={P.white} fillOpacity="0.6" />
          </g>
        );
      })}

      {/* Outbreak markers */}
      {outbreaks.map((o, i) => {
        if (!o.latitude || !o.longitude) return null;
        const { x, y } = latLonToXY(o.latitude, o.longitude, bounds, svgW, svgH);
        const isSelected = selectedOutbreak?.reportId === o.reportId;
        return (
          <g key={`outbreak-${i}`} onClick={() => onOutbreakClick(o)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={isSelected ? 22 : 18} fill={P.red} fillOpacity="0.2" />
            <circle cx={x} cy={y} r={isSelected ? 12 : 9} fill={P.red} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={P.white} fontWeight="700">!</text>
            {isSelected && <circle cx={x} cy={y} r={24} fill="none" stroke={P.red} strokeWidth="2" strokeDasharray="4 2" />}
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(10, 340)">
        {[[P.red, "Outbreak"], [P.yellow, "Moderate Risk"], [P.green, "Normal Farm"], [P.orange, "Risk Zone"]].map(([col, label], i) => (
          <g key={label} transform={`translate(${i * 130}, 0)`}>
            <circle cx="6" cy="6" r="5" fill={col} fillOpacity={label === "Risk Zone" ? 0.4 : 1} />
            <text x="16" y="10" fontSize="9" fill="rgba(255,255,255,0.7)">{label}</text>
          </g>
        ))}
      </g>

      {/* Coordinates label */}
      <text x={svgW - 5} y={svgH - 5} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.3)">WGS84</text>
    </svg>
  );
}

export default function GISOutbreakMapModule() {
  const [farms, setFarms] = useState([]);
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState(null);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [activeLayer, setActiveLayer] = useState("All");
  const [nearbyData, setNearbyData] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [f, o] = await Promise.all([getGISFarms(), getGISOutbreaks()]);
      setFarms(Array.isArray(f) ? f : []);
      setOutbreaks(Array.isArray(o) ? o : []);
    } catch { setFarms([]); setOutbreaks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOutbreakClick = async (o) => {
    setSelectedOutbreak(o);
    setSelectedFarm(null);
    try {
      const data = await getNearbyFarms(o.reportId);
      setNearbyData(data);
    } catch { setNearbyData(null); }
  };

  const filteredFarms = activeLayer === "Outbreaks" ? [] : farms;
  const filteredOutbreaks = activeLayer === "Farms" ? [] : outbreaks;

  const stats = {
    total: farms.length,
    outbreaks: outbreaks.length,
    high: farms.filter(f => f.riskLevel === "HIGH").length,
    moderate: farms.filter(f => f.riskLevel === "MODERATE").length,
  };

  return (
    <div style={{ fontFamily: "Inter" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "16px 20px", background: `linear-gradient(135deg, #1a2810, #2d3d1a)`, borderRadius: 16 }}>
        <MapPin size={22} color="#4CAF50" />
        <div>
          <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: P.white, margin: 0 }}>GIS Outbreak Map</h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "2px 0 0" }}>Real-time farm locations and suspected outbreak markers</p>
        </div>
        <button onClick={load} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", fontSize: 12, color: P.white }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          ["Total Farms", stats.total, P.green, P.greenBg],
          ["Active Outbreaks", stats.outbreaks, P.red, P.redBg],
          ["High Risk", stats.high, P.red, P.redBg],
          ["Moderate Risk", stats.moderate, P.yellow, P.yellowBg],
        ].map(([label, val, color, bg]) => (
          <div key={label} style={{ background: bg, borderRadius: 12, padding: "12px 16px", border: `1px solid ${color}20` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "Poppins" }}>{val}</div>
            <div style={{ fontSize: 11, color: P.gray }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {["All", "Farms", "Outbreaks"].map(l => (
          <button key={l} onClick={() => setActiveLayer(l)}
            style={{ padding: "6px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeLayer === l ? P.olive : "#f3f4f6", color: activeLayer === l ? P.white : P.gray }}>
            {l}
          </button>
        ))}
        <button onClick={() => setShowRiskZones(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 10, border: `1.5px solid ${showRiskZones ? P.orange : "#e5e7eb"}`, cursor: "pointer", fontSize: 12, fontWeight: 600, background: showRiskZones ? P.orangeBg : P.white, color: showRiskZones ? P.orange : P.gray }}>
          <Layers size={13} /> Risk Zones
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setZoom(z => Math.min(z + 20, 200))} style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ZoomIn size={14} color={P.gray} /></button>
          <button onClick={() => setZoom(z => Math.max(z - 20, 60))} style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ZoomOut size={14} color={P.gray} /></button>
        </div>
      </div>

      {/* Map */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 400, marginBottom: 16 }}>
        {loading ? (
          <div style={{ height: "100%", background: P.mapBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Loading map data...</p>
          </div>
        ) : (
          <GISMapSVG
            farms={filteredFarms} outbreaks={filteredOutbreaks}
            selectedOutbreak={selectedOutbreak}
            onFarmClick={f => { setSelectedFarm(f); setSelectedOutbreak(null); setNearbyData(null); }}
            onOutbreakClick={handleOutbreakClick}
            showRiskZones={showRiskZones} zoom={zoom}
          />
        )}
        {/* Popup */}
        {selectedFarm && <PopupCard item={selectedFarm} type="farm" onClose={() => setSelectedFarm(null)} />}
        {selectedOutbreak && <PopupCard item={selectedOutbreak} type="outbreak" onClose={() => { setSelectedOutbreak(null); setNearbyData(null); }} />}
      </div>

      {/* Nearby Farms Panel */}
      {nearbyData && (
        <div style={{ background: P.white, borderRadius: 16, border: `1.5px solid ${P.orange}30`, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Info size={16} color={P.orange} />
            <h3 style={{ fontFamily: "Poppins", fontSize: 14, fontWeight: 700, color: P.dark, margin: 0 }}>
              Nearby Farm Risk Analysis — {nearbyData.radiusKm}km Radius
            </h3>
          </div>
          <div style={{ background: P.orangeBg, borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: P.orange }}>
            <strong>Note:</strong> Farms listed below are within the potential exposure zone. They are NOT confirmed as infected. This is a precautionary risk assessment only.
          </div>
          {nearbyData.nearbyFarms?.length === 0 ? (
            <p style={{ fontSize: 13, color: P.gray, textAlign: "center", padding: "20px 0" }}>No farms found within {nearbyData.radiusKm}km radius</p>
          ) : (
            <div>
              {nearbyData.nearbyFarms.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: P.orangeBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={16} color={P.orange} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: P.dark, margin: 0 }}>{f.farmName || f.farmId}</p>
                    <p style={{ fontSize: 11, color: P.gray, margin: "2px 0 0" }}>{f.district} · {f.farmType}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: P.orange, margin: 0 }}>{Number(f.distanceKm).toFixed(2)} km</p>
                    <span style={{ fontSize: 10, fontWeight: 700, color: P.orange, background: P.orangeBg, padding: "2px 8px", borderRadius: 6 }}>POTENTIAL EXPOSURE</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Outbreak List */}
      {outbreaks.length > 0 && (
        <div style={{ background: P.white, borderRadius: 16, border: "1px solid #e5e7eb", padding: 18 }}>
          <h3 style={{ fontFamily: "Poppins", fontSize: 14, fontWeight: 700, color: P.dark, marginBottom: 14 }}>Active Suspected Outbreaks</h3>
          {outbreaks.map((o, i) => (
            <div key={i} onClick={() => handleOutbreakClick(o)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: P.red, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: P.dark, margin: 0 }}>Suspected {o.suspectedDisease}</p>
                <p style={{ fontSize: 11, color: P.gray, margin: "2px 0 0" }}>{o.farmName} · {new Date(o.reportedDate).toLocaleDateString()}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: P.red, background: P.redBg, padding: "3px 10px", borderRadius: 10 }}>{o.riskLevel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
