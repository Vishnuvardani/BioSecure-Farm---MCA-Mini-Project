import { useState, useEffect, useCallback } from "react";
import {
  Leaf, MapPin, Shield, Activity, Syringe, AlertTriangle,
  Edit2, Plus, Save, X, RefreshCw, CheckCircle, Clock,
  Phone, Mail, Building2, FileText, Users, ChevronRight,
  AlertCircle, Info, ChevronDown
} from "lucide-react";
import {
  getFarmsByOwner, getFarms, createFarm, updateFarm,
  getFarmSummary, getFarmActivity,
  getBiosecurityByFarmId,
} from "../../api/mongoService";
import { formatDate } from "../../utils/dateTime";

const P = {
  olive: "#808034", oliveDark: "#5c5c24", oliveLight: "#c8c860",
  ivory: "#FFFFE3", ivoryDark: "#f0f0d8",
  dark: "#1a1a0e", mid: "#6b6b4a", light: "#a0a080",
  success: "#4CAF50", warning: "#FF9800", danger: "#D32F2F",
  info: "#42A5F5", white: "#ffffff",
  redBg: "#fef2f2", greenBg: "#f0fdf4", yellowBg: "#fffde7", blueBg: "#e3f2fd",
};

const FARM_TYPES = ["Pig", "Poultry", "Mixed", "Broiler", "Layer", "Breeder"];
const WATER_SOURCES = ["Borewell", "Municipal", "River", "Rainwater", "Tank", "Other"];
const STATUSES = ["Active", "Inactive", "Under Construction", "Suspended"];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const DISTRICTS_BY_STATE = {
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Trichy","Salem","Erode","Tiruppur","Vellore","Thoothukudi","Tirunelveli","Kancheepuram","Thanjavur","Dindigul","Cuddalore","Nagapattinam","Villupuram","Namakkal","Karur","Perambalur","Ariyalur","Pudukkottai","Sivaganga","Virudhunagar","Ramanathapuram","Tenkasi","Tirupattur","Ranipet","Chengalpattu","Kallakurichi","Tiruvannamalai","Krishnagiri","Dharmapuri","Nilgiris"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Nalgonda","Mahbubnagar","Adilabad","Medak","Rangareddy","Sangareddy","Siddipet","Vikarabad","Wanaparthy","Jogulamba Gadwal","Nagarkurnool","Suryapet","Yadadri Bhuvanagiri","Jangaon","Peddapalli","Jayashankar Bhupalpally","Rajanna Sircilla","Kamareddy","Nirmal","Mancherial","Asifabad","Mulugu","Bhadradri Kothagudem","Mahabubabad","Narayanpet"],
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Tirupati","Kurnool","Rajahmundry","Nellore","Kakinada","Kadapa","Anantapur","Eluru","Ongole","Srikakulam","Vizianagaram","Chittoor","West Godavari","East Godavari","Krishna","Prakasam","Sri Potti Sriramulu Nellore"],
  "Karnataka": ["Bengaluru","Mysuru","Hubli","Mangaluru","Belagavi","Kalaburagi","Ballari","Vijayapura","Shivamogga","Tumakuru","Davanagere","Bidar","Raichur","Dharwad","Udupi","Hassan","Mandya","Chikkamagaluru","Kodagu","Bagalkot","Gadag","Haveri","Koppal","Yadgir","Chamarajanagar","Chikkaballapur","Kolar","Ramanagara","Bengaluru Rural","Chitradurga"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Malappuram","Kannur","Kasaragod","Pathanamthitta","Idukki","Kottayam","Wayanad"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Amravati","Kolhapur","Sangli","Satara","Ratnagiri","Sindhudurg","Raigad","Thane","Palghar","Dhule","Nandurbar","Jalgaon","Ahmednagar","Beed","Latur","Osmanabad","Nanded","Hingoli","Parbhani","Jalna","Buldhana","Akola","Washim","Yavatmal","Wardha","Chandrapur","Gadchiroli","Gondia","Bhandara"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Junagadh","Gandhinagar","Anand","Mehsana","Patan","Banaskantha","Sabarkantha","Aravalli","Mahisagar","Kheda","Nadiad","Bharuch","Narmada","Tapi","Navsari","Valsad","Dang","Amreli","Botad","Gir Somnath","Porbandar","Devbhumi Dwarka","Morbi","Surendranagar","Chhota Udaipur","Dahod","Panchmahal"],
};

const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i));

// ── Validation ─────────────────────────────────────────────────────────────
function validateForm(f) {
  const errs = {};
  if (!f.farmName.trim()) errs.farmName = "Farm name is required";
  else if (f.farmName.trim().length < 3) errs.farmName = "Min 3 characters";
  else if (f.farmName.trim().length > 120) errs.farmName = "Max 120 characters";

  if (!f.ownerName.trim()) errs.ownerName = "Owner name is required";
  else if (f.ownerName.trim().length < 2) errs.ownerName = "Min 2 characters";
  else if (f.ownerName.trim().length > 100) errs.ownerName = "Max 100 characters";

  if (!f.farmType) errs.farmType = "Farm type is required";
  if (!f.status) errs.status = "Status is required";

  if (!f.state) errs.state = "State is required";
  if (!f.district) errs.district = "District is required";

  if (f.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(f.phone)) errs.phone = "Invalid phone (7-20 digits)";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = "Invalid email format";
  if (f.pincode && !/^\d{6}$/.test(f.pincode)) errs.pincode = "Must be exactly 6 digits";

  if (f.farmArea !== "" && f.farmArea !== null && f.farmArea !== undefined) {
    const a = Number(f.farmArea);
    if (isNaN(a) || a <= 0) errs.farmArea = "Must be a positive number";
    else if (a > 10000) errs.farmArea = "Seems too large (max 10000 acres)";
  }
  if (f.animalCapacity !== "" && f.animalCapacity !== null && f.animalCapacity !== undefined) {
    const c = Number(f.animalCapacity);
    if (!Number.isInteger(c) || c <= 0) errs.animalCapacity = "Must be a positive whole number";
    else if (c > 1000000) errs.animalCapacity = "Seems too large";
  }
  if (f.animalCount !== "" && f.animalCount !== null && f.animalCount !== undefined) {
    const n = Number(f.animalCount);
    if (!Number.isInteger(n) || n < 0) errs.animalCount = "Must be 0 or more";
    if (f.animalCapacity && n > Number(f.animalCapacity)) errs.animalCount = "Cannot exceed capacity";
  }
  if (f.numberOfSheds !== "" && f.numberOfSheds !== null && f.numberOfSheds !== undefined) {
    const s = Number(f.numberOfSheds);
    if (!Number.isInteger(s) || s < 0) errs.numberOfSheds = "Must be 0 or more";
    else if (s > 500) errs.numberOfSheds = "Seems too large";
  }
  if (f.establishedYear !== "" && f.establishedYear !== null && f.establishedYear !== undefined) {
    const y = Number(f.establishedYear);
    const cur = new Date().getFullYear();
    if (!Number.isInteger(y) || y < 1900 || y > cur) errs.establishedYear = `Must be between 1900 and ${cur}`;
  }
  if (f.latitude !== "" && f.latitude !== null && f.latitude !== undefined) {
    const lat = Number(f.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) errs.latitude = "Must be between -90 and 90";
  }
  if (f.longitude !== "" && f.longitude !== null && f.longitude !== undefined) {
    const lon = Number(f.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) errs.longitude = "Must be between -180 and 180";
  }
  if (f.infrastructure?.waterSource === "") {
    // optional — no error
  }
  return errs;
}

const EMPTY_FORM = {
  farmName: "", ownerName: "", farmType: "Poultry", status: "Active",
  registrationNo: "", phone: "", email: "",
  address: "", village: "", district: "", state: "", pincode: "",
  farmArea: "", animalCapacity: "", animalCount: "", numberOfSheds: "",
  establishedYear: "", latitude: "", longitude: "",
  infrastructure: {
    feedStorage: false, waterSource: "", quarantineArea: false,
    wasteDisposal: false, disinfectionFacility: false,
    fencing: false, visitorEntry: false,
  },
};

// ── Small UI components ────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: P.white, borderRadius: 16,
      border: "1px solid rgba(128,128,52,0.1)",
      boxShadow: "0 2px 12px rgba(128,128,52,0.06)", ...style
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, color = P.olive }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={color} />
      </div>
      <span style={{ fontFamily: "Poppins", fontSize: 13, fontWeight: 700, color: P.dark }}>{title}</span>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: P.mid, display: "block", marginBottom: 5 }}>
        {label}{required && <span style={{ color: P.danger, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 10, color: P.danger, marginTop: 3, display: "flex", alignItems: "center", gap: 3 }}>
        <AlertCircle size={10} /> {error}
      </p>}
    </div>
  );
}

function Input({ value, onChange, placeholder = "", type = "text", disabled = false, error = false, min, max }) {
  return (
    <input
      type={type} value={value ?? ""} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      min={min} max={max}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 12,
        border: `1.5px solid ${error ? P.danger : "rgba(128,128,52,0.2)"}`,
        background: disabled ? P.ivoryDark : P.white,
        color: P.dark, outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s",
      }}
    />
  );
}

function Select({ value, onChange, options, disabled = false, error = false, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value ?? ""} onChange={onChange} disabled={disabled}
        style={{
          width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10, fontSize: 12,
          border: `1.5px solid ${error ? P.danger : "rgba(128,128,52,0.2)"}`,
          background: disabled ? P.ivoryDark : P.white,
          color: value ? P.dark : P.light, outline: "none", appearance: "none",
          cursor: disabled ? "not-allowed" : "pointer",
        }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <ChevronDown size={13} color={P.mid} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <div onClick={onChange} style={{
        width: 36, height: 20, borderRadius: 10, background: checked ? P.olive : "#d1d5db",
        position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%", background: P.white,
          transition: "left 0.2s",
        }} />
      </div>
      <span style={{ fontSize: 12, color: P.dark }}>{label}</span>
    </label>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10,
      background: active ? P.greenBg : P.redBg,
      color: active ? P.success : P.danger,
    }}>
      {active ? "● Active" : "● " + (status || "Inactive")}
    </span>
  );
}

function RiskBadge({ level }) {
  const cfg = { HIGH: [P.danger, P.redBg], MODERATE: [P.warning, P.yellowBg], LOW: [P.success, P.greenBg] };
  const [color, bg] = cfg[level] || cfg.LOW;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: bg, color }}>{level}</span>;
}

function KPI({ label, value, icon: Icon, color }) {
  return (
    <Card style={{ padding: "14px 16px" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, color: P.dark, fontFamily: "Poppins", margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: P.mid, margin: "2px 0 0" }}>{label}</p>
    </Card>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${P.ivoryDark}`, borderTopColor: P.olive, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px", color: P.light }}>
      <Info size={28} color="#d1d5db" style={{ marginBottom: 8 }} />
      <p style={{ fontSize: 13, margin: 0 }}>{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px" }}>
      <AlertCircle size={28} color={P.danger} style={{ marginBottom: 8 }} />
      <p style={{ fontSize: 13, color: P.danger, margin: "0 0 12px" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ fontSize: 12, padding: "7px 16px", borderRadius: 10, background: P.olive, color: P.white, border: "none", cursor: "pointer" }}>
          Retry
        </button>
      )}
    </div>
  );
}

// ── Farm Form ──────────────────────────────────────────────────────────────
function FarmForm({ initial, onSave, onCancel, saving, saveError }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [errs, setErrs] = useState({});
  const [touched, setTouched] = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
    // clear error on change
    setErrs(e => { const n = { ...e }; delete n[k]; return n; });
  };
  const setInfra = (k, v) => setForm(f => ({ ...f, infrastructure: { ...f.infrastructure, [k]: v } }));

  // When state changes, reset district
  const setState = (v) => {
    setForm(f => ({ ...f, state: v, district: "" }));
    setTouched(t => ({ ...t, state: true, district: false }));
    setErrs(e => { const n = { ...e }; delete n.state; delete n.district; return n; });
  };

  const districtOptions = DISTRICTS_BY_STATE[form.state] || [];

  const handleBlur = (k) => {
    setTouched(t => ({ ...t, [k]: true }));
    const e = validateForm(form);
    if (e[k]) setErrs(prev => ({ ...prev, [k]: e[k] }));
    else setErrs(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const handleSubmit = () => {
    // Mark all fields touched
    const allTouched = {};
    Object.keys(form).forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);
    const e = validateForm(form);
    setErrs(e);
    if (Object.keys(e).length) {
      // Scroll to first error
      const firstKey = Object.keys(e)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSave(form);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
    }, () => {}, { enableHighAccuracy: true });
  };

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const errCount = Object.keys(errs).length;

  return (
    <div style={{ fontFamily: "Inter" }}>
      {saveError && (
        <div style={{ background: P.redBg, border: `1px solid ${P.danger}30`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: P.danger, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={14} /> {saveError}
        </div>
      )}
      {errCount > 0 && Object.keys(touched).length > 0 && (
        <div style={{ background: P.yellowBg, border: `1px solid ${P.warning}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: P.dark }}>
          ⚠ Please fix <strong>{errCount}</strong> error{errCount > 1 ? "s" : ""} before saving.
        </div>
      )}

      {/* Basic Info */}
      <Card style={{ padding: 18, marginBottom: 14 }}>
        <SectionTitle icon={Leaf} title="Basic Information" />
        <div style={grid2}>
          <div id="field-farmName">
            <Field label="Farm Name" required error={touched.farmName && errs.farmName}>
              <Input value={form.farmName} onChange={e => set("farmName", e.target.value)}
                onBlur={() => handleBlur("farmName")}
                placeholder="e.g. Green Valley Farm" error={!!(touched.farmName && errs.farmName)} />
            </Field>
          </div>
          <div id="field-ownerName">
            <Field label="Owner Name" required error={touched.ownerName && errs.ownerName}>
              <Input value={form.ownerName} onChange={e => set("ownerName", e.target.value)}
                onBlur={() => handleBlur("ownerName")}
                placeholder="e.g. Ramesh Kumar" error={!!(touched.ownerName && errs.ownerName)} />
            </Field>
          </div>
          <div id="field-farmType">
            <Field label="Farm Type" required error={touched.farmType && errs.farmType}>
              <Select value={form.farmType} onChange={e => set("farmType", e.target.value)}
                options={FARM_TYPES} placeholder="Select farm type..."
                error={!!(touched.farmType && errs.farmType)} />
            </Field>
          </div>
          <div id="field-status">
            <Field label="Status" required error={touched.status && errs.status}>
              <Select value={form.status} onChange={e => set("status", e.target.value)}
                options={STATUSES} placeholder="Select status..."
                error={!!(touched.status && errs.status)} />
            </Field>
          </div>
          <Field label="Registration No.">
            <Input value={form.registrationNo} onChange={e => set("registrationNo", e.target.value)}
              placeholder="e.g. FARM-REG-001" />
          </Field>
          <div id="field-establishedYear">
            <Field label="Established Year" error={touched.establishedYear && errs.establishedYear}>
              <Select value={form.establishedYear} onChange={e => set("establishedYear", e.target.value)}
                options={YEARS} placeholder="Select year..."
                error={!!(touched.establishedYear && errs.establishedYear)} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Contact & Address */}
      <Card style={{ padding: 18, marginBottom: 14 }}>
        <SectionTitle icon={Phone} title="Contact & Address" />
        <div style={grid2}>
          <div id="field-phone">
            <Field label="Phone" error={touched.phone && errs.phone}>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)}
                onBlur={() => handleBlur("phone")}
                placeholder="+91 98765 43210" error={!!(touched.phone && errs.phone)} />
            </Field>
          </div>
          <div id="field-email">
            <Field label="Email" error={touched.email && errs.email}>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="farm@example.com" error={!!(touched.email && errs.email)} />
            </Field>
          </div>
          <div id="field-state">
            <Field label="State" required error={touched.state && errs.state}>
              <Select value={form.state} onChange={e => setState(e.target.value)}
                options={INDIAN_STATES} placeholder="Select state..."
                error={!!(touched.state && errs.state)} />
            </Field>
          </div>
          <div id="field-district">
            <Field label="District" required error={touched.district && errs.district}>
              {districtOptions.length > 0 ? (
                <Select value={form.district} onChange={e => set("district", e.target.value)}
                  options={districtOptions} placeholder="Select district..."
                  error={!!(touched.district && errs.district)} />
              ) : (
                <Input value={form.district} onChange={e => set("district", e.target.value)}
                  onBlur={() => handleBlur("district")}
                  placeholder="Enter district" error={!!(touched.district && errs.district)} />
              )}
            </Field>
          </div>
          <Field label="Village / Town">
            <Input value={form.village} onChange={e => set("village", e.target.value)}
              placeholder="Village or town name" />
          </Field>
          <div id="field-pincode">
            <Field label="Pincode" error={touched.pincode && errs.pincode}>
              <Input value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                onBlur={() => handleBlur("pincode")}
                placeholder="6-digit pincode" error={!!(touched.pincode && errs.pincode)} />
            </Field>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Full Address">
            <textarea value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="Door no, street, locality..."
              rows={2}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 12, border: "1.5px solid rgba(128,128,52,0.2)", background: P.white, color: P.dark, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "Inter" }} />
          </Field>
        </div>
      </Card>

      {/* Capacity */}
      <Card style={{ padding: 18, marginBottom: 14 }}>
        <SectionTitle icon={Activity} title="Farm Capacity" />
        <div style={grid2}>
          <div id="field-farmArea">
            <Field label="Farm Area (acres)" error={touched.farmArea && errs.farmArea}>
              <Input type="number" value={form.farmArea} onChange={e => set("farmArea", e.target.value)}
                onBlur={() => handleBlur("farmArea")}
                placeholder="e.g. 4.5" min="0" error={!!(touched.farmArea && errs.farmArea)} />
            </Field>
          </div>
          <div id="field-animalCapacity">
            <Field label="Animal Capacity" error={touched.animalCapacity && errs.animalCapacity}>
              <Input type="number" value={form.animalCapacity} onChange={e => set("animalCapacity", e.target.value)}
                onBlur={() => handleBlur("animalCapacity")}
                placeholder="e.g. 1200" min="1" error={!!(touched.animalCapacity && errs.animalCapacity)} />
            </Field>
          </div>
          <div id="field-animalCount">
            <Field label="Current Animal Count" error={touched.animalCount && errs.animalCount}>
              <Input type="number" value={form.animalCount} onChange={e => set("animalCount", e.target.value)}
                onBlur={() => handleBlur("animalCount")}
                placeholder="e.g. 970" min="0" error={!!(touched.animalCount && errs.animalCount)} />
            </Field>
          </div>
          <div id="field-numberOfSheds">
            <Field label="Number of Sheds" error={touched.numberOfSheds && errs.numberOfSheds}>
              <Input type="number" value={form.numberOfSheds} onChange={e => set("numberOfSheds", e.target.value)}
                onBlur={() => handleBlur("numberOfSheds")}
                placeholder="e.g. 5" min="0" error={!!(touched.numberOfSheds && errs.numberOfSheds)} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card style={{ padding: 18, marginBottom: 14 }}>
        <SectionTitle icon={MapPin} title="GPS Location" />
        <div style={grid2}>
          <div id="field-latitude">
            <Field label="Latitude (-90 to 90)" error={touched.latitude && errs.latitude}>
              <Input type="number" value={form.latitude} onChange={e => set("latitude", e.target.value)}
                onBlur={() => handleBlur("latitude")}
                placeholder="e.g. 17.374" min="-90" max="90" error={!!(touched.latitude && errs.latitude)} />
            </Field>
          </div>
          <div id="field-longitude">
            <Field label="Longitude (-180 to 180)" error={touched.longitude && errs.longitude}>
              <Input type="number" value={form.longitude} onChange={e => set("longitude", e.target.value)}
                onBlur={() => handleBlur("longitude")}
                placeholder="e.g. 78.493" min="-180" max="180" error={!!(touched.longitude && errs.longitude)} />
            </Field>
          </div>
        </div>
        <button onClick={detectLocation} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: P.blueBg, border: "none", cursor: "pointer", fontSize: 12, color: P.info, fontWeight: 600 }}>
          <MapPin size={13} /> Detect My Location
        </button>
      </Card>

      {/* Infrastructure */}
      <Card style={{ padding: 18, marginBottom: 14 }}>
        <SectionTitle icon={Building2} title="Infrastructure" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <Toggle checked={!!form.infrastructure.feedStorage} onChange={() => setInfra("feedStorage", !form.infrastructure.feedStorage)} label="Feed Storage" />
          <Toggle checked={!!form.infrastructure.quarantineArea} onChange={() => setInfra("quarantineArea", !form.infrastructure.quarantineArea)} label="Quarantine Area" />
          <Toggle checked={!!form.infrastructure.wasteDisposal} onChange={() => setInfra("wasteDisposal", !form.infrastructure.wasteDisposal)} label="Waste Disposal" />
          <Toggle checked={!!form.infrastructure.disinfectionFacility} onChange={() => setInfra("disinfectionFacility", !form.infrastructure.disinfectionFacility)} label="Disinfection Facility" />
          <Toggle checked={!!form.infrastructure.fencing} onChange={() => setInfra("fencing", !form.infrastructure.fencing)} label="Fencing / Security" />
          <Toggle checked={!!form.infrastructure.visitorEntry} onChange={() => setInfra("visitorEntry", !form.infrastructure.visitorEntry)} label="Visitor Entry Area" />
        </div>
        <Field label="Water Source">
          <Select value={form.infrastructure.waterSource || ""} onChange={e => setInfra("waterSource", e.target.value)}
            options={WATER_SOURCES} placeholder="Select water source..." />
        </Field>
      </Card>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSubmit} disabled={saving}
          style={{ flex: 1, padding: "12px", borderRadius: 12, background: saving ? "#9ca3af" : `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 13, border: "none", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Save size={15} /> {saving ? "Saving..." : "Save Farm"}
        </button>
        <button onClick={onCancel} style={{ padding: "12px 20px", borderRadius: 12, background: P.ivoryDark, color: P.mid, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Biosecurity Summary ────────────────────────────────────────────────────
function BiosecuritySummary({ data, onNavigate }) {
  if (!data) return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={Shield} title="Biosecurity" color={P.warning} />
      <EmptyState message="No assessment found. Take your first assessment." />
      <button onClick={() => onNavigate("Biosecurity Assessment")}
        style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, background: `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>
        Take Assessment
      </button>
    </Card>
  );
  const scoreColor = data.score >= 81 ? P.success : data.score >= 51 ? P.warning : P.danger;
  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={Shield} title="Biosecurity Summary" color={scoreColor} />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: scoreColor + "18", border: `3px solid ${scoreColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor, fontFamily: "Poppins", lineHeight: 1 }}>{data.score}</span>
          <span style={{ fontSize: 9, color: P.mid }}>/100</span>
        </div>
        <div>
          <RiskBadge level={data.riskLevel} />
          <p style={{ fontSize: 11, color: P.mid, margin: "6px 0 0" }}>
            Last: {data.assessmentDate ? formatDate(data.assessmentDate) : "—"}
          </p>
        </div>
      </div>
      {data.weakAreas?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: P.danger, marginBottom: 5 }}>Weak Areas</p>
          {data.weakAreas.slice(0, 3).map((w, i) => (
            <div key={i} style={{ fontSize: 11, color: P.mid, padding: "2px 0" }}>✗ {w}</div>
          ))}
        </div>
      )}
      <button onClick={() => onNavigate("Biosecurity Assessment")}
        style={{ width: "100%", padding: "9px", borderRadius: 10, background: `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>
        Take Assessment
      </button>
    </Card>
  );
}

// ── Livestock Summary ──────────────────────────────────────────────────────
function LivestockSummary({ data, onNavigate }) {
  const rows = [
    ["Total Animals", data?.total ?? "—", P.olive],
    ["Poultry", data?.poultry ?? "—", P.info],
    ["Pigs", data?.pigs ?? "—", P.warning],
    ["Sick Animals", data?.sick ?? "—", P.danger],
    ["Vaccinated", data?.vaccinated ?? "—", P.success],
  ];
  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={Activity} title="Livestock Summary" />
      {rows.map(([label, val, color]) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${P.ivoryDark}` }}>
          <span style={{ fontSize: 12, color: P.mid }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
        </div>
      ))}
      <button onClick={() => onNavigate("Animals")}
        style={{ width: "100%", marginTop: 12, padding: "9px", borderRadius: 10, background: P.ivoryDark, color: P.olive, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        View Animals <ChevronRight size={13} />
      </button>
    </Card>
  );
}

// ── Disease Summary ────────────────────────────────────────────────────────
function DiseaseSummary({ data, onNavigate }) {
  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={AlertTriangle} title="Disease Reports" color={P.danger} />
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, background: P.redBg, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: P.danger, fontFamily: "Poppins", margin: 0 }}>{data?.active ?? 0}</p>
          <p style={{ fontSize: 10, color: P.mid, margin: 0 }}>Active</p>
        </div>
        <div style={{ flex: 1, background: P.ivoryDark, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: P.dark, fontFamily: "Poppins", margin: 0 }}>{data?.total ?? 0}</p>
          <p style={{ fontSize: 10, color: P.mid, margin: 0 }}>Total</p>
        </div>
      </div>
      {data?.recent?.slice(0, 2).map((r, i) => (
        <div key={i} style={{ fontSize: 11, color: P.mid, padding: "4px 0", borderBottom: `1px solid ${P.ivoryDark}` }}>
          <span style={{ fontWeight: 600, color: P.danger }}>Suspected {r.suspectedDisease}</span>
          <span style={{ marginLeft: 6 }}>{r.reportedDate ? formatDate(r.reportedDate) : ""}</span>
        </div>
      ))}
      <button onClick={() => onNavigate("Disease Report")}
        style={{ width: "100%", marginTop: 12, padding: "9px", borderRadius: 10, background: P.ivoryDark, color: P.danger, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        View Disease Reports <ChevronRight size={13} />
      </button>
    </Card>
  );
}

// ── Vaccination Summary ────────────────────────────────────────────────────
function VaccinationSummary({ data, onNavigate }) {
  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={Syringe} title="Vaccination" color={P.success} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[["Total", data?.total ?? 0, P.olive], ["Upcoming", data?.upcoming ?? 0, P.info], ["Overdue", data?.overdue ?? 0, P.danger]].map(([l, v, c]) => (
          <div key={l} style={{ background: c + "12", borderRadius: 10, padding: "8px", textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: "Poppins", margin: 0 }}>{v}</p>
            <p style={{ fontSize: 10, color: P.mid, margin: 0 }}>{l}</p>
          </div>
        ))}
      </div>
      <button onClick={() => onNavigate("Vaccination")}
        style={{ width: "100%", padding: "9px", borderRadius: 10, background: P.ivoryDark, color: P.success, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        View Vaccination <ChevronRight size={13} />
      </button>
    </Card>
  );
}

// ── Infrastructure Display ─────────────────────────────────────────────────
function InfrastructureDisplay({ infra = {}, sheds, area, capacity }) {
  const items = [
    ["Feed Storage", infra.feedStorage],
    ["Quarantine Area", infra.quarantineArea],
    ["Waste Disposal", infra.wasteDisposal],
    ["Disinfection Facility", infra.disinfectionFacility],
    ["Fencing / Security", infra.fencing],
    ["Visitor Entry Area", infra.visitorEntry],
  ];
  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={Building2} title="Infrastructure" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[["Sheds", sheds ?? "—"], ["Farm Area", area ? `${area} acres` : "—"], ["Capacity", capacity ?? "—"], ["Water Source", infra.waterSource || "—"]].map(([k, v]) => (
          <div key={k} style={{ background: P.ivoryDark, borderRadius: 10, padding: "10px 12px" }}>
            <p style={{ fontSize: 10, color: P.mid, margin: 0 }}>{k}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: P.dark, margin: "2px 0 0" }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {items.map(([label, val]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: val ? P.dark : P.light }}>
            {val ? <CheckCircle size={13} color={P.success} /> : <X size={13} color="#d1d5db" />}
            {label}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Location Map ───────────────────────────────────────────────────────────
function LocationMap({ lat, lon, onNavigate }) {
  const hasCoords = lat != null && lon != null && lat !== "" && lon !== "";
  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={MapPin} title="Farm Location" />
      {hasCoords ? (
        <>
          <div style={{ background: "#1a2810", borderRadius: 12, height: 140, position: "relative", overflow: "hidden", marginBottom: 10 }}>
            <svg viewBox="0 0 300 140" style={{ width: "100%", height: "100%" }}>
              {[...Array(6)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2="300" y2={i * 28} stroke="#2d4a1a" strokeWidth="0.5" />)}
              {[...Array(8)].map((_, i) => <line key={`v${i}`} x1={i * 43} y1="0" x2={i * 43} y2="140" stroke="#2d4a1a" strokeWidth="0.5" />)}
              <circle cx="150" cy="70" r="22" fill={P.olive} fillOpacity="0.2" />
              <circle cx="150" cy="70" r="10" fill={P.olive} />
              <circle cx="150" cy="70" r="4" fill={P.white} fillOpacity="0.7" />
              <text x="150" y="105" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">{Number(lat).toFixed(4)}°N, {Number(lon).toFixed(4)}°E</text>
            </svg>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ background: P.ivoryDark, borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ fontSize: 10, color: P.mid, margin: 0 }}>Latitude</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: P.dark, margin: 0 }}>{Number(lat).toFixed(6)}</p>
            </div>
            <div style={{ background: P.ivoryDark, borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ fontSize: 10, color: P.mid, margin: 0 }}>Longitude</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: P.dark, margin: 0 }}>{Number(lon).toFixed(6)}</p>
            </div>
          </div>
          <button onClick={() => onNavigate("Outbreak Map")}
            style={{ width: "100%", padding: "9px", borderRadius: 10, background: P.ivoryDark, color: P.olive, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            View on Outbreak Map <ChevronRight size={13} />
          </button>
        </>
      ) : (
        <EmptyState message="No coordinates set. Edit farm to add location." />
      )}
    </Card>
  );
}

// ── Activity Feed ──────────────────────────────────────────────────────────
function ActivityFeed({ farmId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!farmId) return;
    setLoading(true);
    getFarmActivity(farmId)
      .then(data => { setEvents(Array.isArray(data) ? data : []); setError(""); })
      .catch(() => setError("Unable to load activity."))
      .finally(() => setLoading(false));
  }, [farmId]);

  const typeIcon = { disease_report: AlertTriangle, vaccination: Syringe, biosecurity: Shield };
  const typeColor = { disease_report: P.danger, vaccination: P.success, biosecurity: P.olive };

  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={Clock} title="Recent Farm Activity" />
      {loading ? <Spinner /> : error ? <ErrorState message={error} /> : events.length === 0 ? (
        <EmptyState message="No activity recorded yet." />
      ) : (
        <div>
          {events.map((ev, i) => {
            const Icon = typeIcon[ev.type] || Info;
            const color = typeColor[ev.type] || P.mid;
            return (
              <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={13} color={color} />
                  </div>
                  {i < events.length - 1 && <div style={{ width: 1, flex: 1, background: P.ivoryDark, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <p style={{ fontSize: 12, color: P.dark, margin: 0 }}>{ev.label}</p>
                  <p style={{ fontSize: 10, color: P.light, margin: "2px 0 0" }}>
                    {ev.date ? formatDate(ev.date, { day: "numeric", month: "short" }) : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ── Farm Details View ──────────────────────────────────────────────────────
function FarmDetailsView({ farm }) {
  const rows = [
    ["Farm ID", farm.farmId],
    ["Registration No.", farm.registrationNo || "—"],
    ["Farm Type", farm.farmType || "—"],
    ["Established", farm.establishedYear || "—"],
    ["Phone", farm.phone || "—"],
    ["Email", farm.email || "—"],
    ["Village", farm.village || "—"],
    ["District", farm.district || "—"],
    ["State", farm.state || "—"],
    ["Pincode", farm.pincode || "—"],
    ["Address", farm.address || "—"],
  ];
  return (
    <Card style={{ padding: 18 }}>
      <SectionTitle icon={FileText} title="Farm Details" />
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${P.ivoryDark}` }}>
          <span style={{ fontSize: 11, color: P.mid }}>{k}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: P.dark, maxWidth: "60%", textAlign: "right", wordBreak: "break-word" }}>{String(v)}</span>
        </div>
      ))}
    </Card>
  );
}

// ── Main Module ────────────────────────────────────────────────────────────
export default function FarmManagementModule({ user, role, farms: propFarms = [], onNavigate }) {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [farmsError, setFarmsError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [mode, setMode] = useState("view"); // "view" | "edit" | "add"
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isFarmer = role === "farmer";
  const isAdmin  = role === "admin";
  const canEdit  = isFarmer || isAdmin;

  const loadFarms = useCallback(async () => {
    setLoadingFarms(true);
    setFarmsError("");
    try {
      let data;
      if (isFarmer && user?.userId) {
        data = await getFarmsByOwner(user.userId);
      } else {
        data = await getFarms();
      }
      const list = Array.isArray(data) ? data : [];
      setFarms(list);
      setSelectedFarm(prev => prev ? prev : (list.length > 0 ? list[0] : null));
    } catch {
      setFarmsError("Unable to load farms. Please check your connection.");
    } finally {
      setLoadingFarms(false);
    }
  }, [user?.userId, isFarmer]);

  useEffect(() => { loadFarms(); }, [loadFarms]);

  useEffect(() => {
    if (!selectedFarm?.farmId) return;
    setLoadingSummary(true);
    setSummaryError("");
    getFarmSummary(selectedFarm.farmId)
      .then(data => { setSummary(data); setSummaryError(""); })
      .catch(() => setSummaryError("Unable to load farm summary."))
      .finally(() => setLoadingSummary(false));
  }, [selectedFarm?.farmId]);

  const handleSave = async (formData) => {
    setSaving(true);
    setSaveError("");
    try {
      if (mode === "add") {
        const payload = {
          ...formData,
          ownerId: user?.userId || "",
          ownerName: formData.ownerName || user?.name || user?.fullName || "",
        };
        const res = await createFarm(payload);
        setSuccessMsg("Farm created successfully!");
        await loadFarms();
        setSelectedFarm(res.farm);
      } else {
        const res = await updateFarm(selectedFarm.farmId, formData);
        setSuccessMsg("Farm updated successfully!");
        setSelectedFarm(res.farm);
        setFarms(fs => fs.map(f => f.farmId === res.farm.farmId ? res.farm : f));
        getFarmSummary(res.farm.farmId).then(setSummary).catch(() => {});
      }
      setMode("view");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      setSaveError(e.message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const nav = (page) => { if (onNavigate) onNavigate(page); };

  if (loadingFarms) return (
    <div style={{ fontFamily: "Inter" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px 20px", background: `linear-gradient(135deg, ${P.olive}18, ${P.olive}06)`, borderRadius: 16, border: `1px solid ${P.olive}20` }}>
        <Leaf size={22} color={P.olive} />
        <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: P.dark, margin: 0 }}>Farm Management</h2>
      </div>
      <Spinner />
    </div>
  );

  if (farmsError) return (
    <div style={{ fontFamily: "Inter" }}>
      <ErrorState message={farmsError} onRetry={loadFarms} />
    </div>
  );

  if (mode === "add") return (
    <div style={{ fontFamily: "Inter", maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setMode("view")} style={{ background: P.ivoryDark, border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 12, color: P.mid, display: "flex", alignItems: "center", gap: 5 }}>
          <X size={13} /> Cancel
        </button>
        <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: P.dark, margin: 0 }}>Add New Farm</h2>
      </div>
      <FarmForm
        initial={{ ...EMPTY_FORM, ownerName: user?.name || user?.fullName || "" }}
        onSave={handleSave} onCancel={() => setMode("view")} saving={saving} saveError={saveError}
      />
    </div>
  );

  if (mode === "edit" && selectedFarm) return (
    <div style={{ fontFamily: "Inter", maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setMode("view")} style={{ background: P.ivoryDark, border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 12, color: P.mid, display: "flex", alignItems: "center", gap: 5 }}>
          <X size={13} /> Cancel
        </button>
        <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: P.dark, margin: 0 }}>Edit Farm — {selectedFarm.farmName}</h2>
      </div>
      <FarmForm
        initial={{
          ...EMPTY_FORM, ...selectedFarm,
          farmArea: selectedFarm.farmArea ?? "",
          animalCapacity: selectedFarm.animalCapacity ?? "",
          animalCount: selectedFarm.animalCount ?? "",
          numberOfSheds: selectedFarm.numberOfSheds ?? "",
          establishedYear: selectedFarm.establishedYear ? String(selectedFarm.establishedYear) : "",
          latitude: selectedFarm.latitude ?? "",
          longitude: selectedFarm.longitude ?? "",
          infrastructure: selectedFarm.infrastructure || EMPTY_FORM.infrastructure,
        }}
        onSave={handleSave} onCancel={() => setMode("view")} saving={saving} saveError={saveError}
      />
    </div>
  );

  // View mode
  const farm = selectedFarm;
  const liveStock = summary?.livestock;
  const biosec    = summary?.biosecurity;
  const vax       = summary?.vaccination;
  const disease   = summary?.diseaseReports;

  return (
    <div style={{ fontFamily: "Inter" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "16px 20px", background: `linear-gradient(135deg, ${P.olive}18, ${P.olive}06)`, borderRadius: 16, border: `1px solid ${P.olive}20` }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: P.olive, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Leaf size={20} color={P.white} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: P.dark, margin: 0 }}>Farm Management</h2>
          <p style={{ fontSize: 11, color: P.mid, margin: "2px 0 0" }}>Manage farm details, infrastructure, and linked modules</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canEdit && (
            <button onClick={() => setMode("add")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>
              <Plus size={13} /> Add Farm
            </button>
          )}
          <button onClick={loadFarms}
            style={{ width: 34, height: 34, borderRadius: 10, background: P.ivoryDark, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={14} color={P.mid} />
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: P.greenBg, border: `1px solid ${P.success}30`, borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: P.success, fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {farms.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: P.mid, display: "block", marginBottom: 6 }}>Select Farm</label>
          <div style={{ position: "relative", display: "inline-block", minWidth: 280 }}>
            <select value={farm?.farmId || ""} onChange={e => {
              const f = farms.find(x => x.farmId === e.target.value);
              setSelectedFarm(f || null);
              setSummary(null);
            }} style={{ padding: "9px 36px 9px 14px", borderRadius: 10, border: "1.5px solid rgba(128,128,52,0.2)", fontSize: 13, color: P.dark, background: P.white, outline: "none", appearance: "none", cursor: "pointer", minWidth: 280 }}>
              {farms.map(f => <option key={f.farmId} value={f.farmId}>{f.farmName} — {f.district || f.state || f.farmId}</option>)}
            </select>
            <ChevronDown size={13} color={P.mid} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>
      )}

      {!farm ? (
        <Card style={{ padding: 32 }}>
          <EmptyState message="No farm found. Add your first farm to get started." />
          {canEdit && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={() => setMode("add")}
                style={{ padding: "10px 24px", borderRadius: 12, background: `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                + Add Farm
              </button>
            </div>
          )}
        </Card>
      ) : (
        <>
          <Card style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: P.olive + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Leaf size={24} color={P.olive} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "Poppins", fontSize: 17, fontWeight: 700, color: P.dark, margin: 0 }}>{farm.farmName}</h3>
                  <p style={{ fontSize: 12, color: P.mid, margin: "3px 0 0" }}>
                    {farm.farmId} · {farm.farmType} · {farm.district || farm.state || ""}
                  </p>
                  <div style={{ marginTop: 6 }}><StatusBadge status={farm.status || "Active"} /></div>
                </div>
              </div>
              {canEdit && (
                <button onClick={() => setMode("edit")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: P.ivoryDark, color: P.olive, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>
                  <Edit2 size={13} /> Edit Farm
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginTop: 16 }}>
              <KPI label="Animals" value={farm.animalCount ?? liveStock?.total ?? "—"} icon={Activity} color={P.olive} />
              <KPI label="Sheds" value={farm.numberOfSheds ?? "—"} icon={Building2} color={P.info} />
              <KPI label="Farm Area" value={farm.farmArea ? `${farm.farmArea} ac` : "—"} icon={Leaf} color={P.success} />
              <KPI label="Capacity" value={farm.animalCapacity ?? "—"} icon={CheckCircle} color={P.warning} />
            </div>
          </Card>

          {loadingSummary ? <Spinner /> : summaryError ? (
            <div style={{ marginBottom: 16 }}>
              <ErrorState message={summaryError} onRetry={() => getFarmSummary(farm.farmId).then(setSummary).catch(() => {})} />
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <LocationMap lat={farm.latitude} lon={farm.longitude} onNavigate={nav} />
                <BiosecuritySummary data={biosec} onNavigate={nav} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <InfrastructureDisplay infra={farm.infrastructure || {}} sheds={farm.numberOfSheds} area={farm.farmArea} capacity={farm.animalCapacity} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <LivestockSummary data={liveStock} onNavigate={nav} />
                <DiseaseSummary data={disease} onNavigate={nav} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <VaccinationSummary data={vax} onNavigate={nav} />
                <FarmDetailsView farm={farm} />
              </div>
            </>
          )}
          <ActivityFeed farmId={farm.farmId} />
        </>
      )}
    </div>
  );
}
