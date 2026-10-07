import { useNavigate } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";
import "./SecurePayment.css";

export default function SecurePayment() {
  const navigate = useNavigate();
  return <main className="secure-payment-page checkout-page">
    <EmptyState title="Online payments are unavailable" description="Subscription pricing and payment processing are not available yet. Review your recorded earnings and settlements in your wallet."
      action={{ label: "Back to wallet", onClick: () => navigate("/wallet") }} />
  </main>;
}
