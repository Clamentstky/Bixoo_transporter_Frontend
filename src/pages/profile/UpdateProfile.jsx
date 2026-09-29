import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import "./UpdateProfile.css";

function UpdateProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    company_name: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    let active = true;
    api.get("/transporter/profile")
      .then(res => {
        if (active) {
          setFormData({
            company_name: res.data.company_name || "",
            city: res.data.city || "",
            state: res.data.state || "",
          });
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError("Failed to load profile. Please try again.");
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.patch("/transporter/profile", formData);
      navigate("/profile");
    } catch (err) {
      setError("Failed to update profile. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="update-profile-page ui-page">
        <p style={{ padding: "40px", textAlign: "center" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="update-profile-page ui-page">
      <div className="update-page-content">
        <div className="update-header-section">
          <Button
            variant="ghost"
            icon="arrowLeft"
            size="lg"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }}
          />
          <div>
            <h1>Edit Profile</h1>
            <p>Update your business information and reach.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="update-form">
          <div className="form-section">
            <h2>Business Details</h2>
            <div className="form-group">
              <label htmlFor="company_name">Company Name</label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                placeholder="E.g. XYZ Transports"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="E.g. Coimbatore"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="E.g. Tamil Nadu"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error-message">
              {error}
            </div>
          )}

          <div className="form-actions-grid" style={{ marginTop: "32px" }}>
            <Button type="submit" variant="primary" size="lg" loading={saving} loadingText="Saving...">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateProfile;
