import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

function SupportPageHeader({ title, subtitle, backTo = "/profile" }) {
  const navigate = useNavigate();

  return (
    <div className="support-page-header" style={{ marginBottom: "24px" }}>
      <Button 
        variant="ghost" 
        size="lg" 
        icon="arrowLeft" 
        onClick={() => navigate(backTo)} 
        style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px", background: "white", marginBottom: "20px" }} 
      />
      
      <span style={{ display: "block", color: "var(--ui-purple)", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
        TRANSPORTER SUPPORT
      </span>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--ui-text)", margin: "0 0 8px 0" }}>{title}</h1>
      {subtitle && <p style={{ fontSize: "15px", color: "var(--ui-muted)", margin: 0, lineHeight: "1.5" }}>{subtitle}</p>}
    </div>
  );
}

export default SupportPageHeader;
