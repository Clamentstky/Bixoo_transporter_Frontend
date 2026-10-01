import { useEffect, useState } from "react";
import Icon from "../Icon";
import "./Location.css";

export default function LocationMap({ state }) {
  const [clock, setClock] = useState(Date.now());
  const [loaded, setLoaded] = useState(false);
  const location = state?.location;
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const valid = Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  const bounds = valid ? [Math.max(-180, longitude - 0.01), Math.max(-90, latitude - 0.01), Math.min(180, longitude + 0.01), Math.min(90, latitude + 0.01)].join(",") : "";
  const src = valid ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}` : "";
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 5000); return () => clearInterval(timer); }, []);
  useEffect(() => { setLoaded(false); }, [src]);
  if (!location) return <div className="location-empty"><span><Icon name="pin" size={30} /></span><h3>Your journey starts here</h3><p>Start live tracking to show your device’s GPS location on the map.</p><small>No location saved for this session yet.</small></div>;
  if (!valid) return <p role="alert">The saved coordinates are invalid. A fresh GPS fix is required.</p>;
  const captured = new Date(location.captured_at).getTime();
  const stale = state.stale || !Number.isFinite(captured) || clock - captured > 60000;
  return <div className="location-map-content">
    <div className="location-map-frame">
      <p className={`location-fix-status ${stale ? "is-stale" : "is-current"}`} role="status"><i aria-hidden="true" />{stale ? "Last known location" : "Recent GPS location"}</p>
      {!loaded && <p className="location-map-loading">Loading map… If unavailable, use the map link below.</p>}
      <iframe title="Transporter GPS location map" className="location-map" src={src} referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} />
    </div>
    <div className="location-map-caption"><span>{stale ? "Waiting for a fresh GPS update" : "Showing your latest saved GPS position"}</span><a href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`} target="_blank" rel="noopener noreferrer">Open map<Icon name="arrow" size={14} /></a></div>
    <dl className="location-details">
      <div><dt>Latitude</dt><dd>{latitude.toFixed(8)}</dd></div>
      <div><dt>Longitude</dt><dd>{longitude.toFixed(8)}</dd></div>
      <div><dt>GPS captured</dt><dd><time dateTime={location.captured_at}>{new Date(location.captured_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}<small>{new Date(location.captured_at).toLocaleDateString()}</small></time></dd></div>
      <div><dt>Accuracy</dt><dd>{location.accuracy == null ? "Not recorded" : `±${Math.round(location.accuracy)} m`}</dd></div>
    </dl>
  </div>;
}
