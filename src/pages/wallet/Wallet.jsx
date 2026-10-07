import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import api from "../../services/api";
import { errorMessage } from "../../services/session";
import { formatDate } from "../../services/display";
import "./Wallet.css";

const money = value => `\u20B9${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Wallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    api.get("/transporter/wallet", { params: { page, limit: 10 }, signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) { setWallet(response.data); setPagination(response.pagination); } })
      .catch(err => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, attempt]);

  if (error) return <div className="ui-page"><EmptyState title="Wallet unavailable" description={error} action={{ label: "Retry", onClick: () => setAttempt(value => value + 1) }} /></div>;
  const transactions = wallet?.transactions || [];

  return <div className="wallet-page ui-page">
    <PageHeader eyebrow="TRANSPORTER WALLET" title="Wallet" description="Completed-trip earnings, settlements and withdrawal history." />
    <section className="wallet-overview" aria-label="Wallet summary" aria-busy={loading}>
      <div className="wallet-overview-main"><span className="wallet-overview-icon"><Icon name="wallet" size={27} /></span><div><span className="wallet-overview-label">Withdrawable balance</span><strong>{loading ? "—" : money(wallet?.withdrawable_amount)}</strong><span className="wallet-overview-note">Approved settlements available for withdrawal</span></div></div>
      <dl className="wallet-overview-stats"><div><dt>Pending settlement</dt><dd>{loading ? "—" : money(wallet?.pending_amount)}</dd></div><div><dt>Settled earnings</dt><dd>{loading ? "—" : money(wallet?.settled_earnings)}</dd></div></dl>
    </section>
    <div className="wallet-layout">
      <section className="wallet-settlement-card"><div className="wallet-card-kicker"><Icon name="calendar" size={15} /> SETTLEMENTS</div><h2>Settlement and withdrawal</h2><p>Review completed-trip earnings, settlement approval, registered bank accounts and withdrawal status in one place.</p><div className="wallet-payout-summary"><span className="wallet-payout-icon"><Icon name="document" size={23} /></span><div><span>Pending settlement</span><strong>{loading ? "Loading…" : money(wallet?.pending_amount)}</strong></div><Button variant="outline" icon="arrow" iconPosition="right" onClick={() => navigate("/wallet/weekly-settlement")}>Open settlement</Button></div><div className="wallet-record-note"><Icon name="check" size={18} /><span>Payments are marked paid only after a verified provider result.</span></div></section>
      <section className="wallet-transactions-card" aria-labelledby="wallet-history-title"><div className="wallet-transactions-heading"><div><span className="wallet-card-kicker">TRIP-WISE EARNINGS</span><h2 id="wallet-history-title">Earning history</h2></div>{!loading && <span className="wallet-count">{pagination?.total || 0}</span>}</div>{loading ? <div className="wallet-list-state" role="status">Loading earning history…</div> : transactions.length ? <ul className="wallet-transaction-list">{transactions.map(transaction => <li className="wallet-transaction" key={transaction.id}><span className="wallet-transaction-icon is-credit"><Icon name="arrow" size={17} /></span><div className="wallet-transaction-copy"><strong>{transaction.trip_id ? `Trip #${transaction.trip_id}` : transaction.description || "Wallet entry"}</strong><span>{transaction.description || transaction.reference_number || "Reference unavailable"} <i>•</i> {formatDate(transaction.created_at)}</span></div><div className="wallet-transaction-amount"><strong className="is-credit">+{money(transaction.amount)}</strong><span>{transaction.status}</span></div></li>)}</ul> : <div className="wallet-list-state"><Icon name="wallet" size={25} /><p>No earning history recorded yet.</p></div>}{pagination?.total_pages > 1 && <nav className="wallet-pagination" aria-label="Earning history pages"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {page} of {pagination.total_pages}</span><Button variant="outline" disabled={page >= pagination.total_pages} onClick={() => setPage(value => value + 1)}>Next</Button></nav>}</section>
    </div>
  </div>;
}
