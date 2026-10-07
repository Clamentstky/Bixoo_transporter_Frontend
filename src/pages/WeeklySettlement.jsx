import Icon from "../components/Icon";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./WeeklySettlement.css";
import EmptyState from "../components/ui/EmptyState";
import { errorMessage } from "../services/session";
import { formatDate } from "../services/display";

function WeeklySettlement() {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const fetchSettlements = async () => {
      try {
        const rows = [];
        let page = 1, pages = 1;
        do {
          const res = await api.get("/transporter/settlements", { params: { status: "PENDING,PROCESSING", page, limit: 100 }, signal: controller.signal });
          rows.push(...res.data);
          pages = res.pagination.total_pages;
          page += 1;
        } while (page <= pages);
        if (!controller.signal.aborted) setSettlements(rows);
      } catch (err) {
        if (!controller.signal.aborted) setError(errorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchSettlements();
    return () => controller.abort();
  }, [attempt]);

  if (loading) return <div className="ui-page" role="status">Loading settlements...</div>;
  if (error) return <div className="ui-page"><EmptyState title="Settlements unavailable" description={error} action={{ label: "Retry", onClick: () => setAttempt(value => value + 1) }} /></div>;
  const deductions = settlements.reduce((sum, item) => sum + Number(item.deduction_amount || 0), 0);
  const totalAmount = settlements.reduce((sum, s) => sum + Number(s.net_amount || 0), 0);
  const tripEarnings = settlements.reduce((sum, s) => sum + Number(s.trip_amount || 0), 0);
  const platformFee = settlements.reduce((sum, s) => sum + Number(s.platform_fee || 0), 0);
  const taxAmount = settlements.reduce((sum, s) => sum + Number(s.tax_amount || 0), 0);

  return (
    <div className="weekly-settlement-page ws-page">
      <div className="ws-container">
        <button className="ws-back" onClick={() => navigate("/wallet")}>
          <Icon name="arrowLeft" size={17} /> Back to wallet
        </button>

        <header className="ws-heading">
          <div>
            <span className="ws-eyebrow">SETTLEMENTS</span>
            <h1>Pending settlements</h1>
            <p>Your earnings, all in one place. Review your pending payouts.</p>
          </div>
          <span className="ws-cycle"><Icon name="calendar" size={16} /> Pending payouts</span>
        </header>

        <section className="ws-overview" aria-label="Settlement overview">
          <div className="ws-balance">
            <span className="ws-overview-label"><Icon name="wallet" size={18} /> Pending total</span>
            <strong>₹{totalAmount.toLocaleString()}</strong>
            <span className="ws-balance-note">Net amount after deductions</span>
          </div>
          <div className="ws-overview-details">
            <div className="ws-overview-stat">
              <span className="ws-stat-icon"><Icon name="calendar" size={22} /></span>
              <div><span>Next payout</span><strong>Not scheduled</strong></div>
            </div>
            <div className="ws-overview-stat">
              <span className="ws-stat-icon"><Icon name="truck" size={22} /></span>
              <div><span>Included trips</span><strong>{loading ? "—" : settlements.length}<small> trips</small></strong></div>
            </div>
          </div>
        </section>

        <div className="ws-grid">
          <section className="ws-trips-panel" aria-labelledby="ws-trips-title" aria-busy={loading}>
            <div className="ws-panel-heading">
              <div><h2 id="ws-trips-title">Included trips</h2><p>Earnings included in this settlement</p></div>
              {!loading && <span className="ws-count">{settlements.length}</span>}
            </div>
            {loading ? (
              <div className="ws-empty" role="status"><span className="ws-empty-icon"><Icon name="clock" size={25} /></span><h3>Loading your trips…</h3><p>Getting your settlement details.</p></div>
            ) : settlements.length > 0 ? (
              <ul className="ws-trip-list">
                {settlements.map((trip) => (
                  <li className="ws-trip" key={trip.id}>
                    <span className="ws-trip-icon"><Icon name="truck" size={22} /></span>
                    <div className="ws-trip-info">
                      <strong>Trip #{trip.trip_id}</strong>
                      <span><Icon name="calendar" size={12} />{formatDate(trip.created_at)}</span>
                    </div>
                    <div className="ws-trip-amount">
                      <strong>₹{Number(trip.net_amount).toLocaleString()}</strong>
                      <span className="ws-pending"><i />{trip.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="ws-empty">
                <span className="ws-empty-icon"><Icon name="wallet" size={26} /></span>
                <h3>No pending trips for settlement.</h3>
                <p>Completed eligible trips will appear here.</p>
              </div>
            )}
            <div className="ws-trips-footer"><Icon name="clock" size={15} /><span>Payout dates are not recorded yet</span></div>
          </section>

          <aside className="ws-details" aria-label="Payout details">
            <section className="ws-breakdown" aria-labelledby="ws-breakdown-title">
              <div className="ws-breakdown-heading"><Icon name="document" size={19} /><h2 id="ws-breakdown-title">Settlement breakdown</h2></div>
              <dl className="ws-breakdown-rows">
                <div><dt>Trip earnings</dt><dd>₹{tripEarnings.toLocaleString()}</dd></div>
                <div className="ws-deduction"><dt>Platform fee</dt><dd>-₹{platformFee.toLocaleString()}</dd></div>
                <div className="ws-deduction"><dt>Tax</dt><dd>-₹{taxAmount.toLocaleString()}</dd></div>
                <div className="ws-deduction"><dt>Other deductions</dt><dd>-₹{deductions.toLocaleString()}</dd></div>
                <div className="ws-net"><dt>Net payable</dt><dd>₹{totalAmount.toLocaleString()}</dd></div>
              </dl>
              <div className="ws-actions">
                <button className="ws-primary" onClick={() => navigate("/wallet")}><Icon name="wallet" size={18} />Back to wallet<Icon name="arrow" size={17} /></button>
                <button className="ws-secondary" onClick={() => navigate("/dashboard")}>Return to dashboard</button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default WeeklySettlement;
