import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const APPLICATIONS = [
  { id: "app-1", title: "Mediterranean Green Accelerator", period: "Open until 2026-03-31" },
  { id: "app-2", title: "Circular Innovation Grant", period: "Open until 2026-04-15" }
];

export default function ProductsPage() {
  const { token, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!token) return;

      try {
        const [projectsRes, sessionsRes] = await Promise.all([
          apiRequest("/projects/my", { token }),
          apiRequest("/sessions/my", { token })
        ]);

        setProjects(projectsRes.projects || []);
        setSessions(sessionsRes.sessions || []);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [token]);

  const documents = useMemo(() => {
    return projects.flatMap((project) => {
      return (project.documents || []).map((document) => ({
        ...document,
        projectTitle: project.title,
        url: `${API_ORIGIN}${document.path}`
      }));
    });
  }, [projects]);

  return (
    <div className="content-stack">
      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <h2>Products</h2>
        <p>
          {profile?.role === "entrepreneur"
            ? "Access forms, workshops, applications, and generated documents."
            : "Review products workflows and shared resources from one place."}
        </p>
      </section>

      <section className="products-grid">
        <article className="card">
          <h3>Forms</h3>
          <p>Complete product or service forms from your dashboard workspace.</p>
          <Link className="btn" to="/dashboard">Go to dashboard forms</Link>
        </article>

        <article className="card">
          <h3>Workshops</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Start</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="3">No workshop sessions started yet.</td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{session.topic}</td>
                      <td>{dayjs(session.startAt).format("YYYY-MM-DD HH:mm")}</td>
                      <td>{session.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h3>Call for application</h3>
          {APPLICATIONS.map((application) => (
            <div className="tile" key={application.id}>
              <p><strong>{application.title}</strong></p>
              <p>{application.period}</p>
              <button className="btn" disabled>Apply (MVP placeholder)</button>
            </div>
          ))}
        </article>

        <article className="card">
          <h3>My documents</h3>
          {documents.length === 0 ? <p>No generated documents yet.</p> : null}
          {documents.map((document, index) => (
            <div className="tile" key={`${document.fileName}-${index}`}>
              <p><strong>{document.name}</strong></p>
              <p>Project: {document.projectTitle}</p>
              <a href={document.url} target="_blank" rel="noreferrer">Download</a>
            </div>
          ))}
        </article>
      </section>

      <section className="card">
        <h3>Eco-innovation</h3>
        <p>
          Discover practical sustainability pathways and improve your solution through the available tools.
        </p>
        <Link className="btn" to="/app/tools">Go to eco-innovation tools</Link>
      </section>
    </div>
  );
}
