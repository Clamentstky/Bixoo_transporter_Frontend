import Icon from "./Icon";
import StatusBadge from "./ui/StatusBadge";
import "./LoadCard.css";

export default function LoadCard({ load, onClick }) {
  return (
    <button type="button" className="freight-card" onClick={onClick}>
      <span className="freight-card-top">
        <StatusBadge status={load.status} />
        <span className="freight-distance"><Icon name="pin" size={16} />{load.distance}</span>
      </span>
      <span className="freight-route">
        <span className="freight-point"><span className="freight-dot" /><span><small>Pickup</small><strong>{load.pickup}</strong></span></span>
        <span className="freight-point"><span className="freight-dot destination" /><span><small>Delivery</small><strong>{load.delivery}</strong></span></span>
      </span>
      <span className="freight-meta"><strong>{load.weight}</strong><span>{load.type}</span></span>
      <span className="freight-load-details">
        <span><Icon name="truck" size={15} />{load.vehicle || "Vehicle requirement unavailable"}</span>
        <strong>{load.payout != null ? `\u20B9${Number(load.payout).toLocaleString("en-IN")} estimated earnings` : "Earnings unavailable"}</strong>
      </span>
      <span className="freight-footer"><span><Icon name="clock" size={16} />Starts at {load.start}</span><span className="freight-cta">View load <Icon name="arrow" size={16} /></span></span>
    </button>
  );
}
