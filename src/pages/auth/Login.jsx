import Icon from "../../components/Icon";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../services/session";
import Button from "../../components/ui/Button";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sessionNotice } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Invalid credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bixoo-login">
      {/* LEFT SIDE */}
      <section className="login-left">
        <div className="left-content">
          <div className="bixoo-logo">BIX<span>O</span>O</div>
          <div className="portal-name">Transporter Portal</div>
          <div className="tagline-small">DRIVE • DELIVER • GROW TOGETHER</div>
          <div className="hero-content">
            <h1>Your Journey<br />Drives <span>Possibilities</span></h1>
            <p>Find loads. Manage trips.<br />Grow your transportation business.</p>
          </div>
          <div className="benefits">
            <div className="benefit">
              <div className="benefit-icon"><Icon name="check" size={20} /></div>
              <div><strong>Verified</strong><small>Loads</small></div>
            </div>
            <div className="benefit">
              <div className="benefit-icon"><Icon name="shield" size={20} /></div>
              <div><strong>Safe & Secure</strong><small>Transactions</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="login-right">
        <div className="login-card">
          <div className="card-logo">BIX<span>O</span>O</div>
          <p className="card-portal">Transporter Portal</p>
          <div className="welcome">
            <h2>Welcome Back</h2>
            <p>Login to continue your journey with BIXOO.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {(location.state?.notice || sessionNotice) && <p role="status">{location.state?.notice || sessionNotice}</p>}
            {error && <div className="login-error" role="alert">{error}</div>}
            
            <div className="field">
              <div className="field-header">
                <label htmlFor="email">Email Address</label>
              </div>
              <div className="mobile-field" style={{ paddingLeft: "10px" }}>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field" style={{ marginTop: "15px" }}>
              <div className="field-header">
                <label htmlFor="password">Password</label>
              </div>
              <div className="mobile-field" style={{ paddingLeft: "10px", alignItems: "center" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 16px",
                    color: "var(--ui-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%"
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={20} />
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              size="lg" 
              loading={loading}
              loadingText="Logging in..."
              icon="arrow"
              iconPosition="right"
              style={{ marginTop: "24px" }}
            >
              Continue
            </Button>
          </form>

          <div className="register" style={{ marginTop: "24px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ color: "var(--ui-muted)" }}>Don't have an account?</span>
            <Button variant="link" onClick={() => navigate("/onboarding")}>Register</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
