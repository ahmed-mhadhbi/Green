import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { TOOLS_CATALOG } from "../data/toolsCatalog";
import { getToolStepGroups } from "../data/toolNavigation";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  buildToolProgressList,
  calculateToolProgress,
  getToolProjectType
} from "../utils/toolProgress";

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  needs_corrections: "Needs corrections",
  validated: "Validated"
};

function getTimestampValue(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.valueOf() : 0;
}

function formatDateLabel(value) {
  const timestamp = getTimestampValue(value);
  return timestamp ? dayjs(timestamp).format("DD MMM YYYY") : "No recent update";
}

function averagePercent(values = []) {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (validValues.length === 0) return 0;
  return Math.round(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
}

function formatProjectStatus(status) {
  return STATUS_LABELS[status] || "Draft";
}

function getProjectTool(project) {
  return TOOLS_CATALOG.find((tool) => getToolProjectType(tool.key) === project.type) || null;
}

function getProjectProgress(project) {
  const tool = getProjectTool(project);
  if (!tool) {
    return {
      toolKey: null,
      toolTitle: project.title,
      percent: 0,
      answeredCount: 0,
      totalCount: 0,
      status: "Not started"
    };
  }

  const progress = calculateToolProgress(tool, project.forms || {});
  return {
    toolKey: tool.key,
    toolTitle: tool.title,
    ...progress
  };
}

export default function ToolsPage() {
  const { token, profile, firebaseUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [activeToolKey, setActiveToolKey] = useState(TOOLS_CATALOG[0]?.key || null);

  useEffect(() => {
    async function loadData() {
      if (!token) return;

      try {
        setError("");

        if (profile?.role === "mentor") {
          const [projectsRes, groupsRes] = await Promise.all([
            apiRequest("/projects/my", { token }),
            apiRequest("/groups/my", { token })
          ]);

          setProjects(projectsRes.projects || []);
          setGroups(groupsRes.groups || []);
          return;
        }

        if (profile?.role === "entrepreneur") {
          const res = await apiRequest("/projects/my", { token });
          setProjects(res.projects || []);
        } else {
          setProjects([]);
        }

        setGroups([]);
      } catch (err) {
        setError(err.message);
      }
    }

    loadData();
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

  useEffect(() => {
    if (!toolBrowser.some(({ tool }) => tool.key === activeToolKey)) {
      setActiveToolKey(toolBrowser[0]?.tool.key || null);
    }
  }, [activeToolKey, toolBrowser]);

  const activeToolEntry = useMemo(() => {
    return toolBrowser.find(({ tool }) => tool.key === activeToolKey) || toolBrowser[0] || null;
  }, [activeToolKey, toolBrowser]);

  const mentorEntrepreneurs = useMemo(() => {
    if (profile?.role !== "mentor") return [];

    const summaryMap = new Map();

    groups.forEach((group) => {
      (group.members || []).forEach((member) => {
        if (!member.userId) return;
        const existing = summaryMap.get(member.userId) || {
          id: member.userId,
          name: member.user?.name || "Entrepreneur",
          email: member.user?.email || "",
          projects: [],
          groupMemberships: []
        };

        if (!existing.groupMemberships.some((item) => item.id === group.id)) {
          existing.groupMemberships.push({
            id: group.id,
            title: group.title
          });
        }

        if (!existing.name && member.user?.name) existing.name = member.user.name;
        if (!existing.email && member.user?.email) existing.email = member.user.email;
        summaryMap.set(member.userId, existing);
      });
    });

    projects.forEach((project) => {
      if (!project.entrepreneurId) return;
      const existing = summaryMap.get(project.entrepreneurId) || {
        id: project.entrepreneurId,
        name: project.entrepreneurName || project.entrepreneurProfile?.name || "Entrepreneur",
        email: project.entrepreneurEmail || project.entrepreneurProfile?.email || "",
        projects: [],
        groupMemberships: []
      };

      existing.name = existing.name || project.entrepreneurName || project.entrepreneurProfile?.name || "Entrepreneur";
      existing.email = existing.email || project.entrepreneurEmail || project.entrepreneurProfile?.email || "";
      existing.projects.push(project);
      summaryMap.set(project.entrepreneurId, existing);
    });

    return [...summaryMap.values()]
      .map((entry) => {
        const projectSummaries = entry.projects.map((project) => ({
          project,
          progress: getProjectProgress(project)
        }));
        const latestProject = [...entry.projects].sort(
          (a, b) => getTimestampValue(b.updatedAt) - getTimestampValue(a.updatedAt)
        )[0] || null;

        return {
          ...entry,
          projectSummaries,
          avgProgress: averagePercent(projectSummaries.map((item) => item.progress.percent)),
          feedbackCount: entry.projects.reduce((sum, project) => sum + (project.feedback || []).length, 0),
          validatedCount: entry.projects.filter((project) => project.status === "validated").length,
          needsCorrectionsCount: entry.projects.filter((project) => project.status === "needs_corrections").length,
          latestProject
        };
      })
      .sort((a, b) => {
        const latestDiff = getTimestampValue(b.latestProject?.updatedAt) - getTimestampValue(a.latestProject?.updatedAt);
        if (latestDiff !== 0) return latestDiff;
        return b.avgProgress - a.avgProgress;
      });
  }, [groups, profile?.role, projects]);

  const mentorGroupSummaries = useMemo(() => {
    if (profile?.role !== "mentor") return [];

    const entrepreneurMap = new Map(mentorEntrepreneurs.map((item) => [item.id, item]));

    return groups
      .map((group) => {
        const members = (group.members || []).map((member) => ({
          id: member.userId,
          name: member.user?.name || "Entrepreneur",
          email: member.user?.email || "",
          joinedAt: member.joinedAt
        }));
        const relatedEntrepreneurs = members
          .map((member) => entrepreneurMap.get(member.id))
          .filter(Boolean);
        const memberProjects = relatedEntrepreneurs.flatMap((entrepreneur) => entrepreneur.projects);
        const latestActivity = memberProjects.sort(
          (a, b) => getTimestampValue(b.updatedAt) - getTimestampValue(a.updatedAt)
        )[0]?.updatedAt || members.sort(
          (a, b) => getTimestampValue(b.joinedAt) - getTimestampValue(a.joinedAt)
        )[0]?.joinedAt || null;

        return {
          ...group,
          members,
          memberCount: group.memberCount || members.length,
          relatedEntrepreneurs,
          projectCount: memberProjects.length,
          activeMembers: relatedEntrepreneurs.filter((entrepreneur) => entrepreneur.avgProgress > 0).length,
          avgProgress: averagePercent(relatedEntrepreneurs.map((entrepreneur) => entrepreneur.avgProgress)),
          validatedProjects: memberProjects.filter((project) => project.status === "validated").length,
          latestActivity
        };
      })
      .sort((a, b) => getTimestampValue(b.latestActivity) - getTimestampValue(a.latestActivity));
  }, [groups, mentorEntrepreneurs, profile?.role]);

  const mentorStats = useMemo(() => {
    if (profile?.role !== "mentor") return null;

    return {
      entrepreneurCount: mentorEntrepreneurs.length,
      groupCount: mentorGroupSummaries.length,
      averageProgress: averagePercent(mentorEntrepreneurs.map((item) => item.avgProgress)),
      needsCorrectionsCount: projects.filter((project) => project.status === "needs_corrections").length
    };
  }, [mentorEntrepreneurs, mentorGroupSummaries.length, profile?.role, projects]);

  if (profile?.role === "mentor") {
    return (
      <div className="content-stack">
        <section className="card page-hero mentor-tools-hero">
          <div className="hero-kicker">Mentor workspace</div>
          <h2>Mentor</h2>
          <p>See the improvements of your related entrepreneurs and groups in one place.</p>
          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="mentor-tools-stats">
          <article className="card mentor-stat-card">
            <span>Related entrepreneurs</span>
            <strong>{mentorStats?.entrepreneurCount || 0}</strong>
            <p>Entrepreneurs linked through projects or groups.</p>
          </article>
          <article className="card mentor-stat-card">
            <span>Active groups</span>
            <strong>{mentorStats?.groupCount || 0}</strong>
            <p>Groups currently managed in your workspace.</p>
          </article>
          <article className="card mentor-stat-card">
            <span>Average improvement</span>
            <strong>{mentorStats?.averageProgress || 0}%</strong>
            <p>Average progress across your related entrepreneurs.</p>
          </article>
          <article className="card mentor-stat-card">
            <span>Need corrections</span>
            <strong>{mentorStats?.needsCorrectionsCount || 0}</strong>
            <p>Projects waiting for entrepreneur updates.</p>
          </article>
        </section>

        <section className="card">
          <div className="mentor-section-head">
            <div>
              <h3>Entrepreneur improvements</h3>
              <p>Track project progress, latest status, and feedback activity.</p>
            </div>
          </div>

          {mentorEntrepreneurs.length === 0 ? (
            <p>No related entrepreneurs yet.</p>
          ) : (
            <div className="mentor-improvement-grid">
              {mentorEntrepreneurs.map((entrepreneur) => (
                <article key={entrepreneur.id} className="mentor-improvement-card">
                  <div className="mentor-card-head">
                    <div>
                      <h3>{entrepreneur.name}</h3>
                      <p>{entrepreneur.email || entrepreneur.id}</p>
                    </div>
                    <span className={`status-pill ${entrepreneur.latestProject?.status || "draft"}`}>
                      {formatProjectStatus(entrepreneur.latestProject?.status)}
                    </span>
                  </div>

                  <div className="mentor-score-row">
                    <strong>{entrepreneur.avgProgress}%</strong>
                    <span>Average improvement</span>
                  </div>
                  <div className="progress-track" aria-hidden="true">
                    <div className="progress-fill" style={{ width: `${entrepreneur.avgProgress}%` }}></div>
                  </div>

                  <div className="mentor-meta-grid">
                    <div>
                      <span>Projects</span>
                      <strong>{entrepreneur.projects.length}</strong>
                    </div>
                    <div>
                      <span>Feedback</span>
                      <strong>{entrepreneur.feedbackCount}</strong>
                    </div>
                    <div>
                      <span>Validated</span>
                      <strong>{entrepreneur.validatedCount}</strong>
                    </div>
                    <div>
                      <span>Corrections</span>
                      <strong>{entrepreneur.needsCorrectionsCount}</strong>
                    </div>
                  </div>

                  {entrepreneur.groupMemberships.length > 0 ? (
                    <div className="mentor-chip-row">
                      {entrepreneur.groupMemberships.map((group) => (
                        <span key={group.id} className="mentor-chip">{group.title}</span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mentor-project-list">
                    {entrepreneur.projectSummaries.length === 0 ? (
                      <p className="mentor-empty-note">No project progress yet.</p>
                    ) : (
                      entrepreneur.projectSummaries.map(({ project, progress }) => (
                        <div key={project.id} className="mentor-project-item">
                          <div className="mentor-project-head">
                            <strong>{progress.toolTitle}</strong>
                            <span>{progress.percent}%</span>
                          </div>
                          <div className="progress-track" aria-hidden="true">
                            <div className="progress-fill" style={{ width: `${progress.percent}%` }}></div>
                          </div>
                          <p>
                            {progress.answeredCount}/{progress.totalCount} answers
                            {project.status ? ` • ${formatProjectStatus(project.status)}` : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <p className="mentor-update-note">
                    Last update: {formatDateLabel(entrepreneur.latestProject?.updatedAt)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="mentor-section-head">
            <div>
              <h3>Group improvements</h3>
              <p>Follow member activity and the overall progress inside each mentor group.</p>
            </div>
          </div>

          {mentorGroupSummaries.length === 0 ? (
            <p>No groups created yet.</p>
          ) : (
            <div className="mentor-group-grid">
              {mentorGroupSummaries.map((group) => (
                <article key={group.id} className="mentor-group-card">
                  <div className="mentor-card-head">
                    <div>
                      <h3>{group.title}</h3>
                      <p>Code: {group.code}</p>
                    </div>
                    <span className="mentor-group-badge">{group.avgProgress}%</span>
                  </div>

                  <div className="progress-track" aria-hidden="true">
                    <div className="progress-fill" style={{ width: `${group.avgProgress}%` }}></div>
                  </div>

                  <div className="mentor-meta-grid">
                    <div>
                      <span>Members</span>
                      <strong>{group.memberCount}</strong>
                    </div>
                    <div>
                      <span>Active</span>
                      <strong>{group.activeMembers}</strong>
                    </div>
                    <div>
                      <span>Projects</span>
                      <strong>{group.projectCount}</strong>
                    </div>
                    <div>
                      <span>Lessons</span>
                      <strong>{(group.lessons || []).length}</strong>
                    </div>
                  </div>

                  {group.members.length > 0 ? (
                    <div className="mentor-chip-row">
                      {group.members.map((member) => (
                        <span key={`${group.id}-${member.id}`} className="mentor-chip">
                          {member.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mentor-empty-note">No members joined this group yet.</p>
                  )}

                  <p className="mentor-update-note">
                    Latest activity: {formatDateLabel(group.latestActivity)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="content-stack">
      <section className="card page-hero">
        <div className="hero-kicker">Toolkit center</div>
        <h2>Tools</h2>
        <p>Choose a toolkit and continue your sustainability work from the left sidebar.</p>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {activeToolEntry ? (
        <section className="tools-browser-shell">
          <aside className="card tools-browser-sidebar">
            <div className="tools-browser-sidebar-head">
              <h3>Tools list</h3>
              <p>Use the small left rail to switch quickly between toolkits.</p>
            </div>

            <div className="tools-browser-rail">
              {toolBrowser.map(({ tool, progress }) => (
                <button
                  key={tool.key}
                  type="button"
                  className={`tool-rail-item ${activeToolEntry.tool.key === tool.key ? "active" : ""}`}
                  onClick={() => setActiveToolKey(tool.key)}
                >
                  <div className="tool-rail-copy">
                    <strong>{tool.title}</strong>
                    <span>{progress.status}</span>
                  </div>
                  <span className="tool-rail-percent">{progress.percent}%</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="card tools-browser-main">
            <div className="tools-browser-main-head">
              <div>
                <h3>{activeToolEntry.tool.title}</h3>
                <p>{activeToolEntry.tool.description}</p>
              </div>
              <Link className="btn primary" to={`/app/tools/${activeToolEntry.tool.key}`}>
                Open tool
              </Link>
            </div>

            <div className="tool-browser-main-meta">
              <span className="tool-percent-chip">{activeToolEntry.progress.percent}% complete</span>
              <span className="tool-browser-status">
                {activeToolEntry.progress.answeredCount}/{activeToolEntry.progress.totalCount} answers
              </span>
            </div>

            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${activeToolEntry.progress.percent}%` }}></div>
            </div>

            <div className="tool-browser-step-list tool-browser-step-list-compact">
              {activeToolEntry.steps.map((step) => (
                <div key={step.id} className="tool-browser-step-card">
                  <div className="tool-browser-step-card-head">
                    <strong>{step.title}</strong>
                    <span className="tool-browser-step-meta">{step.items.length} pages</span>
                  </div>

                  <div className="tool-browser-page-list">
                    {step.items.map((item) => (
                      <Link
                        key={item.id}
                        className="tool-browser-page-link"
                        to={`/app/tools/${activeToolEntry.tool.key}?section=${item.sectionIndex}`}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
}
