import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <section className="auth-copy card">
          <p className="auth-kicker">Green Founders Hub</p>
          <h1>Build ventures that grow profit and planet impact together.</h1>
          <p>
            Learn, validate, and scale with mentor-backed milestones from idea to growth.
          </p>
        </section>
        <form className="card auth-card" onSubmit={onSubmit}>
          <h2>Welcome back</h2>
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          <p>No account? <Link to="/register">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
