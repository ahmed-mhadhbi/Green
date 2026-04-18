import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleLabel } from "../utils/roleLabels";

function getAppNavItems(role) {
  const roleLabel = getRoleLabel(role, "Dashboard");

  return [
    {
      to: "/dashboard",
      label: roleLabel,
      note: `${roleLabel} overview and activity`
    },
    {
      to: "/app/tools",
      label: "Tools",
      note: role === "mentor" ? "Entrepreneur and group improvements" : "Guided tools and questionnaires"
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
}

export default function Layout({ children }) {
  const { profile, firebaseUser, logout } = useAuth();
  const firstName = (profile?.name || firebaseUser?.displayName || "Founder").split(" ")[0];
  const navItems = getAppNavItems(profile?.role);

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
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="app-frame">
        <nav className="app-side-nav card" aria-label="Application navigation">
          {navItems.map((item) => (
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
