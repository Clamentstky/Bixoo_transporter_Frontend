import Icon from "../../components/Icon";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import "./LoadDetails.css";

function LoadDetails() {
  const navigate = useNavigate();
  const { loadId } = useParams();

  const [load, setLoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        const res = await api.get(`/transporter/loads/${loadId}`);
        if (res.data) setLoad(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (loadId) fetchLoad();
  }, [loadId]);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await api.post(`/transporter/loads/${loadId}/accept`);
      navigate("/trips");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to accept load");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate(-1);
  };

  if (loading) return <div className="load-details-page"><p style={{ padding: "20px" }}>Loading details...</p></div>;
  if (error || !load) return <div className="load-details-page"><EmptyState title="Load not found" description="This load might have expired or you don't have access to it." /><div style={{textAlign: "center", padding: "20px"}}><Button variant="secondary" onClick={() => navigate(-1)}>Go Back to Available Loads</Button></div></div>;

  const req = load.request;

  return (
    <div className="load-details-page">
      <div className="load-details-container">
        
        <div className="load-details-header">
          <div className="load-details-icon">
            <Icon name="bell" size={24} />
          </div>
          <h1>New Load Available</h1>
          <p>Please review the details and respond</p>
        </div>

        <div className="load-card">
          <div className="load-summary-row">
            <div className="direct-match-badge">
              <span className="dot"></span>
              Direct Match &middot; {load.distance_from_pickup} km away
            </div>
            
            <div className="payout-info">
              <strong>{req?.offered_amount ? `₹${Number(req.offered_amount).toLocaleString()}` : "Payout unavailable"}</strong>
              <small>Est. Payout</small>
            </div>
          </div>

          <div className="route-section">
            <div className="route-line"></div>
            
            <div className="route-point">
              <div className="route-dot pickup"></div>
              <div className="route-content">
                <small>Pickup</small>
                <strong>{req?.pickup_city}</strong>
                <p>{req?.pickup_location}</p>
              </div>
            </div>
            
            <div className="route-point">
              <div className="route-dot delivery"></div>
              <div className="route-content">
                <small>Delivery</small>
                <strong>{req?.delivery_city}</strong>
                <p>{req?.delivery_location}</p>
              </div>
            </div>
          </div>

          <div className="load-divider"></div>

          <div className="load-info-grid">
            <div className="info-item">
              <span className="info-icon"><Icon name="truck" size={20} /></span>
              <div className="info-content">
                <small>Goods</small>
                <strong>{req?.goods_name}</strong>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon"><Icon name="document" size={20} /></span>
              <div className="info-content">
                <small>Weight</small>
                <strong>{req?.weight} {req?.weight_unit}</strong>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon"><Icon name="truck" size={20} /></span>
              <div className="info-content">
                <small>Vehicle Type</small>
                <strong>{req?.truck_type || "Any Suitable"}</strong>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon"><Icon name="clock" size={20} /></span>
              <div className="info-content">
                <small>Start Time</small>
                <strong>{req?.start_time || "Flexible"}</strong>
              </div>
            </div>
          </div>

          <div className="load-divider"></div>

          <div className="load-actions">
            <button 
              className="btn-decline" 
              onClick={handleDecline} 
              disabled={isAccepting}
            >
              <Icon name="close" size={18} /> Decline
            </button>
            <button 
              className="btn-accept" 
              onClick={handleAccept} 
              disabled={isAccepting}
            >
              <Icon name="check" size={18} /> {isAccepting ? "Accepting..." : "Accept Load"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default LoadDetails;
