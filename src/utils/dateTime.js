const DATE_FORMAT = { day: "2-digit", month: "2-digit", year: "numeric" };
const DATE_TIME_FORMAT = { ...DATE_FORMAT, hour: "2-digit", minute: "2-digit" };

function parseDate(value) {
  if (!value) return null;
  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T00:00:00`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("en-IN", { ...DATE_FORMAT, ...options }) : "-";
}

export function formatDateTime(value, options = {}) {
  const date = parseDate(value);
  return date ? date.toLocaleString("en-IN", { ...DATE_TIME_FORMAT, ...options }) : "-";
}

export function formatTime(value, options = {}) {
  const date = parseDate(value);
  return date ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", ...options }) : "-";
}

export function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}