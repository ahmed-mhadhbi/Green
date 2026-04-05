import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TOOLS_CATALOG } from "../data/toolsCatalog";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { buildToolProgressList } from "../utils/toolProgress";

export default function ToolsPage() {
  const { token, profile, firebaseUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      if (!token || profile?.role !== "entrepreneur") return;

      try {
        const res = await apiRequest("/projects/my", { token });
        setProjects(res.projects || []);
      } catch (err) {
        setError(err.message);
      }
    }

    loadProjects();
  }, [token, profile?.role]);

  const progressMap = useMemo(() => {
    return buildToolProgressList({
      uid: firebaseUser?.uid,
      projects: profile?.role === "entrepreneur" ? projects : []
    }).reduce((acc, item) => {
      acc[item.toolKey] = item;
      return acc;
    }, {});
  }, [firebaseUser?.uid, profile?.role, projects]);

  return (
    <div className="content-stack">
      <section className="card page-hero">
        <div className="hero-kicker">Toolkit Center</div>
        <h2>Tools</h2>
        <p>Choose a toolkit to continue your sustainability work.</p>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="tools-grid">
        {TOOLS_CATALOG.map((tool) => {
          const progress = progressMap[tool.key] || {
            percent: 0,
            answeredCount: 0,
            totalCount: tool.questions.length,
            status: "Not started"
          };

          return (
            <article key={tool.key} className="card tool-card">
              <div className="tool-head">
                <div className="tool-icon" aria-hidden="true">
                  {tool.title.split(" ").map((chunk) => chunk[0]).join("").slice(0, 2)}
                </div>
                <div className="tool-card-title-wrap">
                  <h3>{tool.title}</h3>
                  <span className="tool-percent-chip">{progress.percent}% filled</span>
                </div>
              </div>
              <p>{tool.description}</p>
              <p className="tool-progress">
                Progress: <strong>{progress.percent}%</strong> ({progress.answeredCount}/{progress.totalCount})
              </p>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${progress.percent}%` }}></div>
              </div>
              <p className="subtitle">Status: {progress.status}</p>
              <Link className="btn" to={`/app/tools/${tool.key}`}>Open tool</Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
