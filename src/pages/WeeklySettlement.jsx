import Icon from "../components/Icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./WeeklySettlement.css";

function WeeklySettlement() {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const res = await api.get("/transporter/settlements");
        if (res.data) setSettlements(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettlements();
  }, []);

  const totalAmount = settlements.reduce((sum, s) => sum + Number(s.net_amount || 0), 0);
  const tripEarnings = settlements.reduce((sum, s) => sum + Number(s.trip_amount || 0), 0);
  const platformFee = settlements.reduce((sum, s) => sum + Number(s.platform_fee || 0), 0);
  const taxAmount = settlements.reduce((sum, s) => sum + Number(s.tax_amount || 0), 0);

  return (
    <div className="weekly-settlement-page">
      <div className="weekly-settlement-container">
        
        <div className="weekly-header">
          <button className="back-btn" onClick={() => navigate("/wallet")}>
            <Icon name="arrowLeft" size={18} /> Back
          </button>
          <span className="weekly-eyebrow">SETTLEMENT PLAN</span>
          <h1 className="weekly-title">Weekly Settlement</h1>
          <p className="weekly-subtitle">Next payout on Monday</p>
        </div>

        <div className="settlement-summary-card">
          <div className="summary-value">
            <small>Pending Total</small>
            <strong>₹{totalAmount.toLocaleString()}</strong>
          </div>
          <div className="summary-meta">
            <small>Next Payout</small>
            <span>Monday</span>
          </div>
        </div>

        <div className="bank-account-card">
          <div className="bank-info">
            <div className="bank-icon">
              <Icon name="creditCard" size={20} />
            </div>
            <div className="bank-details">
              <strong>HDFC Bank</strong>
              <span>•••• 4521</span>
            </div>
          </div>
          <div className="bank-verified">
            <Icon name="check" size={12} /> Verified
          </div>
        </div>

        <div className="included-trips-section">
          <h2 className="section-title">Included Trips</h2>
          
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>
          ) : settlements.length > 0 ? (
            <div className="trip-list">
              {settlements.map((trip) => (
                <div className="trip-card" key={trip.id}>
                  <div className="trip-card-left">
                    <strong>Trip #{trip.trip_code || `TR-${trip.trip_id}`}</strong>
                    <span>{new Date(trip.created_at).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="trip-card-right">
                    <strong>₹{Number(trip.net_amount).toLocaleString()}</strong>
                    <span className="status-badge-pending">PENDING</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="icon-circle">
                <Icon name="wallet" size={24} />
              </div>
              <h3>No pending trips for settlement.</h3>
              <p>Completed eligible trips will appear here.</p>
            </div>
          )}
        </div>

        <div className="breakdown-card">
          <h2 className="section-title">Settlement Breakdown</h2>
          
          <div className="breakdown-row">
            <span>Trip Earnings</span>
            <strong>₹{tripEarnings.toLocaleString()}</strong>
          </div>
          
          <div className="breakdown-row deduction">
            <span>Platform Fee (2%)</span>
            <strong>-₹{platformFee.toLocaleString()}</strong>
          </div>
          
          <div className="breakdown-row deduction">
            <span>TDS (1%)</span>
            <strong>-₹{taxAmount.toLocaleString()}</strong>
          </div>
          
          <div className="breakdown-divider"></div>
          
          <div className="breakdown-row breakdown-total">
            <span>Net Payable</span>
            <strong>₹{totalAmount.toLocaleString()}</strong>
          </div>
        </div>

        <div className="page-actions">
          <button className="btn-primary-action" onClick={() => navigate("/wallet")}>
            Back to Wallet
          </button>
          <button className="btn-secondary-action" onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default WeeklySettlement;
