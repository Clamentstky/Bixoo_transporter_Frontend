import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import LiveLocationPanel from "../../components/location/LiveLocationPanel";
import { formatDate } from "../../services/display";
import "./TripDetails.css";

function TripDetails() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true); setError(null);
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
  const isCompleted = ["COMPLETED", "CANCELLED"].includes(trip.status);
  const lifecycle = [
    ["ACCEPTED", "Accepted", trip.accepted_at],
    ["GOING_TO_PICKUP", "Heading to pickup", trip.going_to_pickup_at],
    ["PICKED_UP", "Goods picked up", trip.picked_up_at],
    ["IN_TRANSIT", "In transit", trip.started_at],
    ["AT_DELIVERY", "At delivery", trip.reached_delivery_at],
    ["DELIVERED", "Delivery confirmed", trip.delivered_at],
    ["COMPLETED", "Trip completed", trip.completed_at],
  ];
  const currentStep = lifecycle.findIndex(([status]) => status === trip.status);

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
              <p>{request?.pickup_address}</p>
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
              <p>{request?.delivery_address}</p>
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
        <LiveLocationPanel key={tripId} tripId={tripId} readOnly />
      )}

      <section className="trip-section">
        <div className="section-heading">
          <div>
            <span>JOURNEY</span>
            <h2>Trip Timeline</h2>
          </div>
        </div>
        <div className="trip-timeline">
          {lifecycle.map(([status, label, timestamp], index) => {
            const completed = index < currentStep || trip.status === "COMPLETED";
            const active = index === currentStep && trip.status !== "COMPLETED";
            return <div key={status}>
              <div className={`timeline-item ${completed ? "completed" : ""} ${active ? "active" : ""}`}>
                <div className="timeline-marker">{completed ? <Icon name="check" size={17} /> : active ? <Icon name="truck" size={17} /> : index + 1}</div>
                <div className="timeline-content"><strong>{label}</strong><span>{timestamp ? formatDate(timestamp) : active ? "Current step" : "Pending"}</span></div>
              </div>
              {index < lifecycle.length - 1 && <div className={`timeline-line ${completed ? "active-line" : ""}`} />}
            </div>;
          })}
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
            <strong>{trip.vehicle_id ? `Vehicle #${trip.vehicle_id}` : "Not assigned"}</strong>
          </div>
          <div className="load-info-box">
            <span>Earnings</span>
            <strong className="earning-value">
              {request?.offered_amount ? `₹${Number(request.offered_amount).toLocaleString()}` : "-"}
            </strong>
          </div>
        </div>
      </section>

      {!isCompleted && (
        <section className="trip-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
          <Button variant="secondary" size="lg" icon="chat" iconPosition="left" onClick={handleChat}>
            Message
          </Button>
          <Button variant="primary" size="lg" onClick={["IN_TRANSIT", "AT_DELIVERY", "DELIVERED"].includes(trip.status) ? handleDelivery : handleStartTrip}>
            {["IN_TRANSIT", "AT_DELIVERY", "DELIVERED"].includes(trip.status) ? "Confirm Delivery" : "Start Navigation"}
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
          <strong>{request?.offered_amount ? `₹${Number(request.offered_amount).toLocaleString()}` : "-"}</strong>
        </div>
      </div>
    </div>
  );
}

export default TripDetails;
