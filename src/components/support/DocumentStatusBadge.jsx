import React from "react";

export default function DocumentStatusBadge({ status }) {
  let badgeStyle = {};
  let label = status;

  switch (status) {
    case "NOT_SUBMITTED":
      badgeStyle = { background: "#f0edf3", color: "#655c72" };
      label = "Not Submitted";
      break;
    case "PENDING":
      badgeStyle = { background: "var(--ui-warning-soft)", color: "var(--ui-warning)" };
      label = "Pending";
      break;
    case "VERIFIED":
      badgeStyle = { background: "var(--ui-success-soft)", color: "var(--ui-success)" };
      label = "Verified";
      break;
    case "REJECTED":
      badgeStyle = { background: "#fdeced", color: "var(--ui-danger)" };
      label = "Rejected";
      break;
    case "EXPIRED":
      badgeStyle = { background: "#fef3c7", color: "#b45309" };
      label = "Expired";
      break;
    default:
      badgeStyle = { background: "#f0edf3", color: "#655c72" };
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
        ...badgeStyle
      }}
    >
      {label}
    </span>
  );
}
