import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import FilterPill from "../../components/ui/FilterPill";
import api from "../../services/api";
import { pageNumber } from "../../services/display";
import { errorMessage } from "../../services/session";
import { formatDate } from "../../services/display";
import "./Notifications.css";

function Notifications() {
  const [params, setParams] = useSearchParams();
  const unreadOnly = params.get("unread") === "true";
  const page = pageNumber(params.get("page"));
  const limit = 20;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const abortControllerRef = useRef(null);

  const fetchNotifications = async (searchParams) => {
    setLoading(true);
    setError(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await api.get("/notifications", {
        params: {
          unread_only: searchParams.get("unread") === "true",
          page: pageNumber(searchParams.get("page")),
          limit
        },
        signal: controller.signal
      });
      
      if (!controller.signal.aborted && res.data) {
        setNotifications(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.message !== "canceled") {
        console.error("Failed to fetch notifications", err);
        setError(true);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications(params);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [params]);

  const markAllAsRead = async () => {
    if (saving) return;
    setSaving(true); setActionError("");
    try {
      await api.patch("/notifications/read-all");
      // Refetch current page
      fetchNotifications(params);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally { setSaving(false); }
  };
  
  const handleFilterChange = (isUnread) => {
    const next = new URLSearchParams(params);
    if (isUnread) next.set("unread", "true");
    else next.delete("unread");
    next.set("page", "1");
    setParams(next);
  };
  
  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(params);
    next.set("page", newPage.toString());
    setParams(next);
  };

  return (
    <div className="notifications-page ui-page">
      <div className="notifications-header-layout">
        <PageHeader 
          eyebrow="ALERTS" 
          title="Notifications" 
          description="Stay updated with your latest operations."
        />
        <div className="notifications-header-actions">
          <div className="filter-group">
            <FilterPill active={!unreadOnly} label="All" onClick={() => handleFilterChange(false)} />
            <FilterPill active={unreadOnly} label="Unread" onClick={() => handleFilterChange(true)} />
          </div>
          <Button variant="outline" size="sm" icon="check" iconPosition="left" onClick={markAllAsRead} disabled={loading || saving}>
            Mark all as read
          </Button>
        </div>
      </div>

      {actionError && <p role="alert">{actionError}</p>}
      <div className="notifications-list" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
           <EmptyState 
            icon="close" 
            title="Unable to load results." 
            description="There was an error fetching the notifications."
            action={{ label: "Retry", onClick: () => fetchNotifications(params) }}
          />
        ) : notifications.length === 0 ? (
          <EmptyState icon="bell" title={unreadOnly ? "No Unread Notifications" : "No Notifications Yet"} description="You'll receive alerts here when there are updates on your loads, trips, or wallet." />
        ) : (
          <>
            {notifications.map((notification) => (
              <div key={notification.id} className={`notification-card ${!notification.is_read ? "unread" : ""}`}>
                <div className="notification-icon">
                  <Icon name="bell" size={20} />
                </div>
                <div className="notification-content">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <div className="notification-meta">
                    <span className="notification-time">{formatDate(notification.created_at)}</span>
                  </div>
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

export default Notifications;
