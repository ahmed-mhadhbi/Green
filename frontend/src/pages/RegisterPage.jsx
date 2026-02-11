import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "entrepreneur"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
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
          <p className="auth-kicker">Join the Program</p>
          <h1>Start your entrepreneurship journey with sustainability at the core.</h1>
          <p>
            Access structured learning, submit your Green BMC, and get strategic feedback from mentors.
          </p>
        </section>
        <form className="card auth-card" onSubmit={onSubmit}>
          <h2>Create account</h2>
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="mentor">Mentor</option>
          </select>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
          <p>Already registered? <Link to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
