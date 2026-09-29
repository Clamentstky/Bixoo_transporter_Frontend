import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import Icon from "../Icon";
import { useAuth } from "../../context/AuthContext";

import "./TransporterLayout.css";
import "./TransporterUI.css";

function TransporterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 1000px)").matches);
  const drawerOpen = compact && sidebarOpen;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1000px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const menuButton = menuRef.current;
    sidebarRef.current.querySelector("button")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); setSidebarOpen(false); }
      if (event.key !== "Tab") return;
      const controls = [...sidebarRef.current.querySelectorAll("button, a, input")].filter(el => !el.disabled);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [drawerOpen]);

  const [isOnline, setIsOnline] = useState(
    localStorage.getItem("transporter_status") === "online"
  );

  const transporterName = user.name;

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "dashboard",
    },
    {
      label: "Available Loads",
      path: "/loads",
      icon: "loads",
    },
    {
      label: "My Trips",
      path: "/trips",
      icon: "truck",
    },
    {
      label: "Wallet",
      path: "/wallet",
      icon: "wallet",
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: "bell",
    },
    {
      label: "Profile",
      path: "/profile",
      icon: "user",
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const toggleAvailability = () => {
    const newStatus = !isOnline;

    setIsOnline(newStatus);

    localStorage.setItem(
      "transporter_status",
      newStatus ? "online" : "offline"
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    const notice = await logout();
    navigate("/login", { replace: true, state: { notice } });
  };

  return (
    <div className="transporter-layout">

      {/* Mobile Overlay */}

      {drawerOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        ref={sidebarRef}
        inert={compact && !drawerOpen}
        role={drawerOpen ? "dialog" : undefined}
        aria-modal={drawerOpen ? true : undefined}
        aria-label="Transporter navigation"
        className={`transporter-sidebar ${
          drawerOpen ? "open" : ""
        }`}
        id="transporter-navigation"
        onKeyDown={(event) => {
          if (event.key === "Escape") setSidebarOpen(false);
        }}
      >

        {/* Logo */}

        <div className="sidebar-logo">
          <div className="logo-text">
            BIX<span>O</span>O
          </div>

          <small>TRANSPORTER</small>
          {compact && <button className="sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><Icon name="close" /></button>}
        </div>

        {/* Navigation */}

        <nav className="sidebar-nav" aria-label="Main navigation">

          <p className="nav-heading">
            MAIN MENU
          </p>

          {menuItems.map((item) => (
            <button
              key={item.path}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={`nav-item ${
                isActive(item.path) ? "active" : ""
              }`}
              onClick={() =>
                handleNavigation(item.path)
              }
            >
              <span className="nav-icon">
                <Icon name={item.icon} />
              </span>

              <span>{item.label}</span>
            </button>
          ))}

        </nav>

        {/* Availability */}

        <div className="sidebar-bottom">

          <div className="availability-box">

            <div className="availability-top">
              <span className="availability-title">
                Availability
              </span>

              <span
                className={`availability-status ${
                  isOnline ? "online" : "offline"
                }`}
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            <button
              className={`availability-toggle ${
                isOnline ? "active" : ""
              }`}
              role="switch"
              aria-checked={isOnline}
              aria-label="Availability"
              onClick={toggleAvailability}
            >
              <span></span>
            </button>

            <p>
              {isOnline
                ? "Receiving load opportunities"
                : "You are currently unavailable"}
            </p>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* Main Area */}

      <div className="layout-main" inert={drawerOpen}>
        <a className="skip-link" href="#main-content">Skip to content</a>

        {/* Header */}

        <header className="transporter-header">

          <button
            ref={menuRef}
            className="mobile-menu-btn"
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={sidebarOpen}
            aria-controls="transporter-navigation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Icon name="menu" />
          </button>

          <form className="header-search" role="search" onSubmit={(event) => {
            event.preventDefault();
            navigate(`/loads${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`);
          }}>
            <Icon name="search" size={18} />

            <input
              type="search"
              aria-label="Search loads"
              placeholder="Search loads or locations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <div className="header-right">

            <button
              className="header-notification"
              aria-label="Notifications"
              onClick={() =>
                navigate("/notifications")
              }
            >
              <Icon name="bell" />
              <span></span>
            </button>

            <button
              className={`header-status ${
                isOnline ? "online" : "offline"
              }`}
              aria-label={isOnline ? "Go offline" : "Go online"}
              aria-pressed={isOnline}
              onClick={toggleAvailability}
            >
              <i></i>
              {isOnline ? "Online" : "Offline"}
            </button>

            <button
              className="header-profile"
              aria-label="Open transporter profile"
              onClick={() => navigate("/profile")}
            >
              <div className="header-avatar">
                {transporterName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="header-user">
                <strong>{transporterName}</strong>
                <small>Transporter</small>
              </div>
            </button>

          </div>

        </header>

        {/* Page Content */}

        <main className="layout-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default TransporterLayout;
