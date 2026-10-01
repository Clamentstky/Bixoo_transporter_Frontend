import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import { locationError } from "../../services/location";
import LocationMap from "../../components/location/LocationMap";
import "./LiveTrip.css";

export default function SharedLocation() {
  const { hash } = useLocation();
  const token = hash.slice(1);
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    let timer;
    const controller = new AbortController();
    setState(null); setError(""); setLoading(true);
    const poll = async () => {
      let retry = true;
      try {
        if (!/^[A-Za-z0-9_-]{43}$/.test(token)) { retry = false; throw new Error("This location link is invalid. Ask the transporter for a new link."); }
        const result = await api.get("/location-shares/current", { skipAuth: true, headers: { "X-Location-Share": token }, signal: controller.signal });
        if (!cancelled) { setState(result.data); setError(""); }
      } catch (err) {
        if (cancelled) return;
        if ([404, 410, 422].includes(err.response?.status)) retry = false;
        setError(locationError(err));
        // Hide private coordinates as soon as access ends or cannot be checked.
        setState(null);
      } finally {
        if (!cancelled) { setLoading(false); if (retry) timer = setTimeout(poll, 10000); }
      }
    };
    poll();
    return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
  }, [token]);
  return <main className="trip-page"><div className="trip-container">
    <header className="trip-header"><h1>Shared live location</h1>{state && <p>Trip {state.trip_code}</p>}</header>
    <section className="location-panel location-recipient-panel">
      {loading && <p role="status">Opening shared location…</p>}
      {error && <p role="alert" className="location-warning">{error}</p>}
      {state && <><LocationMap state={state} /><p>Refreshes about every 10 seconds. Link expires {new Date(state.share_expires_at).toLocaleString()}.</p></>}
    </section>
  </div></main>;
}
