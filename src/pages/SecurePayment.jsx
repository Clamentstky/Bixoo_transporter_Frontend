import Icon from "../components/Icon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import "./SecurePayment.css";

function SecurePayment() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);

  const handlePayNow = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/transporter/wallet/pay-subscription", { method: paymentMethod });
      if (res.data) setPaid(true);
    } catch (err) {
      console.error(err);
      setError("Payment processing failed. Please try again or use a different method.");
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="secure-payment-page workflow-page">
        <div className="payment-success-card">
          <div className="success-icon"><Icon name="check" size={20} /></div>
          <h2>Payment Successful</h2>
          <p>Your subscription is now active.</p>
          <div className="payment-details">
            <div><span>Amount Paid</span><strong>₹1,999.00</strong></div>
            <div><span>Transaction ID</span><strong>TXN-9023485</strong></div>
          </div>
          <Button variant="primary" fullWidth size="lg" onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="secure-payment-page workflow-page">
      <div className="payment-header">
        <Button variant="ghost" size="lg" icon="arrowLeft" onClick={() => navigate(-1)} style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }} />
        <div>
          <span>SECURE CHECKOUT</span>
          <h1>Payment Details</h1>
        </div>
      </div>
      
      {error && <div style={{ background: "red", color: "white", padding: "10px", margin: "20px", borderRadius: "8px" }}>{error}</div>}

      <div className="payment-methods">
        <h3>Select Payment Method</h3>
        <label className={`payment-method ${paymentMethod === 'upi' ? 'selected' : ''}`}>
          <div className="method-info"><strong>UPI Payment</strong><span>Google Pay, PhonePe, Paytm</span></div>
          <input type="radio" name="method" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="sr-only" />
        </label>
        <label className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}>
          <div className="method-info"><strong>Credit / Debit Card</strong><span>Visa, Mastercard, RuPay</span></div>
          <input type="radio" name="method" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="sr-only" />
        </label>
      </div>

      <div className="payment-bottom-sheet">
        <div className="payment-summary">
          <div><span>Subscription</span><strong>₹1,999.00</strong></div>
          <div className="total"><span>Total to Pay</span><strong>₹1,999.00</strong></div>
        </div>
        <Button 
          variant="primary" 
          fullWidth 
          size="lg"
          onClick={handlePayNow} 
          loading={loading}
          loadingText="Processing..."
          icon="lock"
          iconPosition="right"
        >
          Pay ₹1,999.00 securely
        </Button>
      </div>
    </div>
  );
}

export default SecurePayment;
