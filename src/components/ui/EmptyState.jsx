import Icon from "../Icon";
export default function EmptyState({ title, description, icon = "loads", children }) {
  return <div className="ui-empty-state"><span className="ui-state-icon"><Icon name={icon} size={28} /></span><h2>{title}</h2>{description && <p>{description}</p>}{children}</div>;
}
