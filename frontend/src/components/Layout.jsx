import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

      <nav className="nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/app/tools">Toolbox</NavLink>
        <NavLink to="/app/products">Products</NavLink>
        <NavLink to="/home">Public home</NavLink>
      </nav>

      <main className="content">{children}</main>
    </div>
  );
}
