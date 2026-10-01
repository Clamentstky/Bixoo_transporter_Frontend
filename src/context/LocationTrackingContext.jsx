import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { locationError } from "../services/location";
import "../components/location/Location.css";

const TrackingContext = createContext(null);
export const ACTIVE_TRIP_STATUSES = ["ACCEPTED", "GOING_TO_PICKUP", "PICKED_UP", "IN_TRANSIT", "AT_DELIVERY"];

function gpsFix() {
  if (!window.isSecureContext) return Promise.reject(new Error("Location needs HTTPS or localhost. Open the secure application URL."));
  if (!navigator.geolocation) return Promise.reject(new Error("This browser does not support GPS location."));
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: true, maximumAge: 0, timeout: 15000,
  }));
}

function gpsError(error) {
  return ({
    1: "Location permission denied. Allow location in your browser and device settings, then start tracking again.",
    2: "GPS is unavailable. Turn on device location and move to an area with a better signal.",
    3: "GPS timed out. Check device location and signal; tracking will retry.",
  })[error.code] || locationError(error);
}

export function LocationTrackingProvider() {
  const { user } = useAuth();
  const storageKey = `bixoo_location_${user.id}`;
  const [task, setTask] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      return saved && Number.isInteger(saved.tripId) && ["track", "stop"].includes(saved.phase) ? saved : null;
    } catch { return null; }
  });
  const [notice, setNotice] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false);
  const generation = useRef(0);
  const currentTask = useRef(task);
  currentTask.current = task;

  const changeTask = next => {
    currentTask.current = next;
    setTask(next);
    try {
      if (next) sessionStorage.setItem(storageKey, JSON.stringify(next));
      else sessionStorage.removeItem(storageKey);
    } catch { /* Tracking still works when browser storage is disabled. */ }
  };

  useEffect(() => {
    const stopLocally = () => { ++generation.current; changeTask(null); };
    window.addEventListener("location:stop-local", stopLocally);
    return () => { ++generation.current; window.removeEventListener("location:stop-local", stopLocally); };
  }, []);

  useEffect(() => {
    if (!task) return;
    let cancelled = false;
    let timer;
    let busy = false;
    const controller = new AbortController();
    const config = { signal: controller.signal };
    const isCurrent = () => !cancelled && currentTask.current === task;
    const tick = async () => {
      if (!isCurrent() || busy) return;
      busy = true;
      clearTimeout(timer);
      try {
        if (task.phase === "stop") {
          await api.delete(`/transporter/trips/${task.tripId}/tracking`, config);
          if (isCurrent()) { changeTask(null); setNotice(task.reason || "Tracking stopped. Shared links are revoked."); }
          return;
        }
        if (!navigator.onLine) throw new Error("You are offline. Live location is not updating; it will retry when connected.");
        const state = await api.get(`/transporter/trips/${task.tripId}/location`, config);
        if (!isCurrent()) return;
        if (!state.data.tracking_active || !ACTIVE_TRIP_STATUSES.includes(state.data.trip_status)) {
          changeTask(null);
          setNotice("Tracking has ended for this trip.");
          return;
        }
        const position = await gpsFix();
        if (!isCurrent()) return;
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        if (![latitude, longitude, accuracy, position.timestamp].every(Number.isFinite)) throw new Error("The device returned an invalid GPS fix. Waiting for a new location.");
        const saved = await api.post(`/transporter/trips/${task.tripId}/location`, {
          latitude, longitude, accuracy, speed: Number.isFinite(speed) ? speed : null,
          heading: Number.isFinite(heading) ? heading : null,
          captured_at: new Date(position.timestamp).toISOString(),
        }, config);
        if (isCurrent()) {
          setLastSaved(saved.data.location);
          setNotice("GPS location saved. Updating about every 10 seconds while this app is open.");
        }
      } catch (error) {
        if (!isCurrent()) return;
        setNotice(task.phase === "stop"
          ? "GPS collection stopped. Unable to revoke the shared link yet; reconnect to retry."
          : gpsError(error));
        if ([401, 403, 404].includes(error.response?.status)) changeTask(null);
        else if (error.code === 1) changeTask({ tripId: task.tripId, phase: "stop", reason: gpsError(error) });
      } finally {
        busy = false;
        if (isCurrent()) timer = setTimeout(tick, 10000);
      }
    };
    tick();
    const resume = () => { if (document.visibilityState === "visible") tick(); };
    window.addEventListener("online", tick);
    document.addEventListener("visibilitychange", resume);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
      window.removeEventListener("online", tick);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [task]);

  const start = async tripId => {
    if (startingRef.current) return;
    if (currentTask.current) throw new Error("Stop the current tracking session before starting another trip.");
    if (!window.isSecureContext || !navigator.geolocation) throw new Error("GPS requires a supported browser on HTTPS or localhost.");
    startingRef.current = true;
    const startedGeneration = generation.current;
    setStarting(true);
    try {
      await api.post(`/transporter/trips/${tripId}/tracking`);
      if (startedGeneration !== generation.current) return;
      changeTask({ tripId: Number(tripId), phase: "track" });
      setLastSaved(null);
      setNotice("Waiting for GPS permission and a fresh location…");
    } finally { startingRef.current = false; setStarting(false); }
  };

  const stop = async (tripId = currentTask.current?.tripId) => {
    if (tripId) {
      if (currentTask.current && currentTask.current.tripId !== Number(tripId)) {
        await api.delete(`/transporter/trips/${tripId}/tracking`);
        return;
      }
      changeTask({ tripId: Number(tripId), phase: "stop" });
      setNotice("GPS collection stopped. Revoking shared links…");
    }
  };

  return <TrackingContext.Provider value={{ task, notice, lastSaved, starting, start, stop }}>
    {task && <div className="location-banner" role="status">
      <Link to={`/trips/${task.tripId}/live`}>Location tracking · Trip #{task.tripId}</Link>
      <span>{notice}</span>
      <button type="button" onClick={() => stop()} disabled={task.phase === "stop"}>Stop tracking</button>
    </div>}
    <Outlet />
  </TrackingContext.Provider>;
}

export function useLocationTracking() { return useContext(TrackingContext); }
