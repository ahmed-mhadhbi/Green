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
    if (profile?.role !== "entrepreneur") return {};

    return buildToolProgressList({
      uid: firebaseUser?.uid,
      projects
    }).reduce((acc, item) => {
      acc[item.toolKey] = item;
      return acc;
    }, {});
  }, [firebaseUser?.uid, profile?.role, projects]);

  return (
    <div className="content-stack">
      <section className="card">
        <h2>Tools</h2>
        <p>Choose a toolkit to continue your sustainability work.</p>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="tools-grid">
        {TOOLS_CATALOG.map((tool) => {
          const progress = progressMap[tool.key];

          return (
            <article key={tool.key} className="card tool-card">
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              {progress ? (
                <p className="tool-progress">
                  Progress: <strong>{progress.percent}%</strong> ({progress.status})
                </p>
              ) : null}
              <Link className="btn" to={`/app/tools/${tool.key}`}>Open tool</Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
