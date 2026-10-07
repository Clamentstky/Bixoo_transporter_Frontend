import Icon from "../../components/Icon";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import "./TripComplete.css";
import { errorMessage } from "../../services/session";

function TripComplete() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/transporter/trips/${tripId}`);
        if (res.data) setTrip(res.data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  const handleWallet = () => {
    navigate("/wallet");
  };

  const handleHome = () => {
    navigate("/dashboard");
  };

  if (loading) return <div className="trip-complete-page"><p style={{ padding: "20px" }}>Loading...</p></div>;
  if (!trip) return (
    <div className="trip-complete-page">
      <EmptyState title="Unable to load completed trip." description={error || "This trip does not exist."} />
      <div style={{textAlign: "center", padding: "20px"}}>
        <Button variant="outline" onClick={() => navigate("/trips")}>Back to My Trips</Button>
      </div>
    </div>
  );

  if (trip.status !== "COMPLETED") return <div className="trip-complete-page"><EmptyState title="Trip is not completed" description={`Current status: ${trip.status.replaceAll("_", " ")}.`} action={{ label: "View trip", onClick: () => navigate(`/trips/${tripId}`) }} /></div>;

  // Format completed date safely and fix UTC timezone bug
  const formattedDate = trip.completed_at 
    ? new Date(trip.completed_at.endsWith('Z') || trip.completed_at.includes('+') ? trip.completed_at : trip.completed_at + 'Z').toLocaleString("en-US", {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : "Not recorded";

  return (
    <div className="trip-complete-page">
      <div className="trip-complete-container">
        
        <div className="success-circle">
          <Icon name="check" size={36} />
        </div>

        <h1 className="trip-complete-title">Trip Completed!</h1>
        <p className="trip-complete-subtitle">
          Your load was delivered successfully.<br />
          The trip is now marked as completed.
        </p>

        <div className="completion-card">
          <div className="completion-route">
            <div className="route-side">
              <small>Pickup</small>
              <strong>{trip.request?.pickup_city || "Unknown"}</strong>
            </div>
            <div className="route-arrow">
              <Icon name="arrow" size={24} />
            </div>
            <div className="route-side right">
              <small>Delivery</small>
              <strong>{trip.request?.delivery_city || "Unknown"}</strong>
            </div>
          </div>

          <div className="completion-grid">
            <div className="completion-item">
              <small>Trip ID</small>
              <strong>{trip.trip_code || `#TR-${trip.id}`}</strong>
            </div>
            <div className="completion-item">
              <small>Status</small>
              <span className={`status-badge-completed ${trip.status === "COMPLETED" ? "" : "pending-status"}`} style={trip.status !== "COMPLETED" ? { background: '#fff3cd', color: '#856404', borderColor: '#ffeeba' } : {}}>
                <Icon name={trip.status === "COMPLETED" ? "check" : "clock"} size={14} /> {trip.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="completion-item">
              <small>Completed At</small>
              <strong>{formattedDate}</strong>
            </div>
            <div className="completion-item">
              <small>Vehicle</small>
              <strong>{trip.request?.required_vehicle_type || "Not provided"}</strong>
            </div>
          </div>
        </div>

        <div className="earnings-card">
          <small>Offered trip amount</small>
          {trip.request?.offered_amount ? (
            <>
              <h2>₹{Number(trip.request.offered_amount).toLocaleString()}</h2>
              <p>Check your wallet for recorded credits and settlement status.</p>
            </>
          ) : (
            <>
              <h2>Settlement amount pending</h2>
              <p>No amount has been recorded for this trip.</p>
            </>
          )}
        </div>

        <div className="trip-complete-actions">
          <button className="btn-wallet" onClick={handleWallet}>
            <Icon name="wallet" size={20} /> View Wallet
          </button>
          <button className="btn-dashboard" onClick={handleHome}>
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default TripComplete;

