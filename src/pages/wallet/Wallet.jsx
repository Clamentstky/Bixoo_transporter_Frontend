import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import "./Wallet.css";
import EmptyState from "../../components/ui/EmptyState";
import { errorMessage } from "../../services/session";
import { formatDate } from "../../services/display";

const money = (value) => `\u20B9${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function Wallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchWallet = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/transporter/wallet", {
          params: { page, limit: 10, sort_order: "desc" },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setWallet(response.data);
          setPagination(response.pagination);
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(errorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchWallet();
    return () => controller.abort();
  }, [page, attempt]);

  const transactions = wallet?.transactions || [];
  if (error) {
    return <div className="ui-page"><EmptyState title="Wallet unavailable" description={error} action={{ label: "Retry", onClick: () => setAttempt(value => value + 1) }} /></div>;
  }

  return (
    <div className="wallet-page ui-page">
      <PageHeader eyebrow="TRANSPORTER WALLET" title="Wallet" description="A simple view of your trip earnings and settlements." />

      <section className="wallet-overview" aria-label="Wallet summary" aria-busy={loading}>
        <div className="wallet-overview-main">
          <span className="wallet-overview-icon"><Icon name="wallet" size={27} /></span>
          <div>
            <span className="wallet-overview-label">Completed-trip earnings</span>
            <strong>{loading ? "—" : money(wallet?.total_earnings)}</strong>
            <span className="wallet-overview-note">Recorded from completed trips</span>
          </div>
        </div>
        <dl className="wallet-overview-stats">
          <div><dt>Pending settlements</dt><dd>{loading ? "—" : money(wallet?.pending_amount)}</dd></div>
          <div><dt>Settled earnings</dt><dd>{loading ? "—" : money(wallet?.settled_earnings)}</dd></div>
        </dl>
      </section>

      <div className="wallet-layout">
        <section className="wallet-settlement-card" aria-labelledby="wallet-settlement-title">
          <div className="wallet-card-kicker"><Icon name="calendar" size={15} /> SETTLEMENTS</div>
          <h2 id="wallet-settlement-title">Your settlements</h2>
          <p>Review the payouts waiting to be settled for your completed trips.</p>

          <div className="wallet-payout-summary">
            <span className="wallet-payout-icon"><Icon name="document" size={23} /></span>
            <div>
              <span>Pending settlements</span>
              <strong>{loading ? "Loading…" : money(wallet?.pending_amount)}</strong>
            </div>
            <Button variant="outline" icon="arrow" iconPosition="right" onClick={() => navigate("/wallet/weekly-settlement")}>View details</Button>
          </div>

          <div className="wallet-record-note">
            <Icon name="check" size={18} />
            <span>Settlement amounts are calculated from recorded trip earnings and deductions.</span>
          </div>
        </section>

        <section className="wallet-transactions-card" aria-labelledby="wallet-transactions-title">
          <div className="wallet-transactions-heading">
            <div><span className="wallet-card-kicker">EARNING HISTORY</span><h2 id="wallet-transactions-title">Trip-wise earnings</h2></div>
            {!loading && <span className="wallet-count">{pagination?.total || 0}</span>}
          </div>

          {loading ? <div className="wallet-list-state" role="status">Loading transactions…</div> : transactions.length ? (
            <ul className="wallet-transaction-list">
              {transactions.map((transaction) => {
                const credit = transaction.transaction_type === "CREDIT";
                return <li key={transaction.id} className="wallet-transaction">
                  <span className={`wallet-transaction-icon ${credit ? "is-credit" : "is-debit"}`}><Icon name={credit ? "arrow" : "arrowLeft"} size={17} /></span>
                  <div className="wallet-transaction-copy">
                    <strong>{transaction.trip_id ? `Trip #${transaction.trip_id}` : transaction.description || "Wallet adjustment"}</strong>
                    <span>{transaction.description || transaction.reference_number || "Reference unavailable"} <i>•</i> {formatDate(transaction.created_at)}</span>
                  </div>
                  <div className="wallet-transaction-amount">
                    <strong className={credit ? "is-credit" : "is-debit"}>{credit ? "+" : "−"}{money(transaction.amount)}</strong>
                    <span>{transaction.status}</span>
                  </div>
                </li>;
              })}
            </ul>
          ) : <div className="wallet-list-state"><Icon name="wallet" size={25} /><p>No completed-trip earnings have been recorded yet.</p></div>}

          {pagination?.total_pages > 1 && <nav className="wallet-pagination" aria-label="Transaction pages">
            <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button>
            <span>Page {page} of {pagination.total_pages}</span>
            <Button variant="outline" disabled={loading || page >= pagination.total_pages} onClick={() => setPage(value => value + 1)}>Next</Button>
          </nav>}
        </section>
      </div>
    </div>
  );
}

export default Wallet;
