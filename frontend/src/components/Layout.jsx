import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const APP_NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    note: "Overview, projects, and activity"
  },
  {
    to: "/app/tools",
    label: "Toolbox",
    note: "Guided tools and questionnaires"
  },
  {
    to: "/app/products",
    label: "Products",
    note: "Forms, sessions, and documents"
  },
  {
    to: "/home",
    label: "Public home",
    note: "Back to the public website"
  }
];

export default function Layout({ children }) {
  const { profile, firebaseUser, logout } = useAuth();
  const firstName = (profile?.name || firebaseUser?.displayName || "Founder").split(" ")[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-kicker">Impact Platform</span>
          <Link to="/dashboard" className="brand">Green Founders Hub</Link>
          <p className="subtitle">Sustainable and responsible entrepreneurship platform</p>
        </div>
        <div className="topbar-right">
          <span className="welcome">Hi, {firstName}</span>
          <span className="badge">{profile?.role || "guest"}</span>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="app-frame">
        <nav className="app-side-nav card" aria-label="Application navigation">
          {APP_NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"}>
              <span className="app-side-nav-label">{item.label}</span>
              <span className="app-side-nav-note">{item.note}</span>
            </NavLink>
          ))}
        </nav>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
