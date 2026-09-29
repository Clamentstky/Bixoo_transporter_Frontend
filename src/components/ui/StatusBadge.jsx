const tones = {
  "NEW LOAD": "purple", AVAILABLE: "purple", SCHEDULED: "neutral", ACCEPTED: "purple",
  "GOING TO PICKUP": "warning", "PICKED UP": "info", "IN TRANSIT": "purple",
  DELIVERED: "success", COMPLETED: "success", SETTLED: "success", ACTIVE: "success", VERIFIED: "success",
};
export default function StatusBadge({ status, tone, dot = false }) {
  return <span className={`ui-badge ${tone || tones[status.toUpperCase()] || "neutral"}`}>{dot && <i aria-hidden="true" />}{status}</span>;
}
