import Icon from "../Icon";
export default function StatCard({ icon, label, value, detail }) {
  return (
    <div className="ui-stat-card">
      <div className="ui-stat-heading"><span className="ui-stat-icon"><Icon name={icon} /></span><span>{label}</span></div>
      <strong className="ui-stat-value">{value}</strong>
      {detail && <span className="ui-stat-detail">{detail}</span>}
    </div>
  );
}
