import Icon from "../components/Icon";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { errorMessage } from "../services/session";
import { formatDate } from "../services/display";
import "./WeeklySettlement.css";

const money = value => `\u20B9${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const statusLabel = value => value?.replaceAll("_", " ") || "UNKNOWN";

export default function WeeklySettlement() {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: "", account_holder_name: "", account_number: "", ifsc_code: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const allSettlements = [];
        let page = 1;
        do {
          const response = await api.get("/transporter/settlements", { params: { page, limit: 100 }, signal: controller.signal });
          allSettlements.push(...(response.data || []));
          page += 1;
          if (page > (response.pagination?.total_pages || 1)) break;
        } while (!controller.signal.aborted);
        const [walletResponse, accountsResponse, withdrawalsResponse] = await Promise.all([
          api.get("/transporter/wallet", { params: { page: 1, limit: 10 }, signal: controller.signal }),
          api.get("/transporter/bank-accounts", { signal: controller.signal }),
          api.get("/transporter/withdrawals", { signal: controller.signal }),
        ]);
        if (!controller.signal.aborted) {
          setSettlements(allSettlements);
          setWallet(walletResponse.data);
          setAccounts(accountsResponse.data || []);
          setWithdrawals(withdrawalsResponse.data || []);
          setSelectedAccount(previous => previous || String((accountsResponse.data || []).find(item => item.is_active)?.id || ""));
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(errorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [attempt]);

  const pending = useMemo(() => settlements.filter(item => item.status === "PENDING"), [settlements]);
  const approved = useMemo(() => settlements.filter(item => item.status === "APPROVED"), [settlements]);
  const selectedAmount = approved.filter(item => selected.includes(item.id)).reduce((sum, item) => sum + Number(item.net_amount || 0), 0);
  const canWithdraw = selected.length > 0 && Boolean(selectedAccount) && selectedAmount > 0 && Number(wallet?.withdrawable_amount || 0) >= selectedAmount;

  const toggleSettlement = id => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const changeBank = event => setBankForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const registerBank = async event => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await api.post("/transporter/bank-accounts", bankForm);
      setAccounts(current => [response.data, ...current]);
      setSelectedAccount(String(response.data.id));
      setBankForm({ bank_name: "", account_holder_name: "", account_number: "", ifsc_code: "" });
      setShowBankForm(false); setNotice("Bank account registered securely.");
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };

  const requestWithdrawal = async () => {
    if (!canWithdraw || saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await api.post("/transporter/withdrawals", { bank_account_id: Number(selectedAccount), settlement_ids: selected, amount: selectedAmount.toFixed(2) });
      setWithdrawals(current => [response.data, ...current]);
      setSelected([]); setNotice(`Withdrawal ${response.data.reference_number} was recorded and is waiting for payment-provider processing.`);
      setAttempt(value => value + 1);
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="ui-page" role="status">Loading settlement and withdrawal details…</div>;
  if (error && !settlements.length && !wallet) return <div className="ui-page"><EmptyState title="Settlement unavailable" description={error} action={{ label: "Retry", onClick: () => setAttempt(value => value + 1) }} /></div>;

  const tripEarnings = settlements.reduce((sum, item) => sum + Number(item.trip_amount || 0), 0);
  const deductions = settlements.reduce((sum, item) => sum + Number(item.deduction_amount || 0), 0);

  return <div className="weekly-settlement-page ws-page">
    <div className="ws-container">
      <button className="ws-back" onClick={() => navigate("/wallet")}><Icon name="arrowLeft" size={17} /> Back to wallet</button>
      <header className="ws-heading"><div><span className="ws-eyebrow">SETTLEMENTS & WITHDRAWALS</span><h1>Settlement & payout</h1><p>Follow completed-trip earnings from approval through bank payment.</p></div><span className="ws-cycle"><Icon name="shield" size={16} /> Real wallet data</span></header>

      {error && <div className="ws-alert" role="alert">{error}</div>}
      {notice && <div className="ws-notice" role="status"><Icon name="check" size={17} />{notice}</div>}

      <section className="ws-overview" aria-label="Wallet balances">
        <div className="ws-balance"><span className="ws-overview-label"><Icon name="wallet" size={18} /> Withdrawable amount</span><strong>{money(wallet?.withdrawable_amount)}</strong><span className="ws-balance-note">Approved settlements less active withdrawal reservations</span></div>
        <div className="ws-overview-details"><div className="ws-overview-stat"><span className="ws-stat-icon"><Icon name="clock" size={22} /></span><div><span>Pending settlement</span><strong>{money(wallet?.pending_amount)}</strong></div></div><div className="ws-overview-stat"><span className="ws-stat-icon"><Icon name="check" size={22} /></span><div><span>Settled earnings</span><strong>{money(wallet?.settled_earnings)}</strong></div></div></div>
      </section>

      <div className="ws-grid">
        <section className="ws-trips-panel" aria-labelledby="ws-trips-title">
          <div className="ws-panel-heading"><div><h2 id="ws-trips-title">Settlement earnings</h2><p>Each completed trip keeps its own settlement status.</p></div><span className="ws-count">{settlements.length}</span></div>
          {settlements.length ? <ul className="ws-trip-list">{settlements.map(item => <li className="ws-trip" key={item.id}>
            {item.status === "APPROVED" && <input className="ws-check" type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSettlement(item.id)} aria-label={`Select settlement for trip ${item.trip_id}`} />}
            <span className="ws-trip-icon"><Icon name="truck" size={22} /></span><div className="ws-trip-info"><strong>Trip #{item.trip_id}</strong><span><Icon name="calendar" size={12} />{formatDate(item.created_at)}</span></div><div className="ws-trip-amount"><strong>{money(item.net_amount)}</strong><span className={`ws-pending ws-status-${item.status.toLowerCase()}`}><i />{statusLabel(item.status)}</span></div>
          </li>)}</ul> : <div className="ws-empty"><span className="ws-empty-icon"><Icon name="wallet" size={26} /></span><h3>No settlement records yet.</h3><p>Completed eligible trips will appear here.</p></div>}
          <div className="ws-trips-footer"><Icon name="info" size={15} /><span>{pending.length ? `${pending.length} settlement${pending.length === 1 ? "" : "s"} waiting for approval.` : "Settlement status is updated from the payment workflow."}</span></div>
        </section>

        <aside className="ws-details" aria-label="Withdrawal controls">
          <section className="ws-breakdown"><div className="ws-breakdown-heading"><Icon name="document" size={19} /><h2>Settlement summary</h2></div><dl className="ws-breakdown-rows"><div><dt>Trip earnings</dt><dd>{money(tripEarnings)}</dd></div><div className="ws-deduction"><dt>Deductions</dt><dd>-{money(deductions)}</dd></div><div className="ws-net"><dt>All settlement net</dt><dd>{money(settlements.reduce((sum, item) => sum + Number(item.net_amount || 0), 0))}</dd></div></dl></section>
          <section className="ws-bank-panel"><div className="ws-bank-heading"><h2>Withdraw to bank</h2><span className="ws-verified">Protected</span></div><p className="ws-help">Only approved settlements can be selected. A withdrawal stays pending until the configured provider accepts it, then moves to processing until a signed result arrives.</p>
            {accounts.length ? <label className="ws-field"><span>Registered bank account</span><select value={selectedAccount} onChange={event => setSelectedAccount(event.target.value)}>{accounts.filter(item => item.is_active).map(account => <option key={account.id} value={account.id}>{account.bank_name} · {account.account_number_masked}</option>)}</select></label> : <p className="ws-help">No registered bank account is available.</p>}
            {showBankForm ? <form className="ws-bank-form" onSubmit={registerBank}><label className="ws-field"><span>Bank name</span><input name="bank_name" required value={bankForm.bank_name} onChange={changeBank} /></label><label className="ws-field"><span>Account holder name</span><input name="account_holder_name" required value={bankForm.account_holder_name} onChange={changeBank} /></label><label className="ws-field"><span>Account number</span><input name="account_number" required inputMode="numeric" pattern="[0-9]{6,34}" value={bankForm.account_number} onChange={changeBank} /></label><label className="ws-field"><span>IFSC code</span><input name="ifsc_code" required maxLength={11} value={bankForm.ifsc_code} onChange={changeBank} /></label><div className="ws-form-actions"><Button variant="outline" type="button" onClick={() => setShowBankForm(false)}>Cancel</Button><Button type="submit" loading={saving}>Save account</Button></div></form> : <Button variant="outline" fullWidth onClick={() => setShowBankForm(true)}>{accounts.length ? "Add another bank account" : "Register bank account"}</Button>}
            <div className="ws-withdraw-total"><span>Selected to withdraw</span><strong>{money(selectedAmount)}</strong></div><Button className="ws-withdraw" fullWidth disabled={!canWithdraw || saving} loading={saving} onClick={requestWithdrawal}>Withdraw approved earnings</Button>{!selected.length && <p className="ws-inline-note">Select one or more approved settlements to continue.</p>}{selected.length > 0 && !canWithdraw && <p className="ws-inline-note">The selected amount must be within your withdrawable balance.</p>}
          </section>
        </aside>
      </div>

      <section className="ws-history"><div className="ws-panel-heading"><div><h2>Withdrawal history</h2><p>Provider-backed status updates appear here automatically.</p></div></div>{withdrawals.length ? <div className="ws-withdrawal-list">{withdrawals.map(item => <div className="ws-withdrawal" key={item.id}><div><strong>{item.reference_number}</strong><span>{item.bank_name} · {item.account_number_masked} · {formatDate(item.requested_at)}</span></div><div><strong>{money(item.amount)}</strong><span className={`ws-withdrawal-status ws-status-${item.status.toLowerCase()}`}>{statusLabel(item.status)}</span></div>{item.failure_reason && <p>{item.failure_reason}</p>}</div>)}</div> : <div className="ws-history-empty">No withdrawal requests have been submitted.</div>}</section>
    </div>
  </div>;
}
