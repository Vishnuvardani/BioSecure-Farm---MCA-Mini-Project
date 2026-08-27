import { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle, Info, RefreshCw, Send, MapPin, Shield, Syringe, Flag } from "lucide-react";
import { getMyNotifications, markNotificationRead, sendNotification } from "../../api/mongoService";
import { formatDateTime } from "../../utils/dateTime";

const P = {
  red: "#C62828", redBg: "#fef2f2",
  yellow: "#F9A825", yellowBg: "#fffde7",
  green: "#4CAF50", greenBg: "#f0fdf4",
  blue: "#1565C0", blueBg: "#e3f2fd",
  purple: "#6d28d9", purpleBg: "#f5f3ff",
  orange: "#E65100", orangeBg: "#fff3e0",
  gray: "#6b7280", dark: "#1a1a2e", white: "#ffffff",
  olive: "#808034", oliveDark: "#5c5c24", ivoryDark: "#f0f0d8",
};

const TYPE_CONFIG = {
  HIGH_RISK_ALERT:       { color: P.red,    bg: P.redBg,    icon: AlertTriangle, label: "High Risk Alert" },
  DISEASE_REPORT:        { color: P.orange, bg: P.orangeBg, icon: AlertTriangle, label: "Disease Report" },
  NEARBY_OUTBREAK:       { color: P.red,    bg: P.redBg,    icon: MapPin,        label: "Nearby Outbreak" },
  BIOSECURITY_ALERT:     { color: P.yellow, bg: P.yellowBg, icon: Shield,        label: "Biosecurity Alert" },
  GOVERNMENT_ADVISORY:   { color: P.blue,   bg: P.blueBg,   icon: Flag,          label: "Gov't Advisory" },
  VACCINATION_REMINDER:  { color: P.green,  bg: P.greenBg,  icon: Syringe,       label: "Vaccination" },
  INSPECTION_UPDATE:     { color: P.purple, bg: P.purpleBg, icon: CheckCircle,   label: "Inspection Update" },
  GENERAL:               { color: P.gray,   bg: "#f3f4f6",  icon: Info,          label: "General" },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.GENERAL;
}

function timeAgo(date) {
  const timestamp = date instanceof Date ? date.getTime() : new Date(date || 0).getTime();
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "Date unavailable";
  const diff = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationItem({ notif, onRead }) {
  const cfg = getTypeConfig(notif.type);
  const Icon = cfg.icon;
  const notificationDate = notif.sentAt || notif.createdAt;
  return (
    <div onClick={() => !notif.isRead && onRead(notif.notificationId)}
      style={{ display: "flex", gap: 12, padding: "14px 18px", borderBottom: "1px solid #f3f4f6", background: notif.isRead ? P.white : cfg.bg + "80", cursor: notif.isRead ? "default" : "pointer", transition: "background 0.2s" }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${cfg.color}20` }}>
        <Icon size={16} color={cfg.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
          <p style={{ fontSize: 13, fontWeight: notif.isRead ? 500 : 700, color: P.dark, margin: 0, lineHeight: 1.3 }}>{notif.title}</p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: P.gray, whiteSpace: "nowrap" }} title={formatDateTime(notificationDate)}>{timeAgo(notificationDate)}</span>
            {!notif.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />}
          </div>
        </div>
        <p style={{ fontSize: 12, color: P.gray, margin: 0, lineHeight: 1.4 }}>{notif.message}</p>
        <span style={{ display: "inline-block", marginTop: 5, fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 6 }}>{cfg.label}</span>
      </div>
    </div>
  );
}

function SendNotificationForm({ onSent }) {
  const [form, setForm] = useState({ targetRole: "Farmer", title: "", message: "", type: "GENERAL" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!form.title || !form.message) return;
    setSending(true);
    try {
      await sendNotification(form);
      setSent(true);
      setForm({ targetRole: "Farmer", title: "", message: "", type: "GENERAL" });
      setTimeout(() => { setSent(false); onSent?.(); }, 2000);
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  return (
    <div style={{ background: P.white, borderRadius: 16, border: "1px solid #e5e7eb", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Send size={15} color={P.olive} />
        <h3 style={{ fontFamily: "Poppins", fontSize: 14, fontWeight: 700, color: P.dark, margin: 0 }}>Send Notification</h3>
      </div>
      {sent && (
        <div style={{ background: P.greenBg, border: `1px solid ${P.green}30`, borderRadius: 10, padding: "8px 14px", marginBottom: 12, fontSize: 12, color: P.green, fontWeight: 600 }}>
          ✓ Notification sent successfully
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Target Role</label>
          <select value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, background: P.white, outline: "none" }}>
            {["Farmer", "Veterinarian", "Government Officer", "Admin"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Notification Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, background: P.white, outline: "none" }}>
            {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Title *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title..."
          style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: P.gray, display: "block", marginBottom: 5 }}>Message *</label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Notification message..."
          style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 12, color: P.dark, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>
      <button onClick={handleSend} disabled={sending || !form.title || !form.message}
        style={{ width: "100%", padding: "11px", borderRadius: 12, background: (!form.title || !form.message || sending) ? "#9ca3af" : `linear-gradient(135deg, ${P.olive}, ${P.oliveDark})`, color: P.white, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <Send size={14} /> {sending ? "Sending..." : "Send Notification"}
      </button>
    </div>
  );
}

export default function NotificationSystemModule({ user, role }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [tab, setTab] = useState("inbox");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch { setNotifications([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(ns => ns.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markNotificationRead(n.notificationId).catch(() => {})));
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (filter === "Unread") return !n.isRead;
    if (filter === "All") return true;
    return n.type === filter;
  });

  // Role-based notification guide
  const roleGuide = {
    Farmer: ["Disease report confirmation", "Veterinary inspection updates", "Biosecurity recommendations", "Nearby outbreak alerts", "Vaccination reminders", "Government advisories"],
    Veterinarian: ["New disease reports", "Assigned inspection alerts", "High-risk farm alerts", "Nearby potential exposure alerts", "Biosecurity assessment alerts"],
    "Government Officer": ["High-risk outbreak alerts", "District-level outbreak notifications", "GIS hotspot alerts", "Biosecurity compliance alerts", "Disease trend alerts"],
    Admin: ["System alerts", "New outbreak reports", "User activity alerts", "Data monitoring alerts"],
  };

  return (
    <div style={{ fontFamily: "Inter" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "16px 20px", background: `linear-gradient(135deg, ${P.olive}18, ${P.olive}06)`, borderRadius: 16, border: `1px solid ${P.olive}20` }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: P.olive, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={20} color={P.white} />
          </div>
          {unreadCount > 0 && (
            <div style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: P.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: P.white }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700, color: P.dark, margin: 0 }}>Notifications</h2>
          <p style={{ fontSize: 11, color: P.gray, margin: "2px 0 0" }}>{unreadCount} unread · {notifications.length} total</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ padding: "7px 14px", borderRadius: 10, background: P.greenBg, border: `1px solid ${P.green}30`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: P.green }}>
              Mark all read
            </button>
          )}
          <button onClick={load} style={{ width: 34, height: 34, borderRadius: 10, background: P.ivoryDark, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={14} color={P.gray} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["inbox", "Inbox", Bell], ["send", "Send", Send]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === id ? P.olive : P.ivoryDark, color: tab === id ? P.white : P.gray }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          <div>
            {/* Filter Chips */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {["All", "Unread", "HIGH_RISK_ALERT", "DISEASE_REPORT", "NEARBY_OUTBREAK", "BIOSECURITY_ALERT", "GOVERNMENT_ADVISORY"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: "5px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: filter === f ? P.olive : "#f3f4f6", color: filter === f ? P.white : P.gray }}>
                  {f === "All" ? "All" : f === "Unread" ? `Unread (${unreadCount})` : TYPE_CONFIG[f]?.label || f}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div style={{ background: P.white, borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: P.gray }}>Loading notifications...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <Bell size={32} color="#d1d5db" style={{ marginBottom: 8 }} />
                  <p style={{ color: P.gray, margin: 0, fontSize: 13 }}>No notifications found</p>
                </div>
              ) : (
                filtered.map(n => <NotificationItem key={n.notificationId || n._id} notif={n} onRead={handleRead} />)
              )}
            </div>
          </div>

          {/* Role Guide */}
          <div>
            <div style={{ background: P.white, borderRadius: 16, border: "1px solid #e5e7eb", padding: 18 }}>
              <h3 style={{ fontFamily: "Poppins", fontSize: 13, fontWeight: 700, color: P.dark, marginBottom: 12 }}>
                {role || "Your"} Notifications
              </h3>
              <p style={{ fontSize: 11, color: P.gray, marginBottom: 10 }}>You receive notifications for:</p>
              {(roleGuide[role] || roleGuide.Farmer).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <CheckCircle size={12} color={P.green} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 11, color: P.gray }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ background: P.white, borderRadius: 16, border: "1px solid #e5e7eb", padding: 18, marginTop: 12 }}>
              <h3 style={{ fontFamily: "Poppins", fontSize: 13, fontWeight: 700, color: P.dark, marginBottom: 12 }}>Summary</h3>
              {[
                ["Total", notifications.length, P.olive],
                ["Unread", unreadCount, P.red],
                ["High Risk", notifications.filter(n => n.type === "HIGH_RISK_ALERT").length, P.red],
                ["Disease Reports", notifications.filter(n => n.type === "DISEASE_REPORT").length, P.orange],
                ["Advisories", notifications.filter(n => n.type === "GOVERNMENT_ADVISORY").length, P.blue],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 12, color: P.gray }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "send" && (
        <div style={{ maxWidth: 560 }}>
          <SendNotificationForm onSent={load} />
        </div>
      )}
    </div>
  );
}
