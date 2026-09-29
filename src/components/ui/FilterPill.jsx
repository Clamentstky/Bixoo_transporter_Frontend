import "./FilterPill.css";

export default function FilterPill({
  active = false,
  label,
  count,
  onClick,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`bixoo-filter-pill ${active ? "active" : ""} ${className}`}
      onClick={onClick}
      {...props}
    >
      {label}
      {count !== undefined && <span className="filter-pill-count">{count}</span>}
    </button>
  );
}
