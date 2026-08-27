import { useState, useEffect } from "react";
import { Shield, CheckCircle, AlertTriangle, Clock, TrendingUp, Award, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { submitBiosecurityAssessment, getBiosecurityHistory } from "../../api/mongoService";
import { formatDate } from "../../utils/dateTime";

const P = {
  green: "#2E7D32", greenLight: "#4CAF50", greenBg: "#f0fdf4",
  yellow: "#F9A825", yellowBg: "#fffde7",
  red: "#C62828", redBg: "#fef2f2",
  blue: "#1565C0", blueBg: "#e3f2fd",
  gray: "#6b7280", dark: "#1a1a2e", white: "#ffffff",
  olive: "#808034", oliveDark: "#5c5c24", ivoryDark: "#f0f0d8",
};

const QUESTIONS = [
  { key: "hygieneScore",              label: "Farm Hygiene",                      desc: "Overall cleanliness of farm premises" },
  { key: "housingCleanlinessScore",   label: "Animal Housing Cleanliness",        desc: "Condition of pens, coops, and shelters" },
  { key: "waterQualityScore",         label: "Water Quality",                     desc: "Cleanliness and safety of water supply" },
  { key: "feedManagementScore",       label: "Feed Management",                   desc: "Feed storage, quality, contamination prevention" },
  { key: "wasteDisposalScore",        label: "Waste Disposal",                    desc: "Manure and waste management practices" },
  { key: "visitorControlScore",       label: "Visitor Control",                   desc: "Entry restrictions and visitor logging" },
  { key: "disinfectionScore",         label: "Vehicle / Equipment Disinfection",  desc: "Disinfection protocols for vehicles and tools" },
  { key: "pestControlScore",          label: "Pest & Rodent Control",             desc: "Measures against pests and rodents" },
  { key: "quarantineScore",           label: "Animal Isolation / Quarantine",     desc: "Isolation facilities for sick or new animals" },
  { key: "vaccinationScore",          label: "Vaccination Compliance",            desc: "Adherence to vaccination schedules" },
  { key: "animalIntroductionScore",   label: "New Animal Introduction Practices", desc: "Protocols for introducing new animals" },
  { key: "deadAnimalDisposalScore",   label: "Dead Animal Disposal",              desc: "Safe disposal of deceased animals" },
];

const OPTIONS = [
  { value: 0, label: "Poor",      color: P.red },
  { value: 1, label: "Fair",      color: "#E65100" },
  { value: 2, label: "Good",      color: P.yellow },
  { value: 3, label: "Very Good", color: "#388E3C" },
  { value: 4, label: "Excellent", color: P.greenLight },
];

function getRiskInfo(score) {
  if (score <= 50) return { level: "HIGH RISK",     color: P.red,        bg: P.redBg,    icon: AlertTriangle };
  if (score <= 80) return { level: "MODERATE RISK", color: P.yellow,     bg: P.yellowBg, icon: AlertCircle };
  return              { level: "LOW RISK",      color: P.greenLight, bg: P.greenBg,  icon: CheckCircle };
}

function ScoreGauge({ score }) {
  const risk = getRiskInfo(score);
  const angle = (score / 100) * 180 - 90;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg viewBox="0 0 160 100" style={{ width: 160, height: 100 }}>
        <defs>
          <linearGradient id="bsGauge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={P.red} />
            <stop offset="50%"  stopColor={P.yellow} />
            <stop offset="100%" stopColor={P.greenLight} />
          </linearGradient>
        </defs>
        <path d="M 20 90 A 60 60 0 0 1 140 90" stroke="#e5e7eb" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M 20 90 A 60 60 0 0 1 140 90" stroke="url(#bsGauge)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${score * 1.885} 999`} />
        <g transform={`translate(80,90) rotate(${angle})`}>
          <line x1="0" y1="0" x2="0" y2="-44" stroke={P.dark} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="0" r="5" fill={P.dark} />
        </g>
        <text x="80" y="86" textAnchor="middle" fontSize="22" fontWeight="700" fill={risk.color} fontFamily="Poppins">{score}</text>
        <text x="80" y="97" textAnchor="middle" fontSize="8" fill={P.gray}>/100</text>
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 20, background: risk.bg, border: `1.5px solid ${risk.color}40` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: risk.color }}>{risk.level}</span>
      </div>
    </div>
  );
}

function QuestionCard({ q, value, onChange, index }) {
  const selected = OPTIONS.find(o => o.value === value);
  return (
    <div style={{ background: P.white, borderRadius: 14, border: `1.5px solid ${value !== undefined ? P.olive + "40" : "#e5e7eb"}`, padding: "14px 18px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: P.olive + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: P.olive }}>{index + 1}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: P.dark, margin: 0 }}>{q.label}</p>
          <p style={{ fontSize: 11, color: P.gray, margin: "2px 0 0" }}>{q.desc}</p>
        </div>
        {value !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: selected?.color, background: selected?.color + "18", padding: "2px 10px", borderRadius: 10, flexShrink: 0 }}>{selected?.label}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => onChange(q.key, opt.value)}
            style={{ flex: 1, padding: "8px 2px", borderRadius: 10, border: `2px solid ${value === opt.value ? opt.color : "#e5e7eb"}`,
              background: value === opt.value ? opt.color + "18" : P.white, cursor: "pointer",
              fontSize: 10, fontWeight: 600, color: value === opt.value ? opt.color : P.gray, transition: "all 0.15s" }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result, onReset }) {
  const risk = getRiskInfo(result.overallScore);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "Inter" }}>
      <div style={{ background: risk.bg, border: `2px solid ${risk.color}30`, borderRadius: 20, padding: 28, marginBottom: 18, textAlign: "center" }}>
        <ScoreGauge score={result.overallScore} />
        <h2 style={{ fontFamily: "Poppins", fontSize: 20, fontWeight: 700, color: P.dark, margin: "14px 0 4px" }}>
          Biosecurity Score: {result.overallScore}/100
        </h2>
        <p style={{ fontSize: 12, color: P.gray, margin: 0 }}>Assessment ID: {result.assessmentId}</p>
      </div>

      <div style={{ background: P.white, borderRadius: 16, border: "1px solid #e5e7eb", padding: 20, marginBottom: 14 }}>
        <h3 style={{ fontFamily: "Poppins", fontSize: 13, fontWeight: 700, color: P.dark, marginBottom: 14 }}>Parameter Scores</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {QUESTIONS.map(q => {
            const s = result[q.key] ?? 0;
            const col = s >= 3 ? P.greenLight : s >= 2 ? P.yellow : P.red;
            return (
              <div key={q.key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: P.dark, fontWeight: 500 }}>{q.label}</span>
                  <span style={{ color: col, fontWeight: 700 }}>{s}/4</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: "#e5e7eb" }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${(s / 4) * 100}%`, background: col }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={{ background: P.greenBg, borderRadius: 14, border: `1px solid ${P.greenLight}30`, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <CheckCircle size={14} color={P.greenLight} />
            <span style={{ fontSize: 12, fontWeight: 700, color: P.green }}>Strengths</span>
          </div>
          {result.strengths?.length ? result.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: P.green, padding: "3px 0", borderBottom: "1px solid #bbf7d0" }}>✓ {s}</div>
          )) : <p style={{ fontSize: 11, color: P.gray, margin: 0 }}>None identified yet</p>}
        </div>
        <div style={{ background: P.redBg, borderRadius: 14, border: `1px solid ${P.red}30`, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color={P.red} />
            <span style={{ fontSize: 12, fontWeight: 700, color: P.red }}>Weak Areas</span>
          </div>
          {result.weakAreas?.length ? result.weakAreas.map((w, i) => (
            <div key={i} style={{ fontSize: 11, color: P.red, padding: "3px 0", borderBottom: "1px solid #fecaca" }}>✗ {w}</div>
          )) : <p style={{ fontSize: 11, color: P.gray, margin: 0 }}>No weak areas</p>}
        </div>
      </div>

      <div style={{ background: P.blueBg, borderRadius: 14, border: `1px solid ${P.blue}20`, padding: 16, marginBottom: 18 }}>
        <h3 style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 700, color: P.blue, marginBottom: 10 }}>Recommended Actions</h3>
        {result.recommendations?.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "1px solid #bfdbfe" }}>
            <span style={{ color: P.blue, fontWeight: 700, fontSize: 12 }}>{i + 1}.</span>
            <span style={{ fontSize: 12, color: P.blue }}>{r}</span>
          </div>
        ))}
      </div>

      <button onClick={onReset} style={{ width: "100%", padding: "14px", borderRadius: 14, background: `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
        Start New Assessment
      </button>
    </div>
  );
}

function HistoryPanel({ history }) {
  const [open, setOpen] = useState(false);
  if (!history?.length) return null;
  return (
    <div style={{ background: P.white, borderRadius: 14, border: "1px solid #e5e7eb", marginBottom: 16 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={15} color={P.olive} />
          <span style={{ fontSize: 13, fontWeight: 700, color: P.dark }}>Previous Assessments ({history.length})</span>
        </div>
        {open ? <ChevronUp size={15} color={P.gray} /> : <ChevronDown size={15} color={P.gray} />}
      </button>
      {open && (
        <div style={{ padding: "0 18px 14px" }}>
          {history.map((h, i) => {
            const risk = getRiskInfo(h.overallScore);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: risk.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: risk.color }}>{h.overallScore}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: P.dark, margin: 0 }}>{formatDate(h.assessmentDate)}</p>
                  <p style={{ fontSize: 11, color: P.gray, margin: 0 }}>{h.assessmentId}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: risk.color, background: risk.bg, padding: "2px 10px", borderRadius: 10 }}>{risk.level}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BiosecurityAssessmentModule({ farms = [], user }) {
  const [selectedFarm, setSelectedFarm] = useState("");
  const [scores, setScores] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const answered = Object.keys(scores).length;
  const liveScore = answered === QUESTIONS.length
    ? Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / (QUESTIONS.length * 4)) * 100)
    : null;

  useEffect(() => {
    if (!selectedFarm) return;
    getBiosecurityHistory(selectedFarm).then(setHistory).catch(() => setHistory([]));
  }, [selectedFarm]);

  const handleSubmit = async () => {
    if (!selectedFarm) return setError("Please select a farm.");
    if (answered < QUESTIONS.length) return setError(`Please answer all ${QUESTIONS.length} questions. (${QUESTIONS.length - answered} remaining)`);
    setError(""); setSubmitting(true);
    try {
      const payload = {
        farmId: selectedFarm,
        farmerId: user?.userId || "unknown",
        farmType: farms.find(f => f.farmId === selectedFarm)?.farmType || "Mixed",
        ...scores,
      };
      const res = await submitBiosecurityAssessment(payload);
      setResult({ ...res, ...scores });
    } catch (e) {
      setError("Submission failed: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) return <div style={{ padding: "0 0 40px" }}><ResultCard result={result} onReset={() => { setResult(null); setScores({}); }} /></div>;

  return (
    <div style={{ fontFamily: "Inter", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "18px 22px", background: `linear-gradient(135deg, ${P.olive}18, ${P.olive}06)`, borderRadius: 18, border: `1px solid ${P.olive}20` }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: P.olive, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={22} color={P.white} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Poppins", fontSize: 17, fontWeight: 700, color: P.dark, margin: 0 }}>Biosecurity Assessment</h2>
          <p style={{ fontSize: 11, color: P.gray, margin: "2px 0 0" }}>Rate each parameter to calculate your farm biosecurity score (0–100)</p>
        </div>
        {liveScore !== null && (
          <div style={{ textAlign: "center", padding: "8px 16px", borderRadius: 12, background: getRiskInfo(liveScore).bg }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: getRiskInfo(liveScore).color, fontFamily: "Poppins", lineHeight: 1 }}>{liveScore}</div>
            <div style={{ fontSize: 9, color: P.gray, marginTop: 2 }}>LIVE SCORE</div>
          </div>
        )}
      </div>

      {/* Farm Selector */}
      <div style={{ background: P.white, borderRadius: 14, border: "1px solid #e5e7eb", padding: 16, marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: P.gray, display: "block", marginBottom: 8 }}>Select Farm *</label>
        <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${selectedFarm ? P.olive : "#e5e7eb"}`, fontSize: 13, color: P.dark, background: P.white, outline: "none" }}>
          <option value="">-- Choose a farm --</option>
          {farms.map(f => <option key={f.farmId} value={f.farmId}>{f.farmName || f.farmId}</option>)}
        </select>
      </div>

      <HistoryPanel history={history} />

      {/* Progress Bar */}
      <div style={{ background: P.white, borderRadius: 12, border: "1px solid #e5e7eb", padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <Clock size={13} color={P.gray} />
        <span style={{ fontSize: 11, color: P.gray }}>{answered}/{QUESTIONS.length} answered</span>
        <div style={{ flex: 1, height: 5, borderRadius: 4, background: "#e5e7eb" }}>
          <div style={{ height: "100%", borderRadius: 4, background: P.olive, width: `${(answered / QUESTIONS.length) * 100}%`, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: P.olive }}>{Math.round((answered / QUESTIONS.length) * 100)}%</span>
      </div>

      {/* Questions */}
      {QUESTIONS.map((q, i) => (
        <QuestionCard key={q.key} q={q} value={scores[q.key]} onChange={(k, v) => setScores(s => ({ ...s, [k]: v }))} index={i} />
      ))}

      {/* Risk Legend */}
      <div style={{ background: P.white, borderRadius: 12, border: "1px solid #e5e7eb", padding: 14, marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[["0–50", "HIGH RISK", P.red, P.redBg], ["51–80", "MODERATE RISK", P.yellow, P.yellowBg], ["81–100", "LOW RISK", P.greenLight, P.greenBg]].map(([range, label, color, bg]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 10, background: bg, border: `1px solid ${color}30` }}>
            <Award size={12} color={color} />
            <span style={{ fontSize: 11, fontWeight: 700, color }}>{range} = {label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: P.redBg, border: `1px solid ${P.red}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: P.red }}>
          {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={submitting}
        style={{ width: "100%", padding: "15px", borderRadius: 14, background: submitting ? "#9ca3af" : `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 14, border: "none", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Shield size={17} />
        {submitting ? "Submitting..." : "Submit Biosecurity Assessment"}
      </button>
    </div>
  );
}
