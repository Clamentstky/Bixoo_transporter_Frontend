import Icon from "../../components/Icon";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import "./Delivery.css";

function Delivery() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [deliveryStatus, setDeliveryStatus] = useState("Arriving");
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/transporter/trips/${tripId}`);
        if (res.data) setTrip(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  // Helper to safely advance the backend state machine without 400 Bad Request errors
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
        setTrip(res.data); // Keep local state in sync
      }
    } catch (err) {
      console.error(`Failed to advance trip status to ${targetStatus}:`, err);
    }
  };

  const handleArrived = async () => {
    setDeliveryStatus("Arrived");
    await advanceStatusTo("AT_DELIVERY");
  };

  const handleStartUnloading = async () => {
    setDeliveryStatus("Unloading");
    await advanceStatusTo("DELIVERED"); // Delivered implies we reached the location and unloaded
  };

  const handleCompleteDelivery = async () => {
    setDeliveryStatus("Delivered");
    await advanceStatusTo("COMPLETED");
  };

  const handleFinish = () => {
    navigate(`/trips/${tripId}/complete`);
  };

  const handleUploadDocs = () => {
    navigate(`/trips/${tripId}/documents`);
  };

  if (loading) return <div className="trip-page"><p style={{ padding: "20px" }}>Loading...</p></div>;
  if (!trip) return <div className="trip-page"><EmptyState title="Trip not found" description="This delivery does not exist." /><div style={{textAlign: "center", padding: "20px"}}><Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button></div></div>;

  let displayStatus = "Arriving at Destination";
  if (deliveryStatus === "Arrived") displayStatus = "Arrived at Destination";
  if (deliveryStatus === "Unloading") displayStatus = "Unloading Cargo";
  if (deliveryStatus === "Delivered") displayStatus = "Delivery Completed";

  return (
    <div className="trip-page">
      <div className="trip-container">
        
        <button className="trip-back-btn" onClick={() => navigate(-1)}>
          <Icon name="arrowLeft" size={18} /> Back
        </button>
        
        <div className="trip-header">
          <span className="trip-eyebrow">DELIVERY STATUS</span>
          <h1>{displayStatus}</h1>
          <p>Complete the final delivery steps.</p>
        </div>

        <div className="delivery-summary-card">
          <div className="delivery-info-grid">
            
            <div className="delivery-info-item row-item">
              <small>Delivery Location</small>
              <div>
                <strong>{trip.request?.delivery_city || "Unknown"}</strong>
                {trip.request?.delivery_location && <p>{trip.request.delivery_location}</p>}
              </div>
            </div>
            
            <div className="delivery-divider"></div>
            
            <div className="delivery-info-item row-item">
              <small>Load</small>
              <strong>{trip.request?.goods_name || "Not specified"}</strong>
            </div>
            
            <div className="delivery-info-item row-item">
              <small>Weight</small>
              <strong>{trip.request?.weight ? `${trip.request.weight} ${trip.request.weight_unit}` : "Not specified"}</strong>
            </div>
            
            <div className="delivery-info-item row-item">
              <small>Vehicle</small>
              <strong>{trip.request?.truck_type || "Your Assigned Vehicle"}</strong>
            </div>
            
            <div className="delivery-info-item row-item earnings">
              <small>Earnings</small>
              <strong>{trip.request?.offered_amount ? `₹${Number(trip.request.offered_amount).toLocaleString()}` : "Not available"}</strong>
            </div>
            
          </div>
        </div>
        
        <div className="delivery-action-footer">
          {deliveryStatus === "Arriving" && (
            <button className="btn-delivery-primary" onClick={handleArrived}>
              Confirm Arrival
            </button>
          )}
          {deliveryStatus === "Arrived" && (
            <button className="btn-delivery-primary" onClick={handleStartUnloading}>
              Start Unloading
            </button>
          )}
          {deliveryStatus === "Unloading" && (
            <>
              <button className="btn-delivery-secondary" onClick={handleUploadDocs}>
                <Icon name="upload" size={18} /> Upload Documents
              </button>
              <button className="btn-delivery-primary" onClick={handleCompleteDelivery}>
                Complete Delivery
              </button>
            </>
          )}
          {deliveryStatus === "Delivered" && (
            <button className="btn-delivery-success" onClick={handleFinish}>
              <Icon name="check" size={18} /> Finish Trip
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default Delivery;
