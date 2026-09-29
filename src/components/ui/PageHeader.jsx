export default function PageHeader({ eyebrow = "TRANSPORTER", title, description, action, className = "" }) {
  return (
    <header className={`ui-page-header-wrapper ${className}`} style={{ marginBottom: "var(--space-8)" }}>
      <div className="ui-page-header-top" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "nowrap" }}>
        <div className="ui-page-heading" style={{ minWidth: 0, paddingBottom: description ? "8px" : "0" }}>
          {eyebrow && <span className="ui-eyebrow">{eyebrow}</span>}
          <h1 style={{ margin: 0, fontSize: "var(--font-title)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.8px", overflowWrap: "anywhere" }}>{title}</h1>
        </div>
        {action && <div className="ui-page-action" style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      {description && <p style={{ color: "var(--ui-muted)", margin: 0, fontSize: "var(--font-body)" }}>{description}</p>}
    </header>
  );
}
