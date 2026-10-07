import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { errorMessage } from "../../services/session";
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
          setError(errorMessage(err));
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
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="update-profile-page up-page">
        <div className="up-loading" role="status">
          <span className="up-loading-icon"><Icon name="user" size={28} /></span>
          <h1>Loading your profile…</h1>
          <p>Getting your business details ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="update-profile-page up-page">
      <div className="up-container">
        <Button className="up-back" variant="ghost" icon="arrowLeft" aria-label="Go back" onClick={() => navigate(-1)}>Back</Button>
        <header className="up-heading">
          <span className="up-eyebrow">ACCOUNT SETTINGS</span>
          <h1>Edit profile</h1>
          <p>Keep your business information up to date.</p>
        </header>

        <div className="up-grid">
          <aside className="up-sidebar" aria-label="Business overview">
            <div className="up-business-card">
              <div className="up-card-banner"><span>BIXOO TRANSPORTER</span><Icon name="truck" size={27} /></div>
              <div className="up-business-body">
                <div className="up-avatar" aria-hidden="true">{formData.company_name.trim().charAt(0).toUpperCase() || <Icon name="user" size={28} />}</div>
                <div className="up-business-summary">
                  <span className="up-eyebrow">YOUR BUSINESS</span>
                  <h2>{formData.company_name || "Your company"}</h2>
                  <p><Icon name="pin" size={15} /><span>{[formData.city, formData.state].filter(Boolean).join(", ") || "Add your location"}</span></p>
                </div>
                <div className="up-account-type"><Icon name="truck" size={14} />Transporter account</div>
              </div>
            </div>
            <div className="up-tip">
              <span className="up-tip-icon"><Icon name="help" size={19} /></span>
              <div><h3>A little detail goes a long way</h3><p>Use your business name and current location so your profile stays accurate.</p></div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="up-form">
            <section className="up-section" aria-labelledby="up-business-title">
              <div className="up-section-heading">
                <span className="up-section-icon"><Icon name="document" size={22} /></span>
                <div><h2 id="up-business-title">Business details</h2><p>Tell us the name of your business.</p></div>
                <span className="up-section-number" aria-hidden="true">01</span>
              </div>
              <div className="up-field">
                <label htmlFor="company_name">Company name <span className="up-required" aria-hidden="true">*</span></label>
                <input id="company_name" name="company_name" type="text" autoComplete="organization" placeholder="E.g. XYZ Transports" value={formData.company_name} onChange={handleChange} required />
              </div>
            </section>

            <section className="up-section" aria-labelledby="up-location-title">
              <div className="up-section-heading">
                <span className="up-section-icon"><Icon name="pin" size={22} /></span>
                <div><h2 id="up-location-title">Business location</h2><p>Where is your business based?</p></div>
                <span className="up-section-number" aria-hidden="true">02</span>
              </div>
              <div className="up-fields-grid">
                <div className="up-field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" type="text" autoComplete="address-level2" placeholder="E.g. Coimbatore" value={formData.city} onChange={handleChange} />
                </div>
                <div className="up-field">
                  <label htmlFor="state">State</label>
                  <input id="state" name="state" type="text" autoComplete="address-level1" placeholder="E.g. Tamil Nadu" value={formData.state} onChange={handleChange} />
                </div>
              </div>
            </section>

            {error && <div className="up-error" role="alert"><Icon name="help" size={18} /><p>{error}</p></div>}

            <footer className="up-form-footer">
              <p><Icon name="edit" size={15} /><span>Changes apply when you save.</span></p>
              <div className="up-actions">
                <Button type="submit" className="up-save" variant="primary" size="lg" icon="check" loading={saving} loadingText="Saving...">Save changes</Button>
                <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
              </div>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;
