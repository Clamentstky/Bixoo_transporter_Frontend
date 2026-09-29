import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import "./TripDetails.css";

function TripDetails() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/transporter/trips/${tripId}`);
        if (res.data) {
          setTrip(res.data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  const handleBack = () => {
    navigate("/trips");
  };

  const handleChat = () => {
    if (trip?.id) {
      navigate(`/trips/${trip.id}/chat`);
    }
  };

  const handleStartTrip = () => {
    if (trip?.id) {
      navigate(`/trips/${trip.id}/live`);
    }
  };

  const handleDelivery = () => {
    if (trip?.id) {
      navigate(`/trips/${trip.id}/delivery`);
    }
  };

  if (loading) {
    return <div className="trip-details-page"><p style={{ padding: "20px" }}>Loading trip details...</p></div>;
  }

  if (error || !trip) {
    return (
      <div className="trip-details-page">
        <header className="trip-header">
          <Button variant="ghost" size="lg" icon="arrowLeft" onClick={handleBack} style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }} />
        </header>
        <EmptyState title="Trip not found" description="The trip you are looking for does not exist or you don't have access to it." />
      </div>
    );
  }

  const { request } = trip;
  const isCompleted = trip.status === "COMPLETED" || trip.status === "DELIVERED";

  return (
    <div className="trip-details-page">
      <header className="trip-header">
        <Button variant="ghost" size="lg" icon="arrowLeft" onClick={handleBack} style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }} />
        <div className="trip-header-title">
          <span>TRIP CODE</span>
          <h1>#{trip.trip_code}</h1>
        </div>
        <div className="trip-header-status">
          {trip.status}
        </div>
      </header>

      <section className="trip-route-card">
        <div className="trip-route-main">
          <div className="trip-route-location">
            <span className="trip-route-dot pickup-dot"></span>
            <div>
              <small>Pickup</small>
              <strong>{request?.pickup_city || "Unknown"}</strong>
              <p>{request?.pickup_location}</p>
            </div>
          </div>

          <div className="trip-route-arrow">
            <span></span>
            <strong><Icon name="arrow" size={20} /></strong>
            <span></span>
          </div>

          <div className="trip-route-location delivery-location">
            <span className="trip-route-dot delivery-dot"></span>
            <div>
              <small>Delivery</small>
              <strong>{request?.delivery_city || "Unknown"}</strong>
              <p>{request?.delivery_location}</p>
            </div>
          </div>
        </div>

        <div className="trip-route-bottom">
          <div>
            <span>Distance</span>
            <strong>{request?.estimated_distance} KM</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{trip.status}</strong>
          </div>
        </div>
      </section>

      {!isCompleted && (
        <section className="trip-map-card">
          <div className="trip-map-header">
            <div>
              <span>LIVE ROUTE</span>
              <h2>Trip Tracking</h2>
            </div>
            <span className="gps-live"><i></i>Live</span>
          </div>
          <div className="trip-map" style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #eaeaea', position: 'relative' }}>
            <p style={{ color: 'var(--text-muted)' }}>Map visualization active when navigating</p>
          </div>
        </section>
      )}

      <section className="trip-section">
        <div className="section-heading">
          <div>
            <span>JOURNEY</span>
            <h2>Trip Timeline</h2>
          </div>
        </div>
        <div className="trip-timeline">
          <div className={`timeline-item ${trip.accepted_at ? 'completed' : 'active'}`}>
            <div className="timeline-marker"><Icon name={trip.accepted_at ? "check" : "truck"} size={20} /></div>
            <div className="timeline-content">
              <strong>Accepted</strong>
              <span>{trip.accepted_at ? new Date(trip.accepted_at).toLocaleString() : "Waiting for pickup"}</span>
            </div>
          </div>
          <div className={`timeline-line ${trip.started_at ? 'active-line' : ''}`}></div>
          <div className={`timeline-item ${trip.started_at ? (trip.completed_at ? 'completed' : 'active') : ''}`}>
            <div className="timeline-marker">{trip.started_at ? <Icon name={trip.completed_at ? "check" : "truck"} size={20} /> : "2"}</div>
            <div className="timeline-content">
              <strong>In Transit</strong>
              <span>{trip.started_at ? `Started ${new Date(trip.started_at).toLocaleString()}` : "Not started yet"}</span>
            </div>
          </div>
          <div className={`timeline-line ${trip.completed_at ? 'active-line' : ''}`}></div>
          <div className={`timeline-item ${trip.completed_at ? 'completed' : ''}`}>
            <div className="timeline-marker">{trip.completed_at ? <Icon name="check" size={20} /> : "3"}</div>
            <div className="timeline-content">
              <strong>Delivered</strong>
              <span>{trip.completed_at ? new Date(trip.completed_at).toLocaleString() : "Pending"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="load-details-card">
        <div className="load-card-heading">
          <div>
            <span>LOAD INFORMATION</span>
            <h2>{request?.goods_name || "Goods"}</h2>
          </div>
        </div>
        <div className="load-info-grid">
          <div className="load-info-box">
            <span>Quantity</span>
            <strong>{request?.quantity || "-"}</strong>
          </div>
          <div className="load-info-box">
            <span>Weight</span>
            <strong>{request ? `${request.weight} ${request.weight_unit}` : "-"}</strong>
          </div>
          <div className="load-info-box">
            <span>Vehicle</span>
            <strong>Your Vehicle</strong>
          </div>
          <div className="load-info-box">
            <span>Earnings</span>
            <strong className="earning-value">
              {request?.estimated_price ? `₹${Number(request.estimated_price).toLocaleString()}` : "-"}
            </strong>
          </div>
        </div>
      </section>

      {!isCompleted && (
        <section className="trip-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
          <Button variant="secondary" size="lg" icon="chat" iconPosition="left" onClick={handleChat}>
            Message
          </Button>
          <Button variant="primary" size="lg" onClick={trip.status === "IN_TRANSIT" ? handleDelivery : handleStartTrip}>
            {trip.status === "IN_TRANSIT" ? "Confirm Delivery" : "Start Navigation"}
          </Button>
        </section>
      )}

      <div className="trip-bottom-summary">
        <div>
          <span>Trip Code</span>
          <strong>#{trip.trip_code}</strong>
        </div>
        <div>
          <span>Estimated Earnings</span>
          <strong>{request?.estimated_price ? `₹${Number(request.estimated_price).toLocaleString()}` : "-"}</strong>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;
