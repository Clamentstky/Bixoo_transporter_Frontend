import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import "./Wallet.css";

function Wallet() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/transporter/wallet");
        if (res.data) {
          setWallet(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleContinue = () => {
    if (selectedPlan === "weekly") {
      navigate("/wallet/weekly-settlement");
    } else {
      navigate("/wallet/secure-payment");
    }
  };

  return (
    <div className="wallet-page ui-page">
      <PageHeader eyebrow="TRANSPORTER WALLET" title="Wallet" description="Manage your earnings and settlements." />
      
      {loading ? (
        <section className="wallet-balance-card" aria-label="Wallet summary">
          <p style={{ color: "white", padding: "20px" }}>Loading wallet...</p>
        </section>
      ) : (
        <section className="wallet-balance-card" aria-label="Wallet summary">
          <div className="wallet-balance-top">
            <span className="balance-wallet-icon"><Icon name="wallet" size={28} /></span>
            <div>
              <span>Current Pending Balance</span>
              <strong>{wallet?.pending_amount ? `₹${Number(wallet.pending_amount).toLocaleString()}` : "₹0"}</strong>
            </div>
          </div>
          <div className="balance-footer">
            <div>
              <span>Available Balance</span>
              <strong>{wallet?.available_balance ? `₹${Number(wallet.available_balance).toLocaleString()}` : "₹0"}</strong>
            </div>
            <div>
              <span>Total Earnings</span>
              <strong>{wallet?.total_earnings ? `₹${Number(wallet.total_earnings).toLocaleString()}` : "₹0"}</strong>
            </div>
          </div>
        </section>
      )}

      <div className="wallet-plan-layout">
        <section className="settlement-section">
          <div className="wallet-section-heading">
            <span className="ui-eyebrow">SETTLEMENT</span>
            <h2>Choose Settlement Plan</h2>
            <p>Select the plan that works for your business.</p>
          </div>
          <fieldset className="settlement-options">
            <legend className="sr-only">Settlement plan</legend>
            {[
              {id:"weekly", title:"Weekly Settlement", description:"Settle your completed trips every week.", icon:"calendar"},
              {id:"monthly", title:"Monthly Subscription", description:"Manage settlements with a monthly plan.", icon:"clock"}
            ].map(plan => (
              <label key={plan.id} className={`settlement-option ${selectedPlan === plan.id ? "selected" : ""}`}>
                <span className="settlement-option-icon"><Icon name={plan.icon} size={24} /></span>
                <div className="settlement-option-info">
                  <strong>{plan.title}</strong>
                  <span>{plan.description}</span>
                </div>
                <input type="radio" name="plan" value={plan.id} checked={selectedPlan === plan.id} onChange={(e) => setSelectedPlan(e.target.value)} className="sr-only" />
                <span className="radio-circle"></span>
              </label>
            ))}
          </fieldset>
        </section>
        
        <section className="wallet-action-section">
          <div className="wallet-transactions">
            <h3>Recent Transactions</h3>
            {loading ? (
              <p style={{ padding: "20px" }}>Loading transactions...</p>
            ) : wallet?.transactions?.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {wallet.transactions.map((t, idx) => (
                  <li key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <strong style={{ display: "block" }}>{t.transaction_type}</strong>
                      <small style={{ color: "var(--text-muted)" }}>{t.reference_id || "No Reference"}</small>
                    </div>
                    <strong style={{ color: t.transaction_type === 'CREDIT' ? 'var(--success)' : 'inherit' }}>
                      {t.transaction_type === 'CREDIT' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>No wallet transactions yet.</p>
            )}
          </div>
          
          <Button 
            variant="primary" 
            className="wallet-continue-btn" 
            onClick={handleContinue} 
            aria-label="Continue with selected plan"
            icon="arrow"
            iconPosition="right"
          >
            Continue
          </Button>
        </section>
      </div>
    </div>
  );
}

export default Wallet;
