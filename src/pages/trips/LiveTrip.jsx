import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import "./LiveTrip.css";

function LiveTrip() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [locationShared, setLocationShared] = useState(false);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/transporter/trips/${tripId}`);
        if (res.data) {
          setTrip(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  const handleShareLocation = () => {
    setLocationShared(!locationShared);
  };

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
        setTrip(res.data);
      }
    } catch (err) {
      console.error(`Failed to advance trip status to ${targetStatus}:`, err);
    }
  };

  const handleDelivery = async () => {
    if (trip) {
      // Safely advance the trip to IN_TRANSIT before navigating to the delivery page
      await advanceStatusTo("IN_TRANSIT");
      navigate(`/trips/${trip.id}/delivery`);
    }
  };

  if (loading) return <div className="trip-page"><p style={{ padding: "20px" }}>Loading live trip...</p></div>;
  if (!trip) return <div className="trip-page"><EmptyState title="Trip not found" description="This trip might not exist." /><div style={{textAlign: "center", padding: "20px"}}><Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button></div></div>;

  return (
    <div className="trip-page">
      <div className="trip-container">
        
        <button className="trip-back-btn" onClick={() => navigate(-1)}>
          <Icon name="arrowLeft" size={18} /> Back
        </button>
        
        <div className="trip-header">
          <span className="trip-eyebrow">TRIP IN PROGRESS</span>
          <h1>Navigating to Delivery</h1>
          <p>Trip #{trip.trip_code || `TR-${trip.id}`}</p>
        </div>

        <div className="trip-card">
          <div className="route-timeline">
            <div className="route-point">
              <div className="route-dot pickup"></div>
              <div className="route-content">
                <small>Pickup</small>
                <strong>{trip.request?.pickup_city || "Unknown City"}</strong>
                <p>{trip.request?.pickup_location}</p>
              </div>
            </div>
            
            <div className="route-point">
              <div className="route-dot delivery"></div>
              <div className="route-content">
                <small>Delivery</small>
                <strong>{trip.request?.delivery_city || "Unknown City"}</strong>
                <p>{trip.request?.delivery_location}</p>
              </div>
            </div>
          </div>
          
          <div className="trip-distance-row">
            <span>Distance</span>
            <strong>{trip.request?.estimated_distance || "0"} km</strong>
          </div>
        </div>

        <div className="trip-card">
          <div className="trip-info-grid">
            <div className="info-item">
              <small>Load</small>
              <strong>{trip.request?.goods_name || "Not specified"}</strong>
            </div>
            <div className="info-item">
              <small>Weight</small>
              <strong>{trip.request?.weight ? `${trip.request.weight} ${trip.request.weight_unit}` : "Not specified"}</strong>
            </div>
            <div className="info-item">
              <small>Vehicle</small>
              <strong>{trip.request?.truck_type || "Any Suitable"}</strong>
            </div>
            <div className="info-item">
              <small>Status</small>
              <strong>In Transit</strong>
            </div>
          </div>
        </div>

        <div className="trip-action-area">
          <button 
            className="btn-secondary" 
            onClick={handleShareLocation}
          >
            <Icon name="pin" size={18} /> {locationShared ? "Location Shared" : "Share Location"}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleDelivery}
          >
            Confirm Delivery <Icon name="arrow" size={18} />
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default LiveTrip;
