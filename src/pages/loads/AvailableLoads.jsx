import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import LoadCard from "../../components/LoadCard";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import FilterPill from "../../components/ui/FilterPill";
import api from "../../services/api";
import { pageNumber, formatDate } from "../../services/display";
import "./AvailableLoads.css";

function AvailableLoads() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  
  // URL params state
  const query = params.get("search") || "";
  const [searchText, setSearchText] = useState(query);
  useEffect(() => { setSearchText(query); }, [query]);
  const status = params.get("status") || "all";
  const page = pageNumber(params.get("page"));
  const limit = 10;

  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState(null);
  
  const abortControllerRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchLoads = async (searchParams) => {
    setLoading(true);
    setError(false);
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await api.get("/transporter/loads", {
        params: {
          search: searchParams.get("search") || undefined,
          status: searchParams.get("status") || undefined,
          page: pageNumber(searchParams.get("page")),
          limit
        },
        signal: controller.signal
      });
      
      if (!controller.signal.aborted && res.data) {
        const mappedLoads = res.data.map(item => ({
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
        
        setLoads(mappedLoads);
        setPagination(res.pagination);
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.message !== "canceled") {
        console.error("Failed to fetch loads:", err);
        setError(true);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // We fetch whenever URL params change
    fetchLoads(params);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      clearTimeout(debounceRef.current);
    };
  }, [params]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (val.trim()) next.set("search", val);
      else next.delete("search");
      
      // Reset to page 1 on search
      next.set("page", "1");
      setParams(next);
    }, 400); // 400ms debounce
  };
  
  const handleStatusChange = (newStatus) => {
    const next = new URLSearchParams(params);
    if (newStatus === "all") next.delete("status");
    else next.set("status", newStatus);
    next.set("page", "1");
    setParams(next);
  };
  
  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(params);
    next.set("page", newPage.toString());
    setParams(next);
  };
  
  const handleReset = () => {
    clearTimeout(debounceRef.current); setSearchText("");
    setParams(new URLSearchParams());
  };

  return (
    <div className="available-loads-page ui-page">
      <PageHeader title="Available Loads" description="Find loads that match your vehicle and availability." />
      
      <div className="loads-toolbar">
        <label className="ui-search">
          <Icon name="search" />
          <input 
            type="search" 
            aria-label="Search available loads" 
            placeholder="Search by load, location or material..." 
            value={searchText}
            onChange={handleSearch} 
          />
        </label>
        
        <div className="filter-group">
          <FilterPill active={status === "all"} label="All Loads" onClick={() => handleStatusChange("all")} />
          <FilterPill active={status === "PENDING"} label="Available" onClick={() => handleStatusChange("PENDING")} />
          <FilterPill active={status === "VIEWED"} label="Viewed" onClick={() => handleStatusChange("VIEWED")} />
        </div>
      </div>
      
      <div className="loads-results-header">
        <span className="loads-result-count">{pagination ? `Showing ${pagination.total} loads` : 'Loading...'}</span>
        { (query || status !== "all") && (
           <Button variant="outline" size="sm" icon="close" iconPosition="left" onClick={handleReset}>Clear Filters</Button>
        )}
      </div>

      <div className="available-load-list">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", gridColumn: "1/-1" }}>
            <p>Loading loads...</p>
          </div>
        ) : error ? (
          <EmptyState 
            icon="close" 
            title="Unable to load results." 
            description="There was an error fetching the loads. Please try again."
            action={{ label: "Retry", onClick: () => fetchLoads(params) }}
            style={{ gridColumn: "1/-1" }}
          />
        ) : loads.length === 0 ? (
          <EmptyState 
            icon="loads" 
            title={query ? "No matching loads found." : "No loads available"} 
            description={query ? "Try adjusting your search or filters." : "You have no matching load opportunities at this time."} 
            action={query ? { label: "Clear Filters", onClick: handleReset } : null}
            style={{ gridColumn: "1/-1" }}
          />
        ) : (
          <>
            {loads.map((load) => (
              <LoadCard key={load.id} load={load} onClick={() => navigate(`/loads/${load.id}`)} />
            ))}
            
            {/* Pagination Controls */}
            {pagination && pagination.total_pages > 1 && (
              <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', gridColumn: "1/-1" }}>
                <Button 
                  variant="outline" 
                  disabled={page <= 1} 
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <span style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: 'var(--ui-muted)' }}>Page {page} of {pagination.total_pages}</span>
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

export default AvailableLoads;
