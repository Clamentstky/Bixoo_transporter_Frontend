import React from "react";
import Icon from "../Icon";

function SupportOptionCard({ title, description, icon, actionText, onClick, disabled = false }) {
  return (
    <div 
      className="support-option-card"
      style={{
        background: "white",
        borderRadius: "14px",
        padding: "20px",
        border: "1px solid var(--ui-border)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ 
          display: "grid", 
          placeItems: "center", 
          width: "48px", 
          height: "48px", 
          borderRadius: "12px", 
          background: "var(--ui-purple-soft)", 
          color: "var(--ui-purple)",
          flexShrink: 0
        }}>
          <Icon name={icon} size={24} />
        </div>
        <div>
          <strong style={{ display: "block", fontSize: "16px", fontWeight: "700", color: "var(--ui-text)" }}>{title}</strong>
          <span style={{ fontSize: "14px", color: "var(--ui-muted)" }}>{description}</span>
        </div>
      </div>
      
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--ui-purple-faint)",
          borderRadius: "10px",
          color: "var(--ui-purple)",
          fontWeight: "600",
          fontSize: "14px",
          cursor: disabled ? "not-allowed" : "pointer",
          border: 0,
          opacity: disabled ? 0.65 : 1,
          transition: "background 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'var(--ui-purple-soft)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'var(--ui-purple-faint)'}
      >
        <span>{actionText}</span>
        <Icon name="arrow" size={16} />
      </button>
    </div>
  );
}

export default SupportOptionCard;
