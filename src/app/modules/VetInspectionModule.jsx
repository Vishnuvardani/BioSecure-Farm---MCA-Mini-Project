import { useState, useEffect } from "react";
import { Stethoscope, ClipboardList, CheckCircle, AlertTriangle, MapPin, Calendar, FlaskConical, RefreshCw, ChevronRight } from "lucide-react";
import { getDiseaseReports, updateDiseaseStatus, updateDiseaseInspection } from "../../api/mongoService";

const P = {
  red: "#C62828", redBg: "#fef2f2",
  yellow: "#F9A825", yellowBg: "#fffde7",
  green: "#4CAF50", greenBg: "#f0fdf4",
  blue: "#1565C0", blueBg: "#e3f2fd",
  purple: "#6d28d9", purpleBg: "#f5f3ff",
  gray: "#6b7280", dark: "#1a1a2e", white: "#ffffff",
  olive: "#808034", oliveDark: "#5c5c24", ivoryDark: "#f0f0d8",
};

const STATUS_OPTS = ["REPORTED","UNDER_REVIEW","VETERINARY_INSPECTION","CONFIRMED","RULED_OUT","RESOLVED"];
const STATUS_COLOR = {
  REPORTED: P.blue, UNDER_REVIEW: P.yellow, VETERINARY_INSPECTION: P.purple,
  CONFIRMED: P.red, RULED_OUT: P.green, RESOLVED: P.gray,
};

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || P.gray;
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", padding: "3px 10px", borderRadius: 10 }}>{status?.replace(/_/g, " ")}</span>;
}

function InspectionForm({ report, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    inspectionDate: new Date().toISOString().split("T")[0],
    symptomsObserved: report.symptoms?.join(", ") || "",
    clinicalFindings: "",
    samplesCollected: [],
    preliminaryDiagnosis: "",
    recommendedActions: "",
    followUpDate: "",
    inspectionStatus: "INSPECTED",
    status: "VETERINARY_INSPECTION",
  });
  const [submitting, setSubmitting] = useState(false);

  const SAMPLE_TYPES = ["Blood Sample", "Nasal Swab", "Tissue Sample", "Fecal Sample", "Oral Swab", "Serum Sample"];

  const toggleSample = (s) => setForm(f => ({
    ...f, samplesCollected: f.samplesCollected.includes(s) ? f.samplesCollected.filter(x => x !== s) : [...f.samplesCollected, s]
  }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await updateDiseaseInspection(report.reportId, { ...form, veterinarianId: "VET-CURRENT" });
      onSubmit();
    } catch (e) { alert("Failed: " + e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: P.white, borderRadius: 16, border: "1px solid #e5e7eb", padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Stethoscope size={18} color={P.purple} />
        <h3 style={{ fontFamily: "Poppins", fontSize: 15, fontWeight: 700, color: P.dark, margin: 0 }}>Veterinary Inspection Report</h3>
      </div>

      {/* Disclaimer */}
      <div style={{ background: P.yellowBg, border: `1px solid ${P.yellow}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#92400e" }}>
        <strong>Note:</strong> You may record a preliminary diagnosis based on clinical findings. Laboratory confirmation is required before marking as "CONFIRMED".
      </div>

      {/* Report Summary */}
      <div style={{ background: "#f9fafb", borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: P.dark, margin: "0 0 6px" }}>Report: {report.reportId}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[["Farm", report.farmId], ["Animal Type", report.animalType], ["Suspected Disease", report.suspectedDisease], ["Affected Animals", report.affectedAnimals], ["Deaths", report.deaths], ["Severity", report.severity]].map(([k, v]) => (
            <div key={k} style={{ fontSize: 11 }}>
              <span style={{ color: P.gray }}>{k}: </span>
              <span style={{ fontWeight: 600, color: P.dark }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Inspection Date *</label>
          <input type="date" value={form.inspectionDate} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Follow-up Date</label>
          <input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Update Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${STATUS_COLOR[form.status] || "#e5e7eb"}`, fontSize: 12, color: P.dark, background: P.white, outline: "none" }}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Preliminary Diagnosis</label>
          <input value={form.preliminaryDiagnosis} onChange={e => setForm(f => ({ ...f, preliminaryDiagnosis: e.target.value }))}
            placeholder="e.g. Suspected ASF — pending lab confirmation"
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Symptoms Observed</label>
        <input value={form.symptomsObserved} onChange={e => setForm(f => ({ ...f, symptomsObserved: e.target.value }))}
          placeholder="Describe symptoms observed during inspection..."
          style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Clinical Findings</label>
        <textarea value={form.clinicalFindings} onChange={e => setForm(f => ({ ...f, clinicalFindings: e.target.value }))} rows={3}
          placeholder="Detailed clinical examination findings..."
          style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 8 }}>Samples Collected</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SAMPLE_TYPES.map(s => (
            <button key={s} onClick={() => toggleSample(s)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, border: `1.5px solid ${form.samplesCollected.includes(s) ? P.purple : "#e5e7eb"}`, background: form.samplesCollected.includes(s) ? P.purpleBg : P.white, cursor: "pointer", fontSize: 11, fontWeight: 600, color: form.samplesCollected.includes(s) ? P.purple : P.gray }}>
              <FlaskConical size={11} /> {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Recommended Actions</label>
        <textarea value={form.recommendedActions} onChange={e => setForm(f => ({ ...f, recommendedActions: e.target.value }))} rows={3}
          placeholder="Quarantine, treatment, vaccination, movement restrictions..."
          style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "11px", borderRadius: 12, background: P.ivoryDark, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: P.gray }}>Cancel</button>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ flex: 2, padding: "11px", borderRadius: 12, background: submitting ? "#9ca3af" : `linear-gradient(135deg, ${P.purple}, ${P.purple}cc)`, color: P.white, fontWeight: 700, fontSize: 13, border: "none", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <CheckCircle size={15} /> {submitting ? "Submitting..." : "Submit Inspection Report"}
        </button>
      </div>
    </div>
  );
}

export default function VetInspectionModule({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDiseaseReports();
      setReports(Array.isArray(data) ? data : []);
    } catch { setReports([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (reportId, status) => {
    try {
      await updateDiseaseStatus(reportId, { status });
      setReports(rs => rs.map(r => r.reportId === reportId ? { ...r, status } : r));
      setSuccess(`Status updated to ${status.replace(/_/g, " ")}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch { /* silent */ }
  };

  const handleInspectionSubmit = () => {
    setShowForm(false);
    setSelectedReport(null);
    setSuccess("Inspection report submitted successfully");
    setTimeout(() => setSuccess(""), 3000);
    load();
  };

  const filtered = filter === "All" ? reports : reports.filter(r => r.status === filter);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "REPORTED").length,
    inProgress: reports.filter(r => ["UNDER_REVIEW","VETERINARY_INSPECTION"].includes(r.status)).length,
    high: reports.filter(r => r.riskLevel === "HIGH").length,
  };

  if (showForm && selectedReport) {
    return (
      <div style={{ fontFamily: "Inter", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => { setShowForm(false); setSelectedReport(null); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: P.ivoryDark, border: "none", cursor: "pointer", fontSize: 12, color: P.gray, marginBottom: 16 }}>
          ← Back to Reports
        </button>
        <InspectionForm report={selectedReport} onSubmit={handleInspectionSubmit} onCancel={() => { setShowForm(false); setSelectedReport(null); }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "16px 20px", background: `linear-gradient(135deg, ${P.purple}18, ${P.purple}06)`, borderRadius: 16, border: `1px solid ${P.purple}20` }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: P.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Stethoscope size={20} color={P.white} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: P.dark, margin: 0 }}>Veterinary Inspection Workflow</h2>
          <p style={{ fontSize: 11, color: P.gray, margin: "2px 0 0" }}>Review disease reports, conduct inspections, and update diagnoses</p>
        </div>
        <button onClick={load} style={{ width: 34, height: 34, borderRadius: 10, background: P.ivoryDark, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw size={14} color={P.gray} />
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[["Total Reports", stats.total, P.blue], ["Pending Review", stats.pending, P.yellow], ["In Progress", stats.inProgress, P.purple], ["High Risk", stats.high, P.red]].map(([label, val, color]) => (
          <div key={label} style={{ background: P.white, borderRadius: 12, padding: "12px 16px", border: `1px solid ${color}20` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "Poppins" }}>{val}</div>
            <div style={{ fontSize: 11, color: P.gray }}>{label}</div>
          </div>
        ))}
      </div>

      {success && (
        <div style={{ background: P.greenBg, border: `1px solid ${P.green}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: P.green, fontWeight: 600 }}>
          ✓ {success}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["All", "REPORTED", "UNDER_REVIEW", "VETERINARY_INSPECTION", "CONFIRMED", "RESOLVED"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "5px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: filter === f ? P.purple : "#f3f4f6", color: filter === f ? P.white : P.gray }}>
            {f === "All" ? "All" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: P.gray }}>Loading reports...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: P.white, borderRadius: 14, border: "1px solid #e5e7eb" }}>
          <ClipboardList size={32} color="#d1d5db" style={{ marginBottom: 8 }} />
          <p style={{ color: P.gray, margin: 0 }}>No reports found</p>
        </div>
      ) : (
        filtered.map(r => (
          <div key={r.reportId} style={{ background: P.white, borderRadius: 14, border: `1.5px solid ${r.riskLevel === "HIGH" ? P.red + "40" : "#e5e7eb"}`, padding: "16px 18px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <AlertTriangle size={14} color={r.riskLevel === "HIGH" ? P.red : P.yellow} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: P.dark }}>Suspected {r.suspectedDisease}</span>
                </div>
                <p style={{ fontSize: 12, color: P.gray, margin: 0 }}>
                  Farm: {r.farmId} · {r.animalType} · Affected: {r.affectedAnimals} · Deaths: {r.deaths}
                </p>
                <p style={{ fontSize: 11, color: P.gray, margin: "3px 0 0" }}>
                  Reported: {new Date(r.reportedDate).toLocaleDateString()} · Severity: {r.severity}
                </p>
                {r.latitude && r.longitude && (
                  <p style={{ fontSize: 11, color: P.blue, margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={10} /> {r.latitude}, {r.longitude}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <StatusBadge status={r.status} />
                <span style={{ fontSize: 10, fontWeight: 700, color: r.riskLevel === "HIGH" ? P.red : r.riskLevel === "MODERATE" ? P.yellow : P.green, background: r.riskLevel === "HIGH" ? P.redBg : r.riskLevel === "MODERATE" ? P.yellowBg : P.greenBg, padding: "2px 8px", borderRadius: 8 }}>
                  {r.riskLevel} RISK
                </span>
              </div>
            </div>

            {/* Inspection details if already inspected */}
            {r.preliminaryDiagnosis && (
              <div style={{ background: P.purpleBg, borderRadius: 10, padding: "8px 12px", marginBottom: 10, fontSize: 11 }}>
                <span style={{ color: P.purple, fontWeight: 600 }}>Preliminary Diagnosis: </span>
                <span style={{ color: P.dark }}>{r.preliminaryDiagnosis}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => { setSelectedReport(r); setShowForm(true); }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, background: P.purpleBg, border: `1px solid ${P.purple}30`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: P.purple }}>
                <Stethoscope size={13} /> {r.inspectionStatus === "INSPECTED" ? "Update Inspection" : "Start Inspection"}
              </button>
              <select value={r.status} onChange={e => handleStatusChange(r.reportId, e.target.value)}
                style={{ padding: "7px 12px", borderRadius: 10, border: `1.5px solid ${STATUS_COLOR[r.status] || "#e5e7eb"}`, fontSize: 12, color: STATUS_COLOR[r.status] || P.gray, background: P.white, cursor: "pointer", outline: "none", fontWeight: 600 }}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              {r.nearbyFarms?.length > 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 10, background: P.redBg, fontSize: 11, fontWeight: 600, color: P.red }}>
                  <MapPin size={11} /> {r.nearbyFarms.length} nearby farm(s)
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
