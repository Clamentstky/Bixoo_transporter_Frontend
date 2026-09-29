import Icon from "../Icon";
import "./Button.css";

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  icon,
  iconPosition = "left",
  loading = false,
  loadingText,
  disabled = false,
  fullWidth = false,
  children,
  ...props
}) {
  const baseClass = "bixoo-btn";
  const classes = [
    baseClass,
    `${baseClass}-${variant}`,
    `${baseClass}-size-${size}`,
    fullWidth ? `${baseClass}-full` : "",
    loading ? `${baseClass}-loading` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={`${baseClass}-spinner`}>
          <Icon name="spinner" size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
        </span>
      )}
      
      {!loading && icon && iconPosition === "left" && (
        <Icon name={icon} size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
      )}
      
      <span>{loading && loadingText ? loadingText : children}</span>
      
      {!loading && icon && iconPosition === "right" && (
        <Icon name={icon} size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
      )}
    </button>
  );
}
