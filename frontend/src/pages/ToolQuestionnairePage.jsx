import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getToolByKey } from "../data/toolsCatalog";
import {
  calculateToolProgress,
  getToolProjectType,
  resolveAnswersForTool,
  saveLocalToolAnswers
} from "../utils/toolProgress";

export default function ToolQuestionnairePage() {
  const { toolKey } = useParams();
  const { token, profile, firebaseUser } = useAuth();

  const tool = getToolByKey(toolKey);
  const [projects, setProjects] = useState([]);
  const [answers, setAnswers] = useState({});
  const [source, setSource] = useState("local");
  const [projectId, setProjectId] = useState(null);
  const [message, setMessage] = useState("");

  const progress = useMemo(() => calculateToolProgress(tool, answers), [tool, answers]);

  useEffect(() => {
    async function load() {
      if (!tool) return;

      const isEntrepreneur = profile?.role === "entrepreneur";
      if (isEntrepreneur && token) {
        try {
          const res = await apiRequest("/projects/my", { token });
          const projectList = res.projects || [];
          setProjects(projectList);

          const resolved = resolveAnswersForTool({
            uid: firebaseUser?.uid,
            toolKey,
            projects: projectList
          });

          setAnswers(resolved.answers);
          setSource(resolved.source);
          setProjectId(resolved.project?.id || null);
          return;
        } catch (err) {
          setMessage(err.message);
        }
      }

      const resolved = resolveAnswersForTool({ uid: firebaseUser?.uid, toolKey, projects: [] });
      setAnswers(resolved.answers);
      setSource("local");
      setProjectId(null);
    }

    load();
  }, [token, profile?.role, firebaseUser?.uid, toolKey, tool]);

  if (!tool) {
    return (
      <section className="card">
        <h2>Tool not found</h2>
        <Link to="/app/tools" className="btn">Back to tools</Link>
      </section>
    );
  }

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function saveAnswers() {
    try {
      const isEntrepreneur = profile?.role === "entrepreneur";
      const projectType = getToolProjectType(tool.key);

      if (isEntrepreneur && token && projectType && projectId) {
        const currentProject = projects.find((project) => project.id === projectId);
        const forms = { ...(currentProject?.forms || {}), ...answers };

        await apiRequest(`/projects/${projectId}/forms`, {
          method: "PUT",
          token,
          body: { forms, submit: false }
        });

        setMessage("Saved to your project workspace.");
        setSource("project");
        return;
      }

      saveLocalToolAnswers(firebaseUser?.uid, tool.key, answers);
      setMessage(projectType ? "Saved locally. Create the matching project in Dashboard to sync." : "Saved locally.");
      setSource("local");
    } catch (err) {
      setMessage(err.message || "Failed to save answers.");
    }
  }

  function downloadGbmJson() {
    const payload = {
      toolKey: tool.key,
      title: tool.title,
      generatedAt: new Date().toISOString(),
      answers
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `GBM-${dayjs().format("YYYY-MM-DD")}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="content-stack">
      <section className="card">
        <h2>{tool.title}</h2>
        <p>{tool.description}</p>
        <p className="tool-progress">
          Progress: <strong>{progress.percent}%</strong> ({progress.answeredCount}/{progress.totalCount})
        </p>
        <p className="subtitle">Data source: {source === "project" ? "Project workspace" : "Local draft"}</p>
        {message ? <p className="info">{message}</p> : null}
      </section>

      <section className="card form-stack">
        {tool.questions.map((question) => (
          <div key={question.id} className="question-card">
            <label htmlFor={question.id}><strong>{question.label}</strong></label>
            <p className="question-description">Why this is asked: {question.description}</p>

            {question.inputType === "textarea" ? (
              <textarea
                id={question.id}
                rows="3"
                value={answers[question.id] || ""}
                onChange={(e) => setAnswer(question.id, e.target.value)}
              />
            ) : null}

            {question.inputType === "select" ? (
              <select
                id={question.id}
                value={answers[question.id] || ""}
                onChange={(e) => setAnswer(question.id, e.target.value)}
              >
                <option value="">Select an option</option>
                {(question.options || []).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : null}

            {question.inputType === "text" ? (
              <input
                id={question.id}
                type="text"
                value={answers[question.id] || ""}
                onChange={(e) => setAnswer(question.id, e.target.value)}
              />
            ) : null}
          </div>
        ))}

        <div className="inline">
          <button className="btn primary" onClick={saveAnswers}>Save answers</button>
          {tool.key === "green-business-model" ? (
            <button className="btn" onClick={downloadGbmJson}>Download GBM JSON</button>
          ) : null}
          <Link to="/app/tools" className="btn">Back to tools</Link>
        </div>
      </section>
    </div>
  );
}
