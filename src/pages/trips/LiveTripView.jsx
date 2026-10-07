import Icon from "../../components/Icon";
import "./LiveTripPage.css";

export default function LiveTripView({ trip, children, error, advancing, onBack, onChat, onDelivery }) {
  const request = trip.request;
  const status = trip.status.replaceAll("_", " ").toLowerCase();
  const nextLabel = { ACCEPTED: "Start heading to pickup", GOING_TO_PICKUP: "Confirm pickup", PICKED_UP: "Start transit", IN_TRANSIT: "Open delivery", AT_DELIVERY: "Open delivery", DELIVERED: "Finish delivery" }[trip.status];
  return <div className="bixoo-live-page">
    <div className="bixoo-live-container">
      <nav className="bixoo-live-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={onBack}><Icon name="arrowLeft" size={16} /> My trips</button>
        <span aria-hidden="true">/</span><span>{trip.trip_code || `Trip ${trip.id}`}</span>
      </nav>
      <header className="bixoo-live-heading">
        <div><span className="bixoo-live-eyebrow">YOUR JOURNEY, CONNECTED</span><h1>Live trip tracking</h1><p>Your location, trip details and sharing in one place.</p></div>
        <span className="bixoo-live-trip-status"><Icon name="truck" size={17} />{status}</span>
      </header>

      <div className="bixoo-live-grid">
        <div className="bixoo-live-main">{children}</div>
        <aside className="bixoo-live-aside" aria-label="Trip details">
          <section className="bixoo-live-card">
            <div className="bixoo-live-card-heading"><span className="bixoo-live-icon"><Icon name="pin" /></span><div><h2>Your route</h2><p>{trip.trip_code || `Trip ${trip.id}`}</p></div></div>
            <div className="bixoo-live-route">
              <div className="bixoo-live-stop"><span className="bixoo-live-route-dot" /><div><small>PICKUP</small><h3>{request?.pickup_city || "Pickup not provided"}</h3>{request?.pickup_address && <p>{request.pickup_address}</p>}</div></div>
              <div className="bixoo-live-stop"><span className="bixoo-live-route-dot is-destination" /><div><small>DELIVERY</small><h3>{request?.delivery_city || "Delivery not provided"}</h3>{request?.delivery_address && <p>{request.delivery_address}</p>}</div></div>
            </div>
            <div className="bixoo-live-distance"><span>Estimated distance</span><strong>{request?.estimated_distance != null ? `${request.estimated_distance} km` : "Not provided"}</strong></div>
          </section>

          <section className="bixoo-live-card">
            <div className="bixoo-live-card-heading"><span className="bixoo-live-icon"><Icon name="loads" /></span><h2>Load details</h2></div>
            <dl className="bixoo-live-cargo">
              <div><dt>Goods</dt><dd>{request?.goods_name || "Not specified"}</dd></div>
              <div><dt>Weight</dt><dd>{request?.weight != null ? `${request.weight} ${request.weight_unit || ""}` : "Not specified"}</dd></div>
              <div><dt>Vehicle</dt><dd>{request?.required_vehicle_type || "Not provided"}</dd></div>
            </dl>
            <button className="bixoo-live-message" type="button" onClick={onChat}><Icon name="chat" size={17} /> Open trip chat<Icon name="arrow" size={16} /></button>
          </section>

          <section className="bixoo-live-next">
            <span className="bixoo-live-eyebrow">DELIVERY CHECKPOINT</span>
            <h2>Ready for the next step?</h2>
            <p>Manage arrival, unloading and delivery confirmation.</p>
            {error && <p role="alert" className="location-warning">{error}</p>}
            <button type="button" onClick={onDelivery} disabled={advancing || !nextLabel}>{advancing ? "Updating trip…" : nextLabel || "Trip ended"}<Icon name="arrow" size={18} /></button>
          </section>
        </aside>
      </div>
    </div>
  </div>;
}
