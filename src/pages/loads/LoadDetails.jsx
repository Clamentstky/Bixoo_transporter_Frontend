import Icon from "../../components/Icon";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import "./LoadDetails.css";
import { errorMessage } from "../../services/session";
import { formatDate } from "../../services/display";

function LoadDetails() {
  const navigate = useNavigate();
  const { loadId } = useParams();

  const [load, setLoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null); setLoad(null);
    const fetchLoad = async () => {
      try {
        const res = await api.get(`/transporter/loads/${loadId}`);
        if (active && res.data) setLoad(res.data);
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (loadId) fetchLoad();
    return () => { active = false; };
  }, [loadId]);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      setActionError("");
      const response = await api.post(`/transporter/loads/${loadId}/accept`);
      navigate(`/trips/${response.data.trip_id}`);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsAccepting(true); setActionError("");
    try {
      await api.post(`/transporter/loads/${loadId}/reject`, {});
      navigate("/loads");
    } catch (err) { setActionError(errorMessage(err)); }
    finally { setIsAccepting(false); }
  };

  if (loading) return <div className="load-details-page"><p style={{ padding: "20px" }}>Loading details...</p></div>;
  if (error || !load) return <div className="load-details-page"><EmptyState title="Load not found" description="This load might have expired or you don't have access to it." /><div style={{textAlign: "center", padding: "20px"}}><Button variant="secondary" onClick={() => navigate(-1)}>Go Back to Available Loads</Button></div></div>;

  const req = load.request;
  const canRespond = ["PENDING", "VIEWED"].includes(load.match_status) && req?.status === "PENDING";

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
              Direct match {load.distance_from_pickup != null ? `• ${load.distance_from_pickup} km away` : "• distance unavailable"}
            </div>
            
            <div className="payout-info">
              <strong>{req?.offered_amount ? `₹${Number(req.offered_amount).toLocaleString()}` : "Payout unavailable"}</strong>
              <small>Est. earnings</small>
            </div>
          </div>

          <div className="route-section">
            <div className="route-line"></div>
            
            <div className="route-point">
              <div className="route-dot pickup"></div>
              <div className="route-content">
                <small>Pickup</small>
                <strong>{req?.pickup_city}</strong>
                <p>{req?.pickup_address}</p>
              </div>
            </div>
            
            <div className="route-point">
              <div className="route-dot delivery"></div>
              <div className="route-content">
                <small>Delivery</small>
                <strong>{req?.delivery_city}</strong>
                <p>{req?.delivery_address}</p>
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
                <strong>{req?.required_vehicle_type || "Not provided"}</strong>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon"><Icon name="clock" size={20} /></span>
              <div className="info-content">
                <small>Pickup date & time</small>
                <strong>{formatDate(req?.pickup_date)}</strong>
              </div>
            </div>
          </div>

          <div className="load-divider"></div>

          {actionError && <p role="alert">{actionError}</p>}
          {!canRespond && <p role="status">This load is no longer available to accept or decline.</p>}
          <div className="load-actions">
            <button 
              className="btn-decline" 
              onClick={handleDecline} 
              disabled={isAccepting || !canRespond}
            >
              <Icon name="close" size={18} /> Decline
            </button>
            <button 
              className="btn-accept" 
              onClick={handleAccept} 
              disabled={isAccepting || !canRespond}
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
