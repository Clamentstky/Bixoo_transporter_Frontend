import React, { useState } from "react";
import SupportPageHeader from "../../components/support/SupportPageHeader";
import SupportOptionCard from "../../components/support/SupportOptionCard";
import Icon from "../../components/Icon";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import "./SupportPages.css";

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE;
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;

function ContactSupport() {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    trip_id: "",
    load_id: ""
  });
  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.category || !formData.subject || !formData.description) {
      setError("Please fill out all required fields.");
      return;
    }
    
    if (formData.description.length < 10) {
      setError("Description is too short. Please provide more details.");
      return;
    }

    setSubmitting(true);

    try {
      // In a real app we'd use formData if there's a file
      const payload = new FormData();
      payload.append("category", formData.category);
      payload.append("subject", formData.subject);
      payload.append("description", formData.description);
      if (formData.trip_id) payload.append("trip_id", formData.trip_id);
      if (formData.load_id) payload.append("load_id", formData.load_id);
      if (file) payload.append("file", file);

      // Attempt to post to a support endpoint (which might be missing)
      const res = await api.post("/support/tickets", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSuccess(res.data?.data?.ticket_id || "SUP-TICKET");
    } catch (err) {
      console.error(err);
      // We do NOT fake a success response. We display the actual error.
      // E.g., if endpoint is 404, we'll see it.
      if (err.response?.status === 404) {
        setError("Support API endpoint (/api/v1/support/tickets) is not implemented yet. Please contact backend team.");
      } else {
        setError("Failed to submit support request. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = () => {
    if (SUPPORT_PHONE) {
      window.location.href = `tel:${SUPPORT_PHONE}`;
    } else {
      alert("Support phone number is not configured.");
    }
  };

  const handleEmail = () => {
    if (SUPPORT_EMAIL) {
      window.location.href = `mailto:${SUPPORT_EMAIL}`;
    } else {
      alert("Support email is not configured.");
    }
  };

  return (
    <div className="support-page ui-page">
      <div className="support-container">
        <SupportPageHeader 
          title="Contact BIXOO Support"
          subtitle="Need assistance? Our support team is here to help."
        />

        {success ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", border: "1px solid var(--ui-border)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--ui-success-soft)", color: "var(--ui-success)", display: "grid", placeItems: "center", margin: "0 auto 24px auto" }}>
              <Icon name="check" size={32} />
            </div>
            <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Request Submitted!</h2>
            <p style={{ color: "var(--ui-muted)", marginBottom: "24px" }}>Support request submitted successfully.</p>
            <div style={{ display: "inline-block", padding: "12px 24px", background: "var(--ui-purple-faint)", borderRadius: "8px", fontWeight: "700", color: "var(--ui-purple)", fontSize: "18px", marginBottom: "32px", border: "1px dashed var(--ui-purple)" }}>
              Ticket ID: {success}
            </div>
            <div>
              <Button variant="primary" size="lg" onClick={() => { setSuccess(null); setShowForm(false); }}>
                Back to Support Options
              </Button>
            </div>
          </div>
        ) : showForm ? (
          <div className="support-form">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Report a Problem</h2>
              <Button variant="ghost" icon="close" onClick={() => setShowForm(false)} />
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "var(--ui-danger-soft)", color: "var(--ui-danger)", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", fontWeight: "600" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="support-form-group">
                <label>Issue Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Select a category</option>
                  <option value="LOAD_ISSUE">Load Issue</option>
                  <option value="TRIP_ISSUE">Trip Issue</option>
                  <option value="PAYMENT_ISSUE">Payment Issue</option>
                  <option value="WALLET_ISSUE">Wallet Issue</option>
                  <option value="PROFILE_ISSUE">Profile Issue</option>
                  <option value="DOCUMENT_ISSUE">Document Issue</option>
                  <option value="LOGIN_ACCOUNT_ISSUE">Login / Account Issue</option>
                  <option value="TECHNICAL_ISSUE">Technical Issue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="support-form-group">
                <label>Subject *</label>
                <input 
                  type="text" 
                  name="subject" 
                  placeholder="Brief description of the issue" 
                  value={formData.subject} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="support-form-group">
                  <label>Trip ID (Optional)</label>
                  <input 
                    type="text" 
                    name="trip_id" 
                    placeholder="e.g. TR-1234" 
                    value={formData.trip_id} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="support-form-group">
                  <label>Load ID (Optional)</label>
                  <input 
                    type="text" 
                    name="load_id" 
                    placeholder="e.g. LD-9876" 
                    value={formData.load_id} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div className="support-form-group">
                <label>Description *</label>
                <textarea 
                  name="description" 
                  placeholder="Please describe the issue in detail..." 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required
                ></textarea>
              </div>

              <div className="support-form-group">
                <label>Attachment (Optional)</label>
                <div className="file-upload-wrapper">
                  <Button variant="outline" fullWidth icon="upload" iconPosition="left">
                    {file ? file.name : "Choose File..."}
                  </Button>
                  <input type="file" onChange={handleFileChange} />
                </div>
              </div>

              <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <Button variant="outline" size="lg" onClick={() => setShowForm(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" size="lg" type="submit" loading={submitting} loadingText="Submitting...">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <SupportOptionCard 
              title="Call Support"
              description="Speak directly with our support team."
              icon="phone"
              actionText={SUPPORT_PHONE ? "Call Now" : "Configure Phone"}
              onClick={handleCall}
            />
            <SupportOptionCard 
              title="Email Support"
              description="Send your question to our support team."
              icon="mail"
              actionText={SUPPORT_EMAIL ? "Send Email" : "Configure Email"}
              onClick={handleEmail}
            />
            <SupportOptionCard 
              title="Chat with Support"
              description="Chat live with a support representative."
              icon="chat"
              actionText="Start Chat"
              onClick={() => alert("Live chat functionality is currently unavailable.")}
            />
            <SupportOptionCard 
              title="Report a Problem"
              description="Submit a ticket for a specific issue."
              icon="info"
              actionText="Submit Ticket"
              onClick={() => setShowForm(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactSupport;
