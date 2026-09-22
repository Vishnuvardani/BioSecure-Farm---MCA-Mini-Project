import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Shield, Syringe, MapPin, AlertTriangle, Activity,
  RefreshCw, Send, ChevronRight, CheckCircle, Clock, XCircle
} from "lucide-react";
import {
  getFarmsByOwner, getBiosecurityByFarmId, getVaccinationsByFarm,
  getLivestockByFarm, getDiseaseReports, getGISFarms, getGISOutbreaks
} from "../../api/mongoService";

// ── Palette (matches existing app) ────────────────────────────────────────
const P = {
  purple: "#723480", lavender: "#DBD4FF", purpleL: "#f3e5f5",
  purpleDark: "#4a1a5c", purpleMid: "#9c4db8",
  olive: "#808034", oliveDark: "#5c5c24",
  dark: "#1a1a0e", mid: "#6b6b4a", light: "#a0a080",
  ivory: "#FFFFE3", ivoryDark: "#f0f0d8",
  success: "#2E7D32", successL: "#e8f5e9",
  warning: "#F9A825", warningL: "#fffde7",
  danger: "#C62828", dangerL: "#ffebee",
  white: "#ffffff", gray: "#6b7280", gray2: "#e5e7eb", gray3: "#f9fafb",
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Risk Engine ────────────────────────────────────────────────────────────
function computeRisk(ctx) {
  const { farm, biosecurity, vaccinations, livestock, diseaseReports, outbreaks } = ctx;
  let score = 0;
  const factors = [];

  // 1. Biosecurity score (max 30 pts)
  if (biosecurity) {
    const bioScore = biosecurity.overallScore || 0;
    const bioRisk = Math.round((1 - bioScore / 100) * 30);
    score += bioRisk;
    factors.push({
      label: "Biosecurity Assessment",
      detail: `Score: ${bioScore}/100`,
      status: bioScore >= 70 ? "good" : bioScore >= 50 ? "moderate" : "poor",
      points: bioRisk,
    });
  } else {
    score += 15; // unknown = moderate penalty
    factors.push({ label: "Biosecurity Assessment", detail: "No assessment on record", status: "unknown", points: 15 });
  }

  // 2. Vaccination (max 25 pts)
  const now = new Date();
  const overdue = vaccinations.filter(v => v.status !== "Completed" && v.vaccinationDate && new Date(v.vaccinationDate) < now);
  const upcoming = vaccinations.filter(v => v.status !== "Completed" && v.vaccinationDate && new Date(v.vaccinationDate) >= now);
  if (vaccinations.length === 0) {
    score += 15;
    factors.push({ label: "Vaccination Status", detail: "No vaccination records found", status: "unknown", points: 15 });
  } else if (overdue.length > 0) {
    const pts = Math.min(overdue.length * 8, 25);
    score += pts;
    factors.push({ label: "Vaccination Status", detail: `${overdue.length} overdue vaccination(s)`, status: "poor", points: pts });
  } else {
    factors.push({ label: "Vaccination Status", detail: upcoming.length > 0 ? `${upcoming.length} upcoming — records up to date` : "All vaccinations completed", status: "good", points: 0 });
  }

  // 3. Nearby outbreaks (max 35 pts)
  if (farm?.latitude && farm?.longitude && outbreaks.length > 0) {
    let minDist = Infinity;
    let closestOutbreak = null;
    outbreaks.forEach(o => {
      if (!o.latitude || !o.longitude) return;
      const d = haversineKm(farm.latitude, farm.longitude, o.latitude, o.longitude);
      if (d < minDist) { minDist = d; closestOutbreak = o; }
    });
    if (minDist <= 50) {
      const distPts = minDist <= 3 ? 35 : minDist <= 8 ? 25 : minDist <= 15 ? 15 : 8;
      const sevMult = (closestOutbreak?.severity || closestOutbreak?.riskLevel || "").toLowerCase() === "high" ? 1.3 : 1.0;
      const pts = Math.min(Math.round(distPts * sevMult), 35);
      score += pts;
      factors.push({
        label: "Nearby Outbreak",
        detail: `${closestOutbreak?.suspectedDisease || closestOutbreak?.diseaseName} — ${minDist.toFixed(1)} km away`,
        status: minDist <= 8 ? "poor" : "moderate",
        points: pts,
        outbreak: closestOutbreak,
        distanceKm: minDist,
      });
    } else {
      factors.push({ label: "Nearby Outbreak", detail: "No active outbreaks within 50 km", status: "good", points: 0 });
    }
  } else {
    factors.push({ label: "Nearby Outbreak", detail: "Location data unavailable for proximity check", status: "unknown", points: 0 });
  }

  // 4. Active disease reports (max 10 pts)
  const activeReports = diseaseReports.filter(r => !["RESOLVED", "RULED_OUT"].includes(r.status));
  if (activeReports.length > 0) {
    const pts = Math.min(activeReports.length * 5, 10);
    score += pts;
    factors.push({ label: "Disease Reports", detail: `${activeReports.length} active report(s) on file`, status: "poor", points: pts });
  } else if (diseaseReports.length > 0) {
    factors.push({ label: "Disease Reports", detail: "All previous reports resolved", status: "good", points: 0 });
  } else {
    factors.push({ label: "Disease Reports", detail: "No disease reports on file", status: "good", points: 0 });
  }

  const finalScore = Math.min(score, 100);
  const level = finalScore >= 61 ? "HIGH" : finalScore >= 31 ? "MODERATE" : "LOW";
  const color = finalScore >= 61 ? P.danger : finalScore >= 31 ? P.warning : P.success;
  const levelBg = finalScore >= 61 ? P.dangerL : finalScore >= 31 ? P.warningL : P.successL;

  const recommendations = [];
  if (finalScore >= 61) {
    recommendations.push({ priority: "High", reason: "Elevated risk detected", action: "Increase animal health monitoring — check animals morning and evening", module: "Animals" });
    recommendations.push({ priority: "High", reason: "Biosecurity needs attention", action: "Strengthen cleaning and disinfection of sheds and entry points", module: "Biosecurity Assessment" });
    recommendations.push({ priority: "High", reason: "Outbreak proximity", action: "Restrict unnecessary visitors from entering the farm", module: "Outbreak Map" });
    if (overdue.length > 0) recommendations.push({ priority: "High", reason: "Overdue vaccinations", action: "Review overdue vaccinations with your veterinarian immediately", module: "Vaccination" });
    recommendations.push({ priority: "Medium", reason: "Precautionary measure", action: "Contact your assigned veterinarian if you notice any unusual symptoms", module: "Find Veterinarian" });
  } else if (finalScore >= 31) {
    recommendations.push({ priority: "Medium", reason: "Moderate risk level", action: "Increase routine monitoring of your animals", module: "Animals" });
    recommendations.push({ priority: "Medium", reason: "Biosecurity review advised", action: "Review your biosecurity practices and fix any gaps", module: "Biosecurity Assessment" });
    if (overdue.length > 0) recommendations.push({ priority: "Medium", reason: "Overdue vaccinations", action: "Check and update overdue vaccination records", module: "Vaccination" });
    recommendations.push({ priority: "Low", reason: "Preventive measure", action: "Keep track of nearby outbreak updates", module: "Outbreak Map" });
  } else {
    recommendations.push({ priority: "Low", reason: "Good standing", action: "Continue your current biosecurity practices", module: "Biosecurity Assessment" });
    recommendations.push({ priority: "Low", reason: "Routine care", action: "Maintain your vaccination schedule", module: "Vaccination" });
    recommendations.push({ priority: "Low", reason: "Routine care", action: "Continue regular health monitoring of animals", module: "Animals" });
  }

  return { score: finalScore, level, color, levelBg, factors, recommendations, overdue, upcoming, activeReports, closestOutbreak: factors.find(f => f.outbreak)?.outbreak, closestDist: factors.find(f => f.distanceKm)?.distanceKm };
}

// ── Chat Response Generator ────────────────────────────────────────────────
function generateResponse(input, ctx, risk) {
  const q = input.toLowerCase();
  const farmName = ctx.farm?.farmName || "your farm";
  const district = ctx.farm?.district || "your area";
  const farmType = ctx.farm?.farmType || "your animals";

  if (q.includes("disease risk") || q.includes("check risk") || q.includes("am i at risk") || q.includes("is my farm at risk")) {
    return buildRiskSummary(farmName, risk, ctx);
  }
  if (q.includes("vaccination") || q.includes("vaccine") || q.includes("vaccin")) {
    return buildVaccinationSummary(farmName, ctx);
  }
  if (q.includes("biosecurity") || q.includes("biosecure") || q.includes("security gap")) {
    return buildBiosecuritySummary(farmName, ctx, risk);
  }
  if (q.includes("outbreak") || q.includes("nearest") || q.includes("nearby")) {
    return buildOutbreakSummary(farmName, district, ctx, risk);
  }
  if (q.includes("health report") || q.includes("health summary") || q.includes("animal health") || q.includes("health concern")) {
    return buildHealthSummary(farmName, ctx);
  }
  if (q.includes("what should i do") || q.includes("recommend") || q.includes("action")) {
    return buildRecommendations(farmName, risk);
  }
  if (q.includes("score") || q.includes("my score")) {
    return `Your farm risk score is currently **${risk.score}/100** — **${risk.level} RISK**.\n\nBiosecurity: ${ctx.biosecurity ? `${ctx.biosecurity.overallScore}/100` : "Not assessed"}\nVaccinations: ${ctx.vaccinations.length} records (${risk.overdue.length} overdue)\nActive disease reports: ${risk.activeReports.length}`;
  }
  if (q.includes("sudden death") || q.includes("mortality") || q.includes("animals dying") || q.includes("dead animal")) {
    return `If you are seeing sudden or unusual animal deaths, please take these steps immediately:\n\n1. Isolate the affected animals from the rest of the flock/herd\n2. Do not move animals off the farm\n3. Contact your assigned veterinarian or the nearest animal health authority\n4. File a disease report through the Disease Report section\n5. Do not dispose of dead animals until a veterinarian has examined them\n\nThis assistant cannot diagnose disease. Please contact a veterinarian promptly.`;
  }
  if (q.includes("contact") || q.includes("veterinarian") || q.includes("vet") || q.includes("who should i call")) {
    return `To find or contact your assigned veterinarian:\n\n• Go to **Find Veterinarian** in the sidebar\n• You can book an appointment or view contact details there\n\nFor emergencies involving sudden deaths or serious symptoms, contact your local animal health authority immediately.`;
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("help")) {
    return `Hello! I am the BioSecure Farm Assistant for **${farmName}**.\n\nI can help you with:\n• Checking your farm's current risk level\n• Reviewing your vaccination schedule\n• Analysing biosecurity gaps\n• Finding nearby outbreak information\n• Summarising your animal health records\n• Recommending preventive actions\n\nYou can type a question or use the quick prompts below.`;
  }
  return `I can help you with questions about **${farmName}**. Try asking:\n\n• "Check disease risk for my farm"\n• "Which vaccinations are due?"\n• "What is my biosecurity score?"\n• "Is there an outbreak near my farm?"\n• "Show my recent health concerns"\n\nFor medical emergencies, please contact a veterinarian directly.`;
}

function buildRiskSummary(farmName, risk, ctx) {
  const lines = [`**Farm Risk Assessment — ${farmName}**\n`];
  lines.push(`Risk Level: **${risk.level} RISK**`);
  lines.push(`Risk Score: **${risk.score}/100**\n`);
  lines.push("Main Risk Factors:");
  risk.factors.forEach(f => {
    const icon = f.status === "good" ? "✓" : f.status === "poor" ? "⚠" : "•";
    lines.push(`${icon} ${f.label}: ${f.detail}`);
  });
  lines.push("\nRecommended Actions:");
  risk.recommendations.slice(0, 3).forEach((r, i) => lines.push(`${i + 1}. ${r.action}`));
  lines.push("\n*This is a risk assessment based on your farm data. It is not a disease diagnosis. Please consult a veterinarian for medical advice.*");
  return lines.join("\n");
}

function buildVaccinationSummary(farmName, ctx) {
  const { vaccinations } = ctx;
  if (!vaccinations.length) return `No vaccination records are available for **${farmName}** yet.\n\nPlease add vaccination records in the Vaccination section, or consult your veterinarian to set up a schedule.`;
  const now = new Date();
  const completed = vaccinations.filter(v => v.status === "Completed");
  const overdue = vaccinations.filter(v => v.status !== "Completed" && v.vaccinationDate && new Date(v.vaccinationDate) < now);
  const upcoming = vaccinations.filter(v => v.status !== "Completed" && v.vaccinationDate && new Date(v.vaccinationDate) >= now);
  const lines = [`**Vaccination Status — ${farmName}**\n`];
  lines.push(`Total records: ${vaccinations.length}`);
  if (completed.length) lines.push(`✓ Completed: ${completed.length}`);
  if (overdue.length) {
    lines.push(`\n⚠ Overdue (${overdue.length}):`);
    overdue.slice(0, 3).forEach(v => lines.push(`  • ${v.disease || v.vaccineName || "Vaccine"} — due ${v.vaccinationDate ? new Date(v.vaccinationDate).toLocaleDateString() : "unknown"}`));
  }
  if (upcoming.length) {
    lines.push(`\n📅 Upcoming (${upcoming.length}):`);
    upcoming.slice(0, 3).forEach(v => lines.push(`  • ${v.disease || v.vaccineName || "Vaccine"} — ${v.vaccinationDate ? new Date(v.vaccinationDate).toLocaleDateString() : "date not set"}`));
  }
  lines.push("\n*Please verify the vaccination schedule with your veterinarian.*");
  return lines.join("\n");
}

function buildBiosecuritySummary(farmName, ctx, risk) {
  const { biosecurity } = ctx;
  if (!biosecurity) return `No biosecurity assessment has been completed for **${farmName}** yet.\n\nPlease complete a Biosecurity Assessment to get a personalised score and recommendations.`;
  const lines = [`**Biosecurity Assessment — ${farmName}**\n`];
  lines.push(`Score: **${biosecurity.overallScore}/100**`);
  lines.push(`Risk Level: **${biosecurity.riskLevel || "Not assessed"}**\n`);
  if (biosecurity.weakAreas?.length) {
    lines.push("Areas needing improvement:");
    biosecurity.weakAreas.slice(0, 5).forEach(a => lines.push(`  ⚠ ${a.replace(/([A-Z])/g, " $1").trim()}`));
  }
  if (biosecurity.recommendations?.length) {
    lines.push("\nRecommended improvements:");
    biosecurity.recommendations.slice(0, 4).forEach((r, i) => lines.push(`${i + 1}. ${r}`));
  }
  return lines.join("\n");
}

function buildOutbreakSummary(farmName, district, ctx, risk) {
  const { outbreaks, farm } = ctx;
  if (!outbreaks.length) return `No active disease outbreaks are currently recorded in the system.\n\nContinue your standard biosecurity practices and check back regularly.`;
  if (!farm?.latitude || !farm?.longitude) return `Your farm location is not set, so I cannot calculate distances to outbreaks.\n\nPlease update your farm location in Farm Management to enable proximity checks.`;
  const nearby = outbreaks
    .filter(o => o.latitude && o.longitude)
    .map(o => ({ ...o, dist: haversineKm(farm.latitude, farm.longitude, o.latitude, o.longitude) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);
  if (!nearby.length) return `No outbreaks with location data found within range of **${farmName}**.`;
  const lines = [`**Nearest Reported Outbreaks to ${farmName}**\n`];
  nearby.forEach((o, i) => {
    lines.push(`${i + 1}. **${o.suspectedDisease || o.diseaseName}**`);
    lines.push(`   Distance: ${o.dist.toFixed(1)} km`);
    lines.push(`   Severity: ${o.severity || o.riskLevel || "Unknown"}`);
    lines.push(`   Reported: ${o.reportedDate ? new Date(o.reportedDate).toLocaleDateString() : o.outbreakDate || "Unknown"}`);
    lines.push(`   Status: ${o.status || "Active"}\n`);
  });
  lines.push("*View the Outbreak Map for full details and risk zones.*");
  return lines.join("\n");
}

function buildHealthSummary(farmName, ctx) {
  const { livestock } = ctx;
  if (!livestock.length) return `There are not enough recent health records to generate a meaningful summary for **${farmName}**.\n\nPlease add livestock records in the Animals section.`;
  const sick = livestock.filter(l => l.healthStatus === "Sick");
  const healthy = livestock.filter(l => l.healthStatus === "Healthy");
  const lines = [`**Animal Health Summary — ${farmName}**\n`];
  lines.push(`Total animals on record: ${livestock.length}`);
  lines.push(`✓ Healthy: ${healthy.length}`);
  if (sick.length) {
    lines.push(`⚠ Sick / Needs attention: ${sick.length}`);
    sick.slice(0, 3).forEach(l => lines.push(`  • ${l.species || "Animal"} — ${l.symptoms || "Symptoms not recorded"}`));
  }
  lines.push("\n*This summary is based on recorded data only. For medical concerns, please consult your veterinarian.*");
  return lines.join("\n");
}

function buildRecommendations(farmName, risk) {
  const lines = [`**Recommended Actions for ${farmName}**\n`];
  risk.recommendations.forEach((r, i) => {
    const icon = r.priority === "High" ? "🔴" : r.priority === "Medium" ? "🟡" : "🟢";
    lines.push(`${icon} **${r.priority} Priority** — ${r.reason}`);
    lines.push(`   ${r.action}\n`);
  });
  lines.push("*These are preventive recommendations. They do not confirm any disease diagnosis.*");
  return lines.join("\n");
}

// ── Small UI helpers ───────────────────────────────────────────────────────
function KPI({ label, value, sub, color, bg }) {
  return (
    <div style={{ background: bg || P.gray3, borderRadius: 12, padding: "14px 16px", border: `1px solid ${color}20`, flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "Poppins, sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: P.dark, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: P.gray, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function FactorRow({ factor }) {
  const col = factor.status === "good" ? P.success : factor.status === "poor" ? P.danger : factor.status === "moderate" ? P.warning : P.gray;
  const icon = factor.status === "good" ? "✓" : factor.status === "poor" ? "⚠" : factor.status === "moderate" ? "!" : "?";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: P.gray3, marginBottom: 6 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: col + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: P.dark, margin: 0 }}>{factor.label}</p>
        <p style={{ fontSize: 11, color: P.gray, margin: 0 }}>{factor.detail}</p>
      </div>
      {factor.points > 0 && (
        <span style={{ fontSize: 10, fontWeight: 700, color: col, background: col + "15", padding: "2px 8px", borderRadius: 8 }}>+{factor.points} pts</span>
      )}
    </div>
  );
}

function RecommendationCard({ rec, onNavigate }) {
  const col = rec.priority === "High" ? P.danger : rec.priority === "Medium" ? P.warning : P.success;
  const bg = rec.priority === "High" ? P.dangerL : rec.priority === "Medium" ? P.warningL : P.successL;
  return (
    <div style={{ background: P.white, borderRadius: 12, border: `1px solid ${col}20`, padding: "12px 14px", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: col, background: bg, padding: "2px 8px", borderRadius: 8, flexShrink: 0, marginTop: 2 }}>{rec.priority.toUpperCase()}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: P.gray, margin: "0 0 3px" }}>{rec.reason}</p>
          <p style={{ fontSize: 12, color: P.dark, margin: 0, lineHeight: 1.5 }}>{rec.action}</p>
        </div>
        {rec.module && onNavigate && (
          <button onClick={() => onNavigate(rec.module)}
            style={{ padding: "5px 10px", borderRadius: 8, background: P.purpleL, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, color: P.purple, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
            View <ChevronRight size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

// Render markdown-like bold text
function ChatText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", color: "inherit" }}>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : p
      )}
    </p>
  );
}

// ── Main Module ────────────────────────────────────────────────────────────
export default function AIAssistantModule({ user, onNavigate }) {
  const [ctx, setCtx] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // chat | risk | recommendations
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "Check disease risk for my farm",
    "Plan next vaccination schedule",
    "Analyse biosecurity gaps",
    "Nearest outbreak status",
    "AI health report summary",
  ];

  const loadContext = useCallback(async () => {
    setLoading(true);
    try {
      const ownerId = user?.userId || user?.id;
      const [farmsRes, outbreaksRes] = await Promise.all([
        ownerId ? getFarmsByOwner(ownerId) : Promise.resolve([]),
        getGISOutbreaks().catch(() => []),
      ]);
      const farms = Array.isArray(farmsRes) ? farmsRes : [];
      const farm = farms[0] || null;
      const farmId = farm?.farmId;

      const [biosecurity, vaccinations, livestock, diseaseReports] = await Promise.all([
        farmId ? getBiosecurityByFarmId(farmId).catch(() => null) : Promise.resolve(null),
        farmId ? getVaccinationsByFarm(farmId).catch(() => []) : Promise.resolve([]),
        farmId ? getLivestockByFarm(farmId).catch(() => []) : Promise.resolve([]),
        getDiseaseReports().catch(() => []),
      ]);

      // Filter disease reports to this farm only
      const farmReports = farmId ? (Array.isArray(diseaseReports) ? diseaseReports.filter(r => r.farmId === farmId) : []) : [];
      const enrichedOutbreaks = (Array.isArray(outbreaksRes) ? outbreaksRes : []).map(o => {
        if (o.latitude && o.longitude && !(o.latitude === 0 && o.longitude === 0)) return o;
        return o; // keep as-is; risk engine handles missing coords
      });

      const context = {
        farm,
        biosecurity: biosecurity || null,
        vaccinations: Array.isArray(vaccinations) ? vaccinations : [],
        livestock: Array.isArray(livestock) ? livestock : [],
        diseaseReports: farmReports,
        outbreaks: enrichedOutbreaks,
      };
      setCtx(context);
      const r = computeRisk(context);
      setRisk(r);

      // Initial greeting
      const farmName = farm?.farmName || "your farm";
      setMessages([{
        role: "ai",
        text: `Hello! I am the BioSecure Farm Assistant for **${farmName}**.\n\nYour current risk level is **${r.level} RISK** (${r.score}/100).\n\nI can help you check disease risk, review vaccinations, analyse biosecurity, and more. How can I help you today?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (e) {
      setCtx({ farm: null, biosecurity: null, vaccinations: [], livestock: [], diseaseReports: [], outbreaks: [] });
      setRisk({ score: 0, level: "LOW", color: P.success, levelBg: P.successL, factors: [], recommendations: [], overdue: [], upcoming: [], activeReports: [] });
      setMessages([{ role: "ai", text: "Hello! I could not load your farm data right now. Please ensure the server is running and try refreshing.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadContext(); }, [loadContext]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || !ctx || !risk) return;
    const userMsg = { role: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setSending(true);
    await new Promise(r => setTimeout(r, 600)); // brief thinking delay
    const response = generateResponse(text, ctx, risk);
    setMessages(m => [...m, { role: "ai", text: response, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setSending(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 14 }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${P.purple}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: P.gray, fontSize: 13 }}>Loading your farm data…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const farm = ctx?.farm;
  const riskColor = risk?.color || P.success;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: P.dark, maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "16px 20px", background: `linear-gradient(135deg, ${P.purpleDark}, ${P.purple})`, borderRadius: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={22} color={P.lavender} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: 17, fontWeight: 700, color: P.white, margin: 0 }}>Farm Assistant</h2>
          <p style={{ fontSize: 11, color: "rgba(219,212,255,0.65)", margin: "2px 0 0" }}>
            {farm ? `${farm.farmName} · ${farm.district}` : "Farm data not available"} · Risk-based decision support
          </p>
        </div>
        <button onClick={loadContext} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", fontSize: 12, color: P.white }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <KPI label="Current Farm Risk" value={risk?.level || "—"} sub={`Score: ${risk?.score ?? "—"}/100`} color={riskColor} bg={risk?.levelBg} />
        <KPI label="Active Recommendations" value={risk?.recommendations?.length ?? 0} sub="Based on your farm data" color={P.purple} bg={P.purpleL} />
        <KPI label="Biosecurity Score" value={ctx?.biosecurity ? `${ctx.biosecurity.overallScore}/100` : "Not assessed"} sub={ctx?.biosecurity?.riskLevel || "Complete an assessment"} color={P.olive} bg="#f5f5e8" />
        <KPI label="Upcoming Actions" value={(risk?.overdue?.length || 0) + (risk?.activeReports?.length || 0)} sub="Vaccinations / reports" color={P.warning} bg={P.warningL} />
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["chat", "Assistant Chat"], ["risk", "Risk Assessment"], ["recommendations", "Recommendations"]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeTab === tab ? P.purple : P.gray2, color: activeTab === tab ? P.white : P.gray }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          {/* Chat area */}
          <div style={{ display: "flex", flexDirection: "column", background: `linear-gradient(180deg, ${P.purpleDark} 0%, #2d1040 100%)`, borderRadius: 16, overflow: "hidden", minHeight: 480 }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "ai" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: P.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                      <Zap size={13} color={P.lavender} />
                    </div>
                  )}
                  <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? P.purple : "rgba(255,255,255,0.1)", color: P.white }}>
                    <ChatText text={msg.text} />
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: "6px 0 0", textAlign: "right" }}>{msg.time}</p>
                  </div>
                </div>
              ))}
              {sending && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: P.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={13} color={P.lavender} />
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: P.lavender, opacity: 0.6, animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {quickPrompts.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  style={{ padding: "5px 10px", borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(219,212,255,0.2)", cursor: "pointer", fontSize: 10, color: P.lavender, whiteSpace: "nowrap" }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about your farm…"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(219,212,255,0.2)", color: P.white, fontSize: 13, outline: "none" }}
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || sending}
                style={{ width: 40, height: 40, borderRadius: 12, background: P.purple, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: !input.trim() || sending ? 0.5 : 1 }}>
                <Send size={16} color={P.white} />
              </button>
            </div>
          </div>

          {/* Side panel — farm context */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: P.white, borderRadius: 14, border: `1px solid ${P.gray2}`, padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: P.dark, marginBottom: 10 }}>Your Farm</p>
              {farm ? (
                <>
                  {[["Name", farm.farmName], ["Location", `${farm.district}, ${farm.state}`], ["Animal Type", farm.farmType], ["Animals", farm.animalCount]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: `1px solid ${P.gray2}` }}>
                      <span style={{ color: P.gray }}>{k}</span>
                      <span style={{ fontWeight: 600, color: P.dark }}>{String(v || "—")}</span>
                    </div>
                  ))}
                </>
              ) : <p style={{ fontSize: 12, color: P.gray }}>No farm data found for your account.</p>}
            </div>

            <div style={{ background: P.white, borderRadius: 14, border: `1px solid ${P.gray2}`, padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: P.dark, marginBottom: 8 }}>Quick Status</p>
              {[
                { icon: Shield, label: "Biosecurity", val: ctx?.biosecurity ? `${ctx.biosecurity.overallScore}/100` : "Not assessed", ok: ctx?.biosecurity?.overallScore >= 70 },
                { icon: Syringe, label: "Vaccinations", val: `${risk?.overdue?.length || 0} overdue`, ok: (risk?.overdue?.length || 0) === 0 },
                { icon: AlertTriangle, label: "Disease Reports", val: `${risk?.activeReports?.length || 0} active`, ok: (risk?.activeReports?.length || 0) === 0 },
                { icon: MapPin, label: "Nearby Outbreaks", val: ctx?.outbreaks?.length > 0 ? `${ctx.outbreaks.length} active` : "None", ok: ctx?.outbreaks?.length === 0 },
              ].map(({ icon: Icon, label, val, ok }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${P.gray2}` }}>
                  <Icon size={13} color={ok ? P.success : P.warning} />
                  <span style={{ fontSize: 11, flex: 1, color: P.dark }}>{label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: ok ? P.success : P.warning }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RISK ASSESSMENT TAB ── */}
      {activeTab === "risk" && risk && (
        <div style={{ background: P.white, borderRadius: 16, border: `1px solid ${P.gray2}`, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Activity size={18} color={riskColor} />
            <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 15, fontWeight: 700, color: P.dark, margin: 0 }}>Farm Risk Assessment</h3>
            <span style={{ fontSize: 10, fontWeight: 700, background: P.purpleL, color: P.purple, padding: "2px 8px", borderRadius: 8 }}>AI-ASSISTED</span>
          </div>
          <p style={{ fontSize: 12, color: P.gray, marginBottom: 16 }}>Based on your farm's biosecurity, vaccination, health and outbreak data. This is not a disease diagnosis.</p>

          {/* Score display */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: risk.levelBg, borderRadius: 12, padding: "16px", border: `1px solid ${riskColor}20` }}>
              <p style={{ fontSize: 11, color: P.gray, margin: "0 0 4px" }}>OVERALL RISK LEVEL</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: riskColor, margin: 0, fontFamily: "Poppins, sans-serif" }}>{risk.level} RISK</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: riskColor, margin: "4px 0 0" }}>Score: {risk.score}/100</p>
            </div>
            <div style={{ background: P.gray3, borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, color: P.gray, margin: "0 0 8px" }}>RISK SCALE</p>
              <div style={{ height: 8, background: P.gray2, borderRadius: 6, overflow: "hidden", position: "relative", marginBottom: 4 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "30%", background: P.success, opacity: 0.4 }} />
                <div style={{ position: "absolute", left: "30%", top: 0, height: "100%", width: "31%", background: P.warning, opacity: 0.4 }} />
                <div style={{ position: "absolute", left: "61%", top: 0, height: "100%", width: "39%", background: P.danger, opacity: 0.4 }} />
                <div style={{ height: "100%", width: `${risk.score}%`, background: riskColor, borderRadius: 6, position: "relative", zIndex: 1 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: P.success, fontWeight: 600 }}>LOW 0–30</span>
                <span style={{ fontSize: 9, color: P.warning, fontWeight: 600 }}>MOD 31–60</span>
                <span style={{ fontSize: 9, color: P.danger, fontWeight: 600 }}>HIGH 61–100</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: P.dark, marginBottom: 10 }}>Why is this farm at this risk level?</p>
          {risk.factors.map((f, i) => <FactorRow key={i} factor={f} />)}

          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: P.purpleL, fontSize: 11, color: P.purple }}>
            This assessment is based on available data only. Missing data (e.g. no biosecurity assessment) may affect accuracy. Please keep your farm records up to date.
          </div>
        </div>
      )}

      {/* ── RECOMMENDATIONS TAB ── */}
      {activeTab === "recommendations" && risk && (
        <div style={{ background: P.white, borderRadius: 16, border: `1px solid ${P.gray2}`, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <CheckCircle size={18} color={P.purple} />
            <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 15, fontWeight: 700, color: P.dark, margin: 0 }}>Recommended Actions</h3>
          </div>
          <p style={{ fontSize: 12, color: P.gray, marginBottom: 16 }}>These are preventive actions based on your current farm data. They do not confirm any disease diagnosis.</p>
          {risk.recommendations.map((r, i) => <RecommendationCard key={i} rec={r} onNavigate={onNavigate} />)}
          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "#fff3e0", fontSize: 11, color: P.warning }}>
            ⚠ If you observe sudden animal deaths, serious symptoms, or unusual behaviour, contact a veterinarian or animal health authority immediately. Do not wait for an assessment.
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}
