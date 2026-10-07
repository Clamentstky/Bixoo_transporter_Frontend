import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { errorMessage } from "../../services/session";
import Button from "../../components/ui/Button";

import "./onboarding.css";

function Onboarding() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    vehicleType: "",
    vehicleNumber: "",
    capacity: "",
    city: "",
    state: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (formData.password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", formData, { skipAuth: true });
      navigate("/login", { replace: true, state: { notice: "Registration successful. Sign in with the email and password you just registered." } });
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="onboarding-page">

      <div className="onboarding-card">

        <div className="onboarding-header">
          <div className="onboarding-logo">
            BIXOO
          </div>

          <p>Transporter Registration</p>

          <h1>Let's get you started</h1>

          <span>
            Enter your details to create your transporter profile.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="registration-error" role="alert">{error}</p>}

          <div className="form-section">

            <h3>Personal Details</h3>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="onboarding-name">Full Name</label>

              <input id="onboarding-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="onboarding-mobile">Mobile Number</label>

              <input id="onboarding-mobile"
                  name="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  autoComplete="tel-national"
                  value={formData.mobile}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      mobile: event.target.value.replace(/\D/g, ""),
                    })
                  }
                  required
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="onboarding-email">Email Address</label>

              <input id="onboarding-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

          </div>


          <div className="form-section">

            <h3>Account Security</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="registration-password">Password</label>
                <input id="registration-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={formData.password} onChange={handleChange} required />
                <small>Use at least 8 characters.</small>
              </div>
              <div className="form-field">
                <label htmlFor="registration-confirm-password">Confirm Password</label>
                <input id="registration-confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>Transport Details</h3>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="onboarding-vehicleType">Vehicle Type</label>

              <select id="onboarding-vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select vehicle type
                  </option>

                  <option value="Mini Truck">
                    Mini Truck
                  </option>

                  <option value="Truck">
                    Truck
                  </option>

                  <option value="Container">
                    Container
                  </option>

                  <option value="Lorry">
                    Lorry
                  </option>

                  <option value="Trailer">
                    Trailer
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="onboarding-vehicleNumber">Vehicle Number</label>

              <input id="onboarding-vehicleNumber"
                  name="vehicleNumber"
                  type="text"
                  placeholder="TN 00 AB 0000"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="onboarding-capacity">Vehicle Capacity (Tons)</label>

              <input id="onboarding-capacity" name="capacity" type="number" min="0.01" max="99999999.99" step="0.01" placeholder="Capacity in tons" value={formData.capacity} onChange={handleChange} required />
              </div>

            </div>

          </div>


          <div className="form-section">

            <h3>Location</h3>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="onboarding-city">City</label>

              <input id="onboarding-city"
                  name="city"
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="onboarding-state">State</label>

              <input id="onboarding-state"
                  name="state"
                  type="text"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

          </div>


          <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              loadingText="Creating account..."
            >
              Create Account
            </Button>

            <p className="login-link" style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              Already have an account?

              <Button
                variant="link"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </p>
          </div>
        </form>

      </div>

    </div>
  );
}

export default Onboarding;
