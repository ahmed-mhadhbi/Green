import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TOOLS_CATALOG } from "../data/toolsCatalog";
import { getToolStepGroups } from "../data/toolNavigation";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { buildToolProgressList } from "../utils/toolProgress";

export default function ToolsPage() {
  const { token, profile, firebaseUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [openToolKey, setOpenToolKey] = useState(null);
  const [openStepKey, setOpenStepKey] = useState(null);

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

  const toolBrowser = useMemo(() => {
    return TOOLS_CATALOG.map((tool) => ({
      tool,
      steps: getToolStepGroups(tool),
      progress: progressMap[tool.key] || {
        percent: 0,
        answeredCount: 0,
        totalCount: tool.questions.length,
        status: "Not started"
      }
    }));
  }, [progressMap]);

  const handleToolToggle = (toolKey) => {
    setOpenToolKey((current) => (current === toolKey ? null : toolKey));
    setOpenStepKey(null);
  };

  const handleStepToggle = (toolKey, stepNumber) => {
    const nextKey = `${toolKey}:${stepNumber}`;
    setOpenStepKey((current) => (current === nextKey ? null : nextKey));
  };

  return (
    <div className="content-stack">
      <section className="card page-hero">
        <div className="hero-kicker">Toolkit Center</div>
        <h2>Tools</h2>
        <p>Choose a toolkit to continue your sustainability work.</p>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="tools-browser">
        {toolBrowser.map(({ tool, progress, steps }) => {
          const isToolOpen = openToolKey === tool.key;

          return (
            <article key={tool.key} className={`card tool-browser-card ${isToolOpen ? "open" : ""}`}>
              <button
                type="button"
                className="tool-browser-summary"
                onClick={() => handleToolToggle(tool.key)}
                aria-expanded={isToolOpen}
              >
                <div className="tool-browser-summary-copy">
                  <h3>{tool.title}</h3>
                  <p className="tool-progress">
                    Progress: <strong>{progress.percent}%</strong> ({progress.answeredCount}/{progress.totalCount})
                  </p>
                </div>
                <span className="tool-browser-toggle" aria-hidden="true">{isToolOpen ? "-" : "+"}</span>
              </button>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${progress.percent}%` }}></div>
              </div>
              {isToolOpen ? (
                <div className="tool-browser-details">
                  <p className="subtitle">Status: {progress.status}</p>
                  <div className="tool-browser-step-list">
                    {steps.map((step) => {
                      const stepKey = `${tool.key}:${step.stepNumber}`;
                      const isStepOpen = openStepKey === stepKey;

                      return (
                        <div key={step.id} className="tool-browser-step-card">
                          <button
                            type="button"
                            className="tool-browser-step-trigger"
                            onClick={() => handleStepToggle(tool.key, step.stepNumber)}
                            aria-expanded={isStepOpen}
                          >
                            <strong>{step.title}</strong>
                            <span className="tool-browser-step-meta">{step.items.length} pages</span>
                          </button>

                          {isStepOpen ? (
                            <div className="tool-browser-page-list">
                              {step.items.map((item) => (
                                <Link
                                  key={item.id}
                                  className="tool-browser-page-link"
                                  to={`/app/tools/${tool.key}?section=${item.sectionIndex}`}
                                >
                                  {item.title}
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
