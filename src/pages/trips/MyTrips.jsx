import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import FilterPill from "../../components/ui/FilterPill";
import api from "../../services/api";
import "./MyTrips.css";

function MyTrips() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const activeTab = params.get("tab") || "active";
  const query = params.get("search") || "";
  const page = parseInt(params.get("page") || "1", 10);
  const limit = 10;

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState(null);
  
  const abortControllerRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchTrips = async (searchParams) => {
    setLoading(true);
    setError(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const currentTab = searchParams.get("tab") || "active";
    let statuses = "ACCEPTED,GOING_TO_PICKUP,PICKED_UP,IN_TRANSIT,AT_DELIVERY,DELIVERED";
    if (currentTab === "completed") statuses = "COMPLETED,CANCELLED";

    try {
      const res = await api.get("/transporter/trips", {
        params: {
          search: searchParams.get("search") || undefined,
          statuses,
          page: searchParams.get("page") || 1,
          limit
        },
        signal: abortControllerRef.current.signal
      });
      
      if (res.data) {
        const mappedTrips = res.data.map(t => {
          const isCompleted = t.status === "COMPLETED" || t.status === "CANCELLED";
          return {
            id: t.trip_code,
            internalId: t.id,
            loadId: t.request?.request_code || `LD-${t.request?.id}` || "Unknown",
            pickup: t.request?.pickup_city || "Unknown",
            pickupPoint: t.request?.pickup_address || t.request?.pickup_location || "Unknown location",
            delivery: t.request?.delivery_city || "Unknown",
            deliveryPoint: t.request?.delivery_address || t.request?.delivery_location || "Unknown location",
            weight: t.request ? `${t.request.weight} ${t.request.weight_unit}` : "",
            load: t.request?.goods_name || "",
            vehicle: "Your Vehicle",
            distance: t.request ? `${t.request.estimated_distance} km` : "",
            payout: t.request ? `₹${Number(t.request.offered_amount || t.request.estimated_price).toLocaleString()}` : "",
            status: t.status,
            type: isCompleted ? "completed" : "active",
          };
        });
        setTrips(mappedTrips);
        setPagination(res.pagination);
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.message !== "canceled") {
        console.error("Failed to fetch trips", err);
        setError(true);
      }
    } finally {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTrips(params);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [params]);

  const handleTabChange = (tab) => {
    const next = new URLSearchParams(params);
    next.set("tab", tab);
    next.set("page", "1");
    setParams(next);
  };
  
  const handleSearch = (e) => {
    const val = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (val.trim()) next.set("search", val);
      else next.delete("search");
      next.set("page", "1");
      setParams(next);
    }, 400);
  };
  
  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(params);
    next.set("page", newPage.toString());
    setParams(next);
  };
  
  const handleReset = () => {
    const next = new URLSearchParams();
    next.set("tab", activeTab); // keep current tab
    setParams(next);
  };

  const openTrip = (trip) => navigate(`/trips/${trip.internalId}`);
  const navigateLive = (trip) => navigate(`/trips/${trip.internalId}/live`);

  return (
    <div className="my-trips-page ui-page">
      <PageHeader 
        title="My Accepted Loads" 
        description="Track your active and completed transporter trips."
        action={
          <div className="my-trips-count">
            {pagination ? pagination.total : "..."}
            <small>Total {activeTab} trips</small>
          </div>
        } 
      />

      <div className="loads-toolbar" style={{ marginTop: "20px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "16px" }}>
        <label className="ui-search" style={{ flex: "1 1 300px" }}>
          <Icon name="search" />
          <input 
            type="search" 
            placeholder="Search by Trip ID, Order ID, City, or Goods..." 
            defaultValue={query} 
            onChange={handleSearch} 
          />
        </label>
        
        <div className="filter-group">
          <FilterPill active={activeTab === "active"} label="In Progress" onClick={() => handleTabChange("active")} />
          <FilterPill active={activeTab === "completed"} label="Completed" onClick={() => handleTabChange("completed")} />
        </div>
      </div>

      <div className="loads-results-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--ui-muted)' }}>
        <span>{pagination ? `Showing ${pagination.total} trips` : 'Loading...'}</span>
        {query && (
           <Button variant="outline" size="sm" icon="close" iconPosition="left" onClick={handleReset}>Clear Search</Button>
        )}
      </div>

      <div className="my-trips-list">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>Loading trips...</p>
          </div>
        ) : error ? (
          <EmptyState 
            icon="close" 
            title="Unable to load results." 
            description="There was an error fetching the trips. Please try again."
            action={{ label: "Retry", onClick: () => fetchTrips(params) }}
          />
        ) : trips.length === 0 ? (
          <EmptyState 
            icon="truck" 
            title={query ? "No matching trips found." : "No Trips Found"} 
            description={query ? "Try adjusting your search query." : "Your completed or active trips will appear here."} 
            action={query ? { label: "Clear Search", onClick: handleReset } : null}
          />
        ) : (
          <>
            {trips.map((trip) => (
              <div className="my-trip-card" key={trip.internalId}>
                {/* CARD HEADER */}
                <div className="my-trip-card-header">
                  <div>
                    <span className="trip-order-label">TRIP CODE</span>
                    <strong>#{trip.id}</strong>
                  </div>
                  <div className="trip-payout">
                    <small>Payout</small>
                    <strong>{trip.payout}</strong>
                  </div>
                </div>

                {/* STATUS */}
                <div className="my-trip-status-row">
                  <StatusBadge status={trip.status} dot />
                  <span className="trip-load-id">{trip.loadId}</span>
                </div>

                {/* ROUTE */}
                <div className="my-trip-route">
                  <div className="trip-route-point">
                    <span className="route-dot pickup"></span>
                    <div>
                      <small>Pickup</small>
                      <strong>{trip.pickup}</strong>
                      <p>{trip.pickupPoint}</p>
                    </div>
                  </div>

                  <div className="trip-route-connector">
                    <span></span>
                  </div>

                  <div className="trip-route-point">
                    <span className="route-dot delivery"></span>
                    <div>
                      <small>Delivery</small>
                      <strong>{trip.delivery}</strong>
                      <p>{trip.deliveryPoint}</p>
                    </div>
                  </div>
                </div>

                {/* TRIP INFO */}
                <div className="my-trip-info">
                  <div>
                    <span>Load</span>
                    <strong>{trip.load}</strong>
                  </div>
                  <div>
                    <span>Weight</span>
                    <strong>{trip.weight}</strong>
                  </div>
                  <div>
                    <span>Vehicle</span>
                    <strong>{trip.vehicle}</strong>
                  </div>
                  <div>
                    <span>Distance</span>
                    <strong>{trip.distance}</strong>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="my-trip-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Button variant="outline" icon="arrow" iconPosition="right" onClick={() => openTrip(trip)}>
                    Trip Details
                  </Button>

                  {trip.type === "active" ? (
                    <Button variant="primary" icon="pin" iconPosition="left" onClick={() => navigateLive(trip)}>
                      Navigate
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => openTrip(trip)}>
                      View Trip
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {pagination && pagination.total_pages > 1 && (
              <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <Button 
                  variant="outline"
                  disabled={page <= 1} 
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--ui-muted)' }}>
                  Page {page} of {pagination.total_pages}
                </span>
                <Button 
                  variant="outline"
                  disabled={page >= pagination.total_pages} 
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyTrips;
