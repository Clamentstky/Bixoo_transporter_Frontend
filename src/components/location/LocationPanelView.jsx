import Icon from "../Icon";
import LocationMap from "./LocationMap";

export default function LocationPanelView({ state, readOnly, loading, error, notice, message, link, busy, starting, hasTask, ownTask, stopping, activeTrip, onStart, onStop, onCreateLink, onRevoke, onCopy, onShare }) {
  return <section className="location-panel" aria-label="Live GPS location">
    <header className="location-panel-heading">
      <div className="location-panel-title"><span className="location-heading-icon"><Icon name="pin" size={20} /></span><div><h2>Live location</h2><p>Your trip on the map</p></div></div>
      <span className="location-refresh"><Icon name="clock" size={14} /> Updates every 10s</span>
    </header>
    {loading && <p className="location-notice" role="status">Checking saved location…</p>}
    {error && <p className="location-warning" role="alert">{error}</p>}
    <LocationMap state={state} />
    {!readOnly && <div className="location-control-section">
      <div className="location-control-heading"><h3>Tracking controls</h3><span>{stopping ? "Stopping…" : state?.tracking_active ? "Session active" : "Tracking stopped"}</span></div>
      {notice && <p className="location-notice" role="status">{notice}</p>}
      <div className="location-actions">
        <button className="location-start-button" type="button" disabled={busy || starting || !activeTrip || hasTask} onClick={onStart}><Icon name="pin" size={16} />{starting ? "Starting…" : "Start live tracking"}</button>
        <button className="location-stop-button" type="button" disabled={busy || stopping || (!ownTask && !state?.tracking_active)} onClick={onStop}><span className="location-stop-icon" aria-hidden="true" />Stop tracking</button>
        <button className="location-share-button" type="button" disabled={busy || !state?.tracking_active || state?.stale || !!error || stopping} onClick={onCreateLink}><Icon name="send" size={16} />Share location</button>
      </div>
      <div className="location-device-note"><Icon name="shield" size={17} /><p>Keep this app open and device location enabled. Background or sleeping devices may pause updates.</p></div>
      {state?.share_expires_at && <div className="location-share-expiry"><span><Icon name="clock" size={14} />Link expires {new Date(state.share_expires_at).toLocaleString()}</span><button type="button" disabled={busy} onClick={onRevoke}>Revoke link</button></div>}
      {link && <div className="location-share">
        <label htmlFor="live-location-share-link">Your live location link</label>
        <input id="live-location-share-link" value={link} readOnly onFocus={event => event.target.select()} />
        <div className="location-actions">
          <button type="button" disabled={busy} onClick={onCopy}>Copy link</button>
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && <button type="button" disabled={busy} onClick={onShare}>Share link…</button>}
          <a href={link} target="_blank" rel="noopener noreferrer">Open recipient map <Icon name="arrow" size={14} /></a>
        </div>
      </div>}
      {message && <p className="location-notice" role="status">{message}</p>}
    </div>}
  </section>;
}
