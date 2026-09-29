import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../services/session";
import LoadingSpinner from "../../components/LoadingSpinner";
import Icon from "../../components/Icon";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import documentService from "../../services/documentService";
import DocumentStatusBadge from "../../components/support/DocumentStatusBadge";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/transporter/profile"),
      api.get("/transporter/vehicles"),
      api.get("/transporter/wallet"),
      documentService.getDocumentStatus().catch(() => []) // Add docs
    ])
      .then(([profileRes, vehicles, wallet, docs]) => {
        if (active) {
          setAccount({
            profile: profileRes.data,
            vehicle: vehicles.data[0],
            wallet: wallet.data,
            documents: docs || []
          });
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user.id, attempt]);

  if (error) {
    return (
      <div role="alert" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--ui-danger)', marginBottom: '16px' }}>{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setError("");
            setAttempt((value) => value + 1);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!account) return <LoadingSpinner label="Loading your profile..." />;

  const profile = {
    businessName: account.profile.company_name || user.name,
    operationalReach: [account.profile.city, account.profile.state]
      .filter(Boolean)
      .join(", "),
    transporterId: user.id,
    vehicleType: account.vehicle?.vehicle_type || "No vehicle",
    vehicleNumber: account.vehicle?.vehicle_number || "Not supplied",
    capacity: account.vehicle
      ? `${account.vehicle.capacity} ${account.vehicle.capacity_unit}`
      : "Not supplied",
  };

  return (
    <div className="profile-page ui-page">
      <div className="page-content">
        <PageHeader
          eyebrow="TRANSPORTER ACCOUNT"
          title="Profile"
          description="Manage your business, vehicle information and availability."
        />

        <div className="profile-card">
          <div className="profile-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: '1 1 min-content', overflow: 'hidden' }}>
              <div className="profile-avatar">
                {profile.businessName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-identity-info">
                <h2>{profile.businessName}</h2>
                <p className="profile-location">
                  {profile.operationalReach || profile.city || "Operational reach not specified"}
                </p>
                <div className="profile-verified">
                  <Icon name="shield" size={14} />
                  {account.profile.verification_status === "VERIFIED"
                    ? "Verified"
                    : "Pending"}
                </div>
              </div>
            </div>
            
            <div style={{ flexShrink: 0 }}>
              <Button
                variant="outline"
                size="sm"
                icon="edit"
                onClick={() => navigate("/profile/update")}
                style={{ padding: "8px 12px" }}
              >
                <span className="desktop-only">Edit Profile</span>
                <span className="mobile-only-inline" style={{ display: 'none' }}>Edit</span>
              </Button>
            </div>
          </div>

          <div className="profile-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--ui-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', color: 'var(--ui-muted)', marginBottom: '4px' }}>Transporter ID</span>
              <strong style={{ fontSize: '15px', color: 'var(--ui-text)' }}>#{profile.transporterId || profile.uid || "Not available"}</strong>
            </div>
          </div>
        </div>

        <section className="profile-performance" aria-label="Transporter statistics">
          <div className="stats-grid">
            <StatCard
              icon="check"
              label="Trips"
              value={account.profile.completed_trips}
              detail="Completed"
            />
            <StatCard
              icon="star"
              label="Rating"
              value={account.profile.completed_trips ? account.profile.rating : "N/A"}
              detail="Score"
            />
            <StatCard
              icon="wallet"
              label="Balance"
              value={`₹${Number(account.wallet.available_balance).toLocaleString()}`}
              detail="Account"
            />
            <StatCard
              icon="truck"
              label="Vehicle"
              value={profile.vehicleType.split(" ")[0]}
              detail={profile.vehicleNumber}
            />
          </div>
        </section>

        {/* Vehicle */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <span>ACTIVE VEHICLE</span>
            <h2>Vehicle Information</h2>
          </div>

          <div className="profile-vehicle-card">
            <div className="vehicle-image">
              <Icon name="truck" size={28} />
            </div>

            <div className="vehicle-details">
              <strong>{profile.vehicleType}</strong>
              <span>{profile.vehicleNumber}</span>
              <small>{profile.capacity || "20 Tons"} Load Capacity</small>
            </div>

            <StatusBadge status="Active" dot />
          </div>
        </section>

        {/* Documents */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <span>VERIFICATION</span>
            <h2>Documents</h2>
          </div>
          
          {account.documents && account.documents.length > 0 ? (
            account.documents.map((doc) => (
              <div 
                key={doc.document_type} 
                className="profile-document-card" 
                role="button" 
                tabIndex={0}
                onClick={() => navigate("/profile/documents")}
                style={{ cursor: "pointer" }}
              >
                <div className="document-icon">
                  <Icon name="file" />
                </div>
                <div className="profile-document-info">
                  <strong>{doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
                  <span>{doc.message || (doc.status === "NOT_SUBMITTED" ? "Not submitted" : "Verification document")}</span>
                </div>
                <DocumentStatusBadge status={doc.status} />
              </div>
            ))
          ) : (
            <p style={{ color: "var(--ui-muted)", fontSize: "14px" }}>Loading documents...</p>
          )}
          
          <div style={{ marginTop: "16px", textAlign: "right" }}>
             <Button variant="ghost" onClick={() => navigate("/profile/documents")}>
               Manage Documents <Icon name="arrow" size={16} />
             </Button>
          </div>
        </section>

        {/* Support */}
        <section className="profile-section profile-support-section">
          <div className="profile-section-heading">
            <span>SUPPORT & HELP</span>
            <h2>Need Help?</h2>
          </div>

          <div 
            className="profile-support-item" 
            role="button" 
            tabIndex={0}
            onClick={() => navigate("/help")}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate("/help"); }}
          >
            <div className="support-icon">
              <Icon name="help" />
            </div>
            <div>
              <strong>Help Center</strong>
              <span>Find answers to common questions</span>
            </div>
            <Icon name="arrow" size={18} />
          </div>

          <div 
            className="profile-support-item" 
            role="button" 
            tabIndex={0}
            onClick={() => navigate("/support")}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate("/support"); }}
          >
            <div className="support-icon">
              <Icon name="phone" />
            </div>
            <div>
              <strong>Contact BIXOO Support</strong>
              <span>Get help from our support team</span>
            </div>
            <Icon name="arrow" size={18} />
          </div>

          <div 
            className="profile-support-item" 
            role="button" 
            tabIndex={0}
            onClick={() => navigate("/faqs")}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate("/faqs"); }}
          >
            <div className="support-icon">
              <Icon name="help" />
            </div>
            <div>
              <strong>FAQs</strong>
              <span>Frequently asked questions</span>
            </div>
            <Icon name="arrow" size={18} />
          </div>
        </section>

        {/* Sign Out */}
        <Button
          variant="danger"
          size="lg"
          fullWidth
          style={{ marginBottom: "24px" }}
          onClick={async () => {
            const notice = await logout();
            navigate("/login", { replace: true, state: { notice } });
          }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default Profile;
