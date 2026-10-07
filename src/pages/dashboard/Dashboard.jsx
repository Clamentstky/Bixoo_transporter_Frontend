import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";
import LoadCard from "../../components/LoadCard";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../services/api";
import "./Dashboard.css";
import EmptyState from "../../components/ui/EmptyState";
import { errorMessage } from "../../services/session";
import { formatDate } from "../../services/display";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = { name: user?.name };
  const [stats, setStats] = useState({
    active_trips: 0,
    available_loads: 0,
    today_available: 0,
    today_completed: 0,
    total_completed: 0,
    pending_settlement: 0,
    total_earnings: 0,
  });
  const [activeTrip, setActiveTrip] = useState(null);
  const [recentLoads, setRecentLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, loadsRes] = await Promise.all([
          api.get("/transporter/dashboard"), api.get("/transporter/loads?limit=2")
        ]);
        if (!active) return;
        if (dashboardRes.data) {
          setStats(dashboardRes.data.stats);
          setActiveTrip(dashboardRes.data.active_trip);
        }
        
        // Fetch a few available loads for the dashboard
        if (loadsRes.data) {
          const mappedLoads = loadsRes.data.map(item => ({
            id: item.match_id,
            status: item.match_status === "PENDING" ? "NEW LOAD" : item.match_status,
            distance: item.distance_from_pickup != null ? `${item.distance_from_pickup} km away` : "Distance unavailable",
            pickup: item.request.pickup_city,
            delivery: item.request.delivery_city,
            weight: `${item.request.weight} ${item.request.weight_unit}`,
            type: item.request.goods_name,
            vehicle: item.request.required_vehicle_type,
            start: formatDate(item.request.pickup_date),
            payout: item.request.offered_amount
          }));
          setRecentLoads(mappedLoads);
        }
      } catch (error) {
        if (active) setError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { active = false; };
  }, [attempt]);

  if (loading) return <div className="ui-page" role="status">Loading dashboard...</div>;
  if (error) return <div className="ui-page"><EmptyState title="Dashboard unavailable" description={error} action={{ label: "Retry", onClick: () => setAttempt(value => value + 1) }} /></div>;

  const summary = [
    [stats.available_loads.toString(), "Available Loads"],
    [stats.today_available.toString(), "Today's Available"],
    [stats.today_completed.toString(), "Today's Completed"],
    // Formatting currency for pending settlement
    [`₹${stats.pending_settlement.toLocaleString()}`, "Pending Settlements"],
  ];

  return (
    <div className="bixoo-dashboard ui-page">
      <PageHeader eyebrow="TRANSPORTER OVERVIEW" title="Dashboard" description="Your loads, trips and operations, all in one place."
        action={<Button variant="primary" onClick={() => navigate("/loads")}><Icon name="loads" size={18} />Find Loads</Button>} />
      <section className="dashboard-welcome">
        <div><span className="ui-eyebrow">WELCOME BACK</span><h2>{profile.name || "Transporter"}</h2><p>Keep your business moving. Review your operations and plan your next trip.</p></div>
        <div className="dashboard-welcome-actions">
          <Button variant="secondary" onClick={() => navigate("/trips")}><Icon name="truck" size={18} />My Trips</Button>
          <Button variant="outline" onClick={() => navigate("/wallet")}><Icon name="wallet" size={18} />Wallet</Button>
        </div>
      </section>
      
      <section className="ui-stats-grid dashboard-stats" aria-label="Operational statistics">
        <StatCard icon="loads" label="Available Loads" value={stats.available_loads.toString()} detail="Freight opportunities" />
        <StatCard icon="truck" label="Active Trips" value={(stats.active_trips ?? 0).toString()} detail="Your current journeys" />
        <StatCard icon="check" label="Completed Trips" value={stats.total_completed.toString()} detail="Completed deliveries" />
        <StatCard icon="wallet" label="Pending Settlement" value={`₹${stats.pending_settlement.toLocaleString()}`} detail="Current pending balance" />
      </section>

      <section className="dashboard-section">
        <div className="ui-section-header">
          <h2>Direct load matches</h2>
          <Button variant="link" icon="arrow" iconPosition="right" onClick={() => navigate("/loads")}>View all loads</Button>
        </div>
        <div className="available-loads">
          {loading ? (
            <p>Loading available loads...</p>
          ) : recentLoads.length > 0 ? (
            recentLoads.map((load) => (
              <LoadCard key={load.id} load={load} onClick={() => navigate(`/loads/${load.id}`)} />
            ))
          ) : (
            <p>No direct load matches are available at the moment.</p>
          )}
        </div>
      </section>

      <div className="dashboard-lower">
        <section className="dashboard-section">
          <div className="ui-section-header">
            <h2>My Trips</h2>
            <Button variant="link" icon="arrow" iconPosition="right" onClick={() => navigate("/trips")}>View all trips</Button>
          </div>
          {activeTrip ? (
            <div className="dashboard-trip-card" onClick={() => navigate(`/trips/${activeTrip.internal_id}`)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => { if(e.key === 'Enter') navigate(`/trips/${activeTrip.internal_id}`) }}>
              <span className="dashboard-trip-top"><span className="shortcut-icon"><Icon name="truck" /></span><StatusBadge status={activeTrip.status} dot /></span>
              <span className="dashboard-trip-route"><strong>{activeTrip.pickup || "Pickup"}</strong><Icon name="arrow" /><strong>{activeTrip.delivery || "Delivery"}</strong></span>
              <span className="dashboard-trip-meta"><span><small>Load details</small><strong>{activeTrip.load}</strong></span><span><small>Distance</small><strong>{activeTrip.distance}</strong></span></span>
              <span className="dashboard-trip-footer">View trip details <Icon name="arrow" size={18} /></span>
            </div>
          ) : (
            <div className="dashboard-trip-card" style={{ cursor: "default", justifyContent: "center", alignItems: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>No active trips</p>
            </div>
          )}
        </section>
        <section className="dashboard-section">
          <div className="ui-section-header"><h2>Operational Summary</h2><span className="ui-badge neutral">Overview</span></div>
          <div className="dashboard-summary-list">
            {summary.map(([value, label]) => <div className="dashboard-summary-row" key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
        </section>
      </div>
      <div className="dashboard-quick-links" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <Button variant="outline" icon="wallet" onClick={() => navigate("/wallet")}>Wallet</Button>
        <Button variant="outline" icon="user" onClick={() => navigate("/profile")}>Profile</Button>
      </div>
    </div>
  );
}

export default Dashboard;
