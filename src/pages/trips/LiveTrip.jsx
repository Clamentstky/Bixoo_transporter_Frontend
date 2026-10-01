import { useState, useEffect, useCallback } from "react";
import LiveTripView from "./LiveTripView";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import LiveLocationPanel from "../../components/location/LiveLocationPanel";
import { errorMessage } from "../../services/session";
import "./LiveTrip.css";

function LiveTrip() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const updateStatus = useCallback(status => setTrip(previous => previous && previous.status !== status ? { ...previous, status } : previous), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setTrip(null); setError("");
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/transporter/trips/${tripId}`);
        if (res.data && !cancelled) {
          setTrip(res.data);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Unable to load this trip."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (tripId) fetchTrip();
    else { setLoading(false); setError("A trip ID is required."); }
    return () => { cancelled = true; };
  }, [tripId]);

  const advanceStatusTo = async (targetStatus) => {
    if (!trip) return;
    const flow = ["ACCEPTED", "GOING_TO_PICKUP", "PICKED_UP", "IN_TRANSIT", "AT_DELIVERY", "DELIVERED", "COMPLETED"];
    try {
      let current = trip.status;
      const targetIdx = flow.indexOf(targetStatus);
      if (targetIdx === -1) return;
      while (flow.indexOf(current) < targetIdx && flow.indexOf(current) !== -1) {
        const nextStatus = flow[flow.indexOf(current) + 1];
        const res = await api.patch(`/transporter/trips/${tripId}/status`, { status: nextStatus });
        current = nextStatus;
        setTrip(previous => ({ ...previous, ...res.data }));
      }
      return current === targetStatus;
    } catch (err) {
      setError(errorMessage(err, "Unable to update trip status."));
      return false;
    }
  };

  const handleDelivery = async () => {
    if (trip && !advancing) {
      setAdvancing(true); setError("");
      const ready = ["IN_TRANSIT", "AT_DELIVERY"].includes(trip.status) || await advanceStatusTo("IN_TRANSIT");
      if (ready) navigate(`/trips/${trip.id}/delivery`);
      setAdvancing(false);
    }
  };

  if (loading) return <div className="bixoo-live-page"><p role="status">Loading live trip…</p></div>;
  if (!trip) return <div className="bixoo-live-page"><EmptyState title="Trip unavailable" description={error || "This trip might not exist."} /><Button variant="secondary" onClick={() => navigate("/trips")}>Back to trips</Button></div>;

  return <LiveTripView
    trip={trip}
    error={error}
    advancing={advancing}
    onBack={() => navigate("/trips")}
    onChat={() => navigate(`/trips/${tripId}/chat`)}
    onDelivery={handleDelivery}
  >
    <LiveLocationPanel key={tripId} tripId={tripId} onStatus={updateStatus} />
  </LiveTripView>;
}

export default LiveTrip;
