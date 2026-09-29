export default function LoadingSpinner({ label = "Loading..." }) {
  return <span className="ui-loading" role="status"><span className="ui-spinner" aria-hidden="true" />{label}</span>;
}
