import { useEffect, useState } from "react";
import api from "../../services/api";
import { locationError } from "../../services/location";
import { ACTIVE_TRIP_STATUSES, useLocationTracking } from "../../context/LocationTrackingContext";
import LocationPanelView from "./LocationPanelView";

export default function LiveLocationPanel({ tripId, readOnly = false, onStatus }) {
  const tracking = useLocationTracking();
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const ownTask = tracking?.task?.tripId === Number(tripId);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const controller = new AbortController();
    const poll = async () => {
      try {
        const result = await api.get(`/transporter/trips/${tripId}/location`, { signal: controller.signal });
        if (cancelled) return;
        setState(result.data); setError("");
        if (!result.data.share_expires_at) setLink("");
        onStatus?.(result.data.trip_status);
      } catch (err) {
        if (cancelled) return;
        setError(locationError(err));
        setState(previous => previous ? { ...previous, stale: true } : previous);
      } finally {
        if (!cancelled) { setLoading(false); timer = setTimeout(poll, 10000); }
      }
    };
    poll();
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
  }, [tripId, onStatus, tracking?.lastSaved, tracking?.task]);

  const action = async fn => {
    setBusy(true); setError(""); setMessage("");
    try { await fn(); } catch (err) { setError(locationError(err)); } finally { setBusy(false); }
  };
  const createLink = () => action(async () => {
    const result = await api.post(`/transporter/trips/${tripId}/location-share`);
    setLink(`${window.location.origin}/shared-location#${result.data.token}`);
    setState(previous => ({ ...previous, share_expires_at: result.data.expires_at }));
    setMessage("Link ready. Anyone with this link can see your location for up to one hour, until you stop or end the trip. Creating a new link revokes the previous one.");
  });
  const copy = () => action(async () => {
    if (!navigator.clipboard?.writeText) { setMessage("Select the link below and copy it using your device controls."); return; }
    await navigator.clipboard.writeText(link);
    setMessage("Location link copied.");
  });
  const share = () => action(async () => {
    try { await navigator.share({ title: `BIXOO trip ${state.trip_code}`, url: link }); setMessage("Location link shared."); }
    catch (err) { if (err.name !== "AbortError") throw err; }
  });
  const revoke = () => action(async () => {
    await api.delete(`/transporter/trips/${tripId}/location-share`);
    setLink(""); setState(previous => ({ ...previous, share_expires_at: null })); setMessage("Shared link revoked.");
  });
  const activeTrip = ACTIVE_TRIP_STATUSES.includes(state?.trip_status);
  return <LocationPanelView
    state={state} readOnly={readOnly} loading={loading} error={error}
    notice={ownTask || !readOnly ? tracking?.notice : ""} message={message} link={link}
    busy={busy} starting={tracking?.starting} hasTask={!!tracking?.task}
    ownTask={ownTask} stopping={ownTask && tracking?.task?.phase === "stop"} activeTrip={activeTrip}
    onStart={() => action(() => tracking.start(tripId))}
    onStop={() => action(async () => { await tracking.stop(tripId); setLink(""); setState(previous => previous ? { ...previous, tracking_active: false, stale: true, share_expires_at: null } : previous); })}
    onCreateLink={createLink} onRevoke={revoke} onCopy={copy} onShare={share}
  />;
}