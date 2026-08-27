import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Stethoscope, Users, XCircle } from "lucide-react";
import { createAppointment, getAppointments, getAvailableVeterinarians, updateAppointmentStatus } from "../../api/mongoService";
import { formatDate, getLocalDateInputValue } from "../../utils/dateTime";

const P = { green: "#2f855a", greenBg: "#ecfdf3", blue: "#1565c0", blueBg: "#eff6ff", yellow: "#b7791f", yellowBg: "#fffbeb", red: "#c62828", redBg: "#fef2f2", purple: "#6d28d9", purpleBg: "#f5f3ff", dark: "#1a1a2e", gray: "#64748b", white: "#fff" };
const SLOTS = ["09:00", "10:30", "13:30", "15:30"];
const today = getLocalDateInputValue();

const displayDate = (date) => date ? formatDate(date, { day: "numeric", month: "short" }) : "-";
const input = { width: "100%", boxSizing: "border-box", border: "1px solid #dbe2ea", borderRadius: 6, padding: "9px 10px", color: P.dark, background: P.white, fontSize: 12 };

function StatusBadge({ status }) {
  const styles = {
    PENDING: [P.yellow, P.yellowBg, "Pending"], CONFIRMED: [P.green, P.greenBg, "Confirmed"], REJECTED: [P.red, P.redBg, "Declined"],
  };
  const [color, background, label] = styles[status] || [P.gray, "#f1f5f9", status];
  return <span style={{ color, background, borderRadius: 999, padding: "4px 8px", fontSize: 10, fontWeight: 700 }}>{label}</span>;
}

function VetCard({ vet, onBook }) {
  const availability = vet.availability === "AVAILABLE" ? [P.green, P.greenBg, "Available"] : [P.yellow, P.yellowBg, "Limited availability"];
  const specializations = Array.isArray(vet.specializations) ? vet.specializations : [vet.specializations].filter(Boolean);
  return <article style={{ background: P.white, border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: P.purpleBg, color: P.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{vet.name?.split(" ").map(part => part[0]).join("").slice(0, 2) || "DR"}</div>
      <div style={{ minWidth: 0 }}><h3 style={{ margin: 0, color: P.dark, fontSize: 14 }}>{vet.name}</h3><p style={{ margin: "2px 0 0", color: P.gray, fontSize: 11 }}>{vet.userId}</p></div>
    </div>
    <p style={{ color: P.gray, fontSize: 12, margin: 0 }}>{specializations.join(", ") || "General livestock"}</p>
    <div style={{ display: "grid", gap: 6, color: P.gray, fontSize: 11 }}>
      <span style={{ display: "flex", gap: 5, alignItems: "center" }}><MapPin size={13} /> {vet.proximityLabel || vet.district || "Service location not specified"}{vet.district ? ` · ${vet.district}` : ""}</span>
      <span style={{ display: "flex", gap: 5, alignItems: "center" }}><Users size={13} /> Farm load: {vet.workload} / {vet.capacity}</span>
      <span style={{ color: availability[0], background: availability[1], borderRadius: 999, width: "fit-content", padding: "4px 7px", fontWeight: 700 }}>{availability[2]}</span>
    </div>
    <button onClick={() => onBook(vet)} style={{ marginTop: "auto", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 6, border: "none", borderRadius: 6, background: P.green, color: P.white, padding: "9px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}><CalendarDays size={14} /> Book appointment</button>
  </article>;
}

function FarmerAppointments({ farms, user }) {
  const [farmId, setFarmId] = useState(farms[0]?.farmId || "");
  const [vets, setVets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedVet, setSelectedVet] = useState(null);
  const [form, setForm] = useState({ date: today, time: SLOTS[0], visitType: "Farm Visit", reason: "" });
  const [message, setMessage] = useState("");
  const selectedFarm = farms.find(farm => farm.farmId === farmId);

  const reloadAppointments = () => user?.userId && getAppointments({ farmerId: user.userId }).then(setAppointments).catch(() => setAppointments([]));
  useEffect(() => { reloadAppointments(); }, [user?.userId]);
  useEffect(() => {
    setSelectedVet(null);
    if (!farmId) return setVets([]);
    getAvailableVeterinarians(farmId).then(data => setVets(Array.isArray(data) ? data : [])).catch(() => setVets([]));
  }, [farmId]);

  const submit = async () => {
    if (!selectedVet || !selectedFarm) return;
    try {
      await createAppointment({ farmId, farmerId: user.userId, veterinarianId: selectedVet.userId, appointmentDate: form.date, appointmentTime: form.time, visitType: form.visitType, reason: form.reason });
      setMessage("Booking request sent. The veterinarian must accept it before the farm is assigned.");
      setSelectedVet(null); setForm({ date: today, time: SLOTS[0], visitType: "Farm Visit", reason: "" }); reloadAppointments();
    } catch (error) { setMessage(error.message || "Unable to send booking request."); }
  };

  return <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "Inter" }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center", background: P.greenBg, border: "1px solid #bbf7d0", borderRadius: 8, padding: "16px 18px", marginBottom: 16 }}><div style={{ width: 38, height: 38, borderRadius: 8, display: "grid", placeItems: "center", background: P.green, color: P.white }}><Stethoscope size={19} /></div><div><h2 style={{ margin: 0, fontSize: 16, color: P.dark }}>Find Veterinarian</h2><p style={{ margin: "3px 0 0", fontSize: 12, color: P.gray }}>Choose a suitable veterinarian and request a farm visit.</p></div></div>
    {message && <div style={{ marginBottom: 14, borderRadius: 6, padding: "10px 12px", background: P.blueBg, color: P.blue, fontSize: 12 }}>{message}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, .65fr)", gap: 16, alignItems: "start" }}>
      <section><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}><div><h3 style={{ margin: 0, color: P.dark, fontSize: 14 }}>Suitable veterinarians</h3><p style={{ margin: "3px 0 0", fontSize: 11, color: P.gray }}>Filtered by farm type, service district, availability and workload.</p></div><select aria-label="Select farm" value={farmId} onChange={event => setFarmId(event.target.value)} style={{ ...input, width: 210 }}>{farms.map(farm => <option key={farm.farmId} value={farm.farmId}>{farm.farmName}</option>)}</select></div>
        {selectedFarm && <div style={{ background: P.white, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 12, color: P.gray }}><strong style={{ color: P.dark }}>{selectedFarm.farmName}</strong><span> · {selectedFarm.farmId} · {selectedFarm.farmType} · {selectedFarm.animalCount || 0} animals · {selectedFarm.district || "Location unavailable"}</span></div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>{vets.length ? vets.map(vet => <VetCard key={vet.userId} vet={vet} onBook={setSelectedVet} />) : <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 28, color: P.gray, background: P.white, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}>No suitable veterinarians are currently available for this farm.</div>}</div>
      </section>
      <aside style={{ background: P.white, border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: P.dark }}>{selectedVet ? `Book ${selectedVet.name}` : "Select a veterinarian"}</h3>
        {selectedVet ? <div style={{ display: "grid", gap: 11 }}><label style={{ fontSize: 11, color: P.gray }}>Date<input type="date" min={today} value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} style={{ ...input, marginTop: 4 }} /></label><label style={{ fontSize: 11, color: P.gray }}>Time<select value={form.time} onChange={event => setForm(current => ({ ...current, time: event.target.value }))} style={{ ...input, marginTop: 4 }}>{SLOTS.map(slot => <option key={slot}>{slot}</option>)}</select></label><label style={{ fontSize: 11, color: P.gray }}>Visit type<select value={form.visitType} onChange={event => setForm(current => ({ ...current, visitType: event.target.value }))} style={{ ...input, marginTop: 4 }}><option>Farm Visit</option><option>Online Consultation</option></select></label><label style={{ fontSize: 11, color: P.gray }}>Reason<textarea value={form.reason} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} rows="3" placeholder="Reason for consultation" style={{ ...input, marginTop: 4, resize: "vertical" }} /></label><button onClick={submit} style={{ border: "none", borderRadius: 6, padding: "10px", background: P.green, color: P.white, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Send booking request</button></div> : <p style={{ margin: 0, color: P.gray, fontSize: 12 }}>Choose an available veterinarian to see appointment slots.</p>}
      </aside>
    </div>
    <section style={{ marginTop: 18, background: P.white, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}><h3 style={{ margin: 0, padding: "14px 16px", borderBottom: "1px solid #e2e8f0", color: P.dark, fontSize: 14 }}>My appointment requests</h3>{appointments.length ? appointments.map(appointment => <div key={appointment.appointmentId} style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}><div><strong style={{ color: P.dark, fontSize: 12 }}>{appointment.veterinarianName}</strong><p style={{ margin: "3px 0 0", color: P.gray, fontSize: 11 }}>{appointment.farmName} · {displayDate(appointment.appointmentDate)} · {appointment.appointmentTime}</p></div><StatusBadge status={appointment.status} /></div>) : <p style={{ padding: 16, margin: 0, color: P.gray, fontSize: 12 }}>No appointment requests yet.</p>}</section>
  </div>;
}

function VetAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const reload = () => user?.userId && getAppointments({ veterinarianId: user.userId }).then(data => setAppointments(Array.isArray(data) ? data : [])).catch(() => setAppointments([]));
  useEffect(() => { reload(); }, [user?.userId]);
  const respond = async (appointment, status) => {
    try { await updateAppointmentStatus(appointment.appointmentId, { status, veterinarianId: user.userId }); setMessage(status === "CONFIRMED" ? `${appointment.farmName} has been added to My Assigned Farms.` : "Appointment request declined."); reload(); }
    catch (error) { setMessage(error.message || "Unable to update appointment."); }
  };
  const pending = useMemo(() => appointments.filter(appointment => appointment.status === "PENDING"), [appointments]);
  return <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "Inter" }}><div style={{ display: "flex", gap: 12, alignItems: "center", background: P.purpleBg, border: `1px solid ${P.purple}25`, borderRadius: 8, padding: "16px 18px", marginBottom: 16 }}><div style={{ width: 38, height: 38, borderRadius: 8, display: "grid", placeItems: "center", background: P.purple, color: P.white }}><CalendarDays size={19} /></div><div><h2 style={{ margin: 0, fontSize: 16, color: P.dark }}>Appointment Requests</h2><p style={{ margin: "3px 0 0", fontSize: 12, color: P.gray }}>{pending.length} request{pending.length === 1 ? "" : "s"} awaiting your response.</p></div></div>{message && <div style={{ marginBottom: 14, borderRadius: 6, padding: "10px 12px", background: P.greenBg, color: P.green, fontSize: 12 }}>{message}</div>}<section style={{ background: P.white, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>{appointments.length ? appointments.map(appointment => <div key={appointment.appointmentId} style={{ padding: "15px 16px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}><div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><strong style={{ color: P.dark, fontSize: 13 }}>{appointment.farmName}</strong><StatusBadge status={appointment.status} /></div><p style={{ margin: "5px 0 0", color: P.gray, fontSize: 11 }}>{appointment.farmerName} · {appointment.farmType} · {appointment.district || "Location unavailable"}</p><p style={{ margin: "3px 0 0", color: P.gray, fontSize: 11, display: "flex", gap: 5, alignItems: "center" }}><Clock3 size={12} /> {displayDate(appointment.appointmentDate)} at {appointment.appointmentTime} · {appointment.visitType}</p>{appointment.reason && <p style={{ margin: "4px 0 0", color: P.gray, fontSize: 11 }}>Reason: {appointment.reason}</p>}</div>{appointment.status === "PENDING" && <div style={{ display: "flex", gap: 8 }}><button onClick={() => respond(appointment, "REJECTED")} title="Reject appointment" style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "8px 10px", border: "1px solid #fecaca", borderRadius: 6, background: P.redBg, color: P.red, cursor: "pointer", fontSize: 12, fontWeight: 700 }}><XCircle size={14} /> Reject</button><button onClick={() => respond(appointment, "CONFIRMED")} title="Accept appointment and assign farm" style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "8px 10px", border: "none", borderRadius: 6, background: P.green, color: P.white, cursor: "pointer", fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={14} /> Accept</button></div>}</div>) : <p style={{ margin: 0, textAlign: "center", padding: 30, color: P.gray, fontSize: 12 }}>No appointment requests yet.</p>}</section></div>;
}

export default function VeterinaryAppointmentsModule({ farms, user, role }) {
  return role === "veterinarian" ? <VetAppointments user={user} /> : <FarmerAppointments farms={farms} user={user} />;
}
