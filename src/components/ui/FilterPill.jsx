import "./FilterPill.css";

export default function FilterPill({
  active = false,
  label,
  children,
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
      aria-pressed={active}
      {...props}
    >
      {label ?? children}
      {count !== undefined && <span className="filter-pill-count">{count}</span>}
    </button>
  );
}
