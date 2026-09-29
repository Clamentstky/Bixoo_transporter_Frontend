import Icon from "../components/Icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import "./WalletPayment.css";

function WalletPayment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("upi");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/transporter/wallet");
        if (res.data) setWallet(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleContinue = () => {
    navigate("/wallet/secure-payment");
  };

  return (
    <div className="wallet-payment-page workflow-page">
      <div className="wallet-payment-header">
        <Button variant="ghost" size="lg" icon="arrowLeft" aria-label="Back to weekly settlement" onClick={() => navigate(-1)} style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px", background: "white", color: "var(--ui-purple)" }} />

        <div>
          <span>SETTLEMENT</span>
          <h1>Select Payment Method</h1>
          <p>Choose how you want to settle your balance.</p>
        </div>
      </div>

      <div className="payment-amount-card">
        <small>Amount to Settle</small>
        {loading ? (
          <strong>Loading...</strong>
        ) : (
          <strong>{wallet?.pending_amount ? `₹${Number(wallet.pending_amount).toLocaleString()}` : "₹0"}</strong>
        )}
      </div>

      <div className="payment-methods-list">
        <label className={`payment-method ${method === "upi" ? "selected" : ""}`}>
          <div className="method-info">
            <span className="method-icon"><Icon name="check" size={16} /></span>
            <div>
              <strong>UPI</strong>
              <small>Google Pay, PhonePe, Paytm</small>
            </div>
          </div>
          <input type="radio" name="method" value="upi" checked={method === "upi"} onChange={(e) => setMethod(e.target.value)} className="sr-only" />
        </label>
        
        <label className={`payment-method ${method === "card" ? "selected" : ""}`}>
          <div className="method-info">
            <span className="method-icon"><Icon name="wallet" size={16} /></span>
            <div>
              <strong>Credit/Debit Card</strong>
              <small>Visa, Mastercard, RuPay</small>
            </div>
          </div>
          <input type="radio" name="method" value="card" checked={method === "card"} onChange={(e) => setMethod(e.target.value)} className="sr-only" />
        </label>

        <label className={`payment-method ${method === "netbanking" ? "selected" : ""}`}>
          <div className="method-info">
            <span className="method-icon"><Icon name="shield" size={16} /></span>
            <div>
              <strong>Net Banking</strong>
              <small>All Indian banks supported</small>
            </div>
          </div>
          <input type="radio" name="method" value="netbanking" checked={method === "netbanking"} onChange={(e) => setMethod(e.target.value)} className="sr-only" />
        </label>
      </div>

      <div className="payment-bottom-sheet">
        <Button variant="primary" size="lg" fullWidth onClick={handleContinue}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}

export default WalletPayment;