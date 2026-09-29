import React from "react";
import Icon from "../Icon";

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div 
      className="faq-item"
      style={{
        background: "white",
        border: "1px solid var(--ui-border)",
        borderRadius: "14px",
        overflow: "hidden",
        marginBottom: "12px",
        transition: "box-shadow 0.2s"
      }}
    >
      <div 
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: isOpen ? "var(--ui-purple-faint)" : "white",
          transition: "background 0.2s"
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--ui-text)", paddingRight: "16px", lineHeight: "1.4" }}>
          {question}
        </span>
        <div style={{
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease-in-out",
          color: "var(--ui-muted)",
          display: "flex"
        }}>
          <Icon name="arrow" size={18} />
        </div>
      </div>
      
      <div 
        style={{
          maxHeight: isOpen ? "500px" : "0",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
          padding: isOpen ? "0 18px 16px 18px" : "0 18px",
          background: "var(--ui-purple-faint)"
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", color: "var(--ui-muted)", lineHeight: "1.6" }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default FAQItem;
