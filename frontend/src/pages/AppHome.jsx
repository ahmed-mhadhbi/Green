import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_COPY = {
  entrepreneur: "Track progress and complete tools.",
  mentor: "Manage learning resources and review entrepreneur activity.",
  business_support: "Follow ecosystem activity, projects, and support sessions.",
  admin: "Monitor platform activity and role workflows."
};

export default function AppHome() {
  const { profile } = useAuth();
  const role = profile?.role || "entrepreneur";

  return (
    <div className="content-stack">
      <section className="card page-hero">
        <div className="hero-kicker">Workspace</div>
        <h2>Home</h2>
        <p>{ROLE_COPY[role] || ROLE_COPY.entrepreneur}</p>
      </section>

      <section className="app-home-grid">
        <Link to="/app/tools" className="hub-card hub-card-tools">
          <div className="hub-icon" aria-hidden="true">T</div>
          <h3>Tools</h3>
          <p>Open toolkits and complete guided questionnaires.</p>
          <span className="hub-card-link">Open tools</span>
        </Link>

        <Link to="/app/products" className="hub-card hub-card-products">
          <div className="hub-icon" aria-hidden="true">P</div>
          <h3>Products</h3>
          <p>View forms, workshops, calls, and your generated documents.</p>
          <span className="hub-card-link">Open products</span>
        </Link>
      </section>
    </div>
  );
}
