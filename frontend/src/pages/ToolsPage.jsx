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
  getToolForProjectType
} from "../utils/toolProgress";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

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

function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return url;
}

function getCorrectionStatus(review) {
  if (!review?.reviewedAt) return null;
  return review.correctionStatus || (review.corrected || review.verified ? "yes" : "no");
}

function getCorrectionLabel(review) {
  const status = getCorrectionStatus(review);
  if (status === "yes") return "Yes";
  if (status === "no") return "No";
  return "Pending";
}

function getVisibleProgressLabel(progress) {
  if (!progress?.hasMentorCorrection) return "Pending mentor correction";
  return `${progress.reviewedPercent}%`;
}

function getProjectTool(project) {
  return getToolForProjectType(project?.type);
}

function getProjectProgress(project) {
  const tool = getProjectTool(project);
  if (!tool) {
    return {
      toolKey: null,
      toolTitle: project?.title || "Project",
      percent: 0,
      answeredCount: 0,
      totalCount: 0,
      status: "Not started"
    };
  }

  const progress = calculateToolProgress(tool, project.forms || {});
  const activity = project?.toolActivity?.[tool.key] || null;
  const percent = Number.isFinite(Number(activity?.progressPercent)) ? Number(activity.progressPercent) : progress.percent;
  const answeredCount = Number.isFinite(Number(activity?.answeredCount)) ? Number(activity.answeredCount) : progress.answeredCount;
  const totalCount = Number.isFinite(Number(activity?.totalCount)) ? Number(activity.totalCount) : progress.totalCount;
  let status = "Not started";
  if (percent > 0 && percent < 100) status = "In progress";
  if (percent >= 100) status = "Completed";

  return {
    toolKey: tool.key,
    toolTitle: tool.title,
    ...progress,
    percent,
    answeredCount,
    totalCount,
    status
  };
}

function getProjectLastOpen(project) {
  const tool = getProjectTool(project);
  if (tool && project?.toolActivity?.[tool.key]?.lastOpenedAt) {
    return project.toolActivity[tool.key].lastOpenedAt;
  }
  return project?.updatedAt || null;
}

function getLatestProject(projects = []) {
  return [...projects].sort((a, b) => getTimestampValue(b.updatedAt) - getTimestampValue(a.updatedAt))[0] || null;
}

export default function ToolsPage() {
  const { token, profile, firebaseUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [error, setError] = useState("");
  const [mentorMessage, setMentorMessage] = useState("");
  const [activeToolKey, setActiveToolKey] = useState(TOOLS_CATALOG[0]?.key || null);
  const [selectedEntrepreneurId, setSelectedEntrepreneurId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [reviewDecision, setReviewDecision] = useState("yes");
  const [reviewRecommendation, setReviewRecommendation] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonFile, setLessonFile] = useState(null);

  async function loadData() {
    if (!token) return;

    try {
      setError("");

      if (profile?.role === "mentor") {
        const [projectsRes, groupsRes, requestsRes] = await Promise.all([
          apiRequest("/projects/my", { token }),
          apiRequest("/groups/my", { token }),
          apiRequest("/projects/deletion-requests/my", { token })
        ]);

        setProjects(projectsRes.projects || []);
        setGroups(groupsRes.groups || []);
        setMentorRequests(requestsRes.requests || []);
        return;
      }

      if (profile?.role === "entrepreneur") {
        const [projectsRes, groupsRes] = await Promise.all([
          apiRequest("/projects/my", { token }),
          apiRequest("/groups/my", { token })
        ]);
        setProjects(projectsRes.projects || []);
        setGroups(groupsRes.groups || []);
      } else {
        setProjects([]);
        setGroups([]);
      }

      setMentorRequests([]);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
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

  const toolStats = useMemo(() => {
    const started = toolBrowser.filter(({ progress }) => progress.percent > 0).length;
    const completed = toolBrowser.filter(({ progress }) => progress.percent >= 100).length;
    const totalAnswers = toolBrowser.reduce((sum, { progress }) => sum + progress.answeredCount, 0);

    return {
      total: toolBrowser.length,
      started,
      completed,
      totalAnswers
    };
  }, [toolBrowser]);

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
        const projectSummaries = entry.projects.map((project) => {
          const progress = getProjectProgress(project);
          const tool = getProjectTool(project);

          return {
            project,
            progress,
            review: tool ? project.mentorToolReviews?.[tool.key] || null : null
          };
        });
        const latestProject = getLatestProject(entry.projects);
        const latestProjectTool = getProjectTool(latestProject);

        return {
          ...entry,
          projectSummaries,
          avgProgress: averagePercent(projectSummaries.map((item) => item.progress.percent)),
          feedbackCount: entry.projects.reduce((sum, project) => sum + (project.feedback || []).length, 0),
          validatedCount: entry.projects.filter((project) => project.status === "validated").length,
          needsCorrectionsCount: entry.projects.filter((project) => project.status === "needs_corrections").length,
          latestProject,
          latestProjectTool,
          latestReview: latestProjectTool ? latestProject?.mentorToolReviews?.[latestProjectTool.key] || null : null
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
        const latestActivity = getLatestProject(memberProjects)?.updatedAt
          || [...members].sort((a, b) => getTimestampValue(b.joinedAt) - getTimestampValue(a.joinedAt))[0]?.joinedAt
          || null;

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

  const mentorRequestsByEntrepreneur = useMemo(() => {
    return mentorRequests.reduce((acc, request) => {
      const current = acc[request.entrepreneurId];
      if (!current || getTimestampValue(request.updatedAt || request.createdAt) > getTimestampValue(current.updatedAt || current.createdAt)) {
        acc[request.entrepreneurId] = request;
      }
      return acc;
    }, {});
  }, [mentorRequests]);

  const mentorProjectRows = useMemo(() => {
    return mentorEntrepreneurs.flatMap((entrepreneur) => {
      if (!entrepreneur.projects.length) {
        return [{
          key: `${entrepreneur.id}-no-project`,
          entrepreneur,
          project: null,
          progress: { percent: 0, answeredCount: 0, totalCount: 0 },
          review: null,
          lastOpen: null
        }];
      }

      return entrepreneur.projects
        .map((project) => {
          const tool = getProjectTool(project);
          return {
            key: `${entrepreneur.id}-${project.id}`,
            entrepreneur,
            project,
            progress: getProjectProgress(project),
            review: tool ? project.mentorToolReviews?.[tool.key] || null : null,
            lastOpen: getProjectLastOpen(project)
          };
        })
        .sort((left, right) => getTimestampValue(right.lastOpen || right.project?.updatedAt) - getTimestampValue(left.lastOpen || left.project?.updatedAt));
    });
  }, [mentorEntrepreneurs]);

  const selectedEntrepreneur = useMemo(() => {
    return mentorEntrepreneurs.find((entrepreneur) => entrepreneur.id === selectedEntrepreneurId) || mentorEntrepreneurs[0] || null;
  }, [mentorEntrepreneurs, selectedEntrepreneurId]);

  const selectedGroup = useMemo(() => {
    return groups.find((group) => group.id === selectedGroupId) || groups[0] || null;
  }, [groups, selectedGroupId]);

  const selectedProject = useMemo(() => {
    if (!selectedEntrepreneur) return null;
    return selectedEntrepreneur.projects.find((project) => project.id === selectedProjectId)
      || selectedEntrepreneur.latestProject
      || selectedEntrepreneur.projects[0]
      || null;
  }, [selectedEntrepreneur, selectedProjectId]);

  const selectedProjectTool = useMemo(() => getProjectTool(selectedProject), [selectedProject]);
  const selectedProjectProgress = useMemo(() => (selectedProject ? getProjectProgress(selectedProject) : null), [selectedProject]);
  const selectedProjectReview = useMemo(() => {
    if (!selectedProject || !selectedProjectTool) return null;
    return selectedProject.mentorToolReviews?.[selectedProjectTool.key] || null;
  }, [selectedProject, selectedProjectTool]);
  const selectedDeletionRequest = selectedEntrepreneur ? mentorRequestsByEntrepreneur[selectedEntrepreneur.id] || null : null;

  useEffect(() => {
    if (!mentorEntrepreneurs.length) {
      setSelectedEntrepreneurId(null);
      return;
    }

    if (!selectedEntrepreneurId || !mentorEntrepreneurs.some((item) => item.id === selectedEntrepreneurId)) {
      setSelectedEntrepreneurId(mentorEntrepreneurs[0].id);
    }
  }, [mentorEntrepreneurs, selectedEntrepreneurId]);

  useEffect(() => {
    if (!selectedEntrepreneur) {
      setSelectedProjectId("");
      return;
    }

    if (selectedProjectId && selectedEntrepreneur.projects.some((project) => project.id === selectedProjectId)) {
      return;
    }

    const nextProject = selectedEntrepreneur.latestProject || selectedEntrepreneur.projects[0] || null;
    setSelectedProjectId(nextProject?.id || "");
  }, [selectedEntrepreneur, selectedProjectId]);

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId("");
      return;
    }

    if (!selectedGroupId || !groups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    setReviewDecision(getCorrectionStatus(selectedProjectReview) === "no" ? "no" : "yes");
    setReviewRecommendation(selectedProjectReview?.recommendation || selectedProjectReview?.comment || "");
    setDeletionReason("");
    setLessonTitle("");
    setLessonDescription("");
    setLessonFile(null);
  }, [selectedProject?.id, selectedProjectReview?.reviewedAt]);

  async function submitToolReview(event) {
    event.preventDefault();
    if (!selectedProject || !selectedProjectTool) return;

    try {
      await apiRequest(`/projects/${selectedProject.id}/tool-review`, {
        method: "POST",
        token,
        body: {
          toolKey: selectedProjectTool.key,
          corrected: reviewDecision === "yes",
          verified: reviewDecision === "yes",
          recommendation: reviewRecommendation,
          comment: reviewRecommendation,
          progressPercent: selectedProjectProgress?.percent || 0,
          answeredCount: selectedProjectProgress?.answeredCount || 0,
          totalCount: selectedProjectProgress?.totalCount || 0
        }
      });
      setMentorMessage(reviewDecision === "yes" ? "Answers marked yes and saved." : "Answers marked no with your comment.");
      await loadData();
    } catch (err) {
      setMentorMessage(err.message || "Failed to correct answers.");
    }
  }

  async function submitDeletionRequest(event) {
    event.preventDefault();
    if (!selectedEntrepreneur) return;

    try {
      await apiRequest(`/projects/entrepreneurs/${selectedEntrepreneur.id}/delete-request`, {
        method: "POST",
        token,
        body: { reason: deletionReason }
      });
      setMentorMessage("Deletion request sent to admin for approval.");
      await loadData();
    } catch (err) {
      setMentorMessage(err.message || "Failed to send deletion request.");
    }
  }

  async function uploadPrivateLesson(event) {
    event.preventDefault();
    if (!selectedGroup || !lessonFile) return;

    try {
      const formData = new FormData();
      formData.append("title", lessonTitle);
      formData.append("description", lessonDescription);
      formData.append("file", lessonFile);

      await apiRequest(`/groups/${selectedGroup.id}/lessons/upload`, {
        method: "POST",
        token,
        body: formData,
        formData: true
      });

      setLessonTitle("");
      setLessonDescription("");
      setLessonFile(null);
      setMentorMessage("Private screen record uploaded for the whole group.");
      await loadData();
    } catch (err) {
      setMentorMessage(err.message || "Failed to upload lesson.");
    }
  }

  if (profile?.role === "mentor") {
    return (
      <div className="content-stack">
        <section className="card page-hero mentor-tools-hero">
          <div className="hero-kicker">Mentor workspace</div>
          <h2>Mentor</h2>
          <p>Track real project activity, verify answers, upload private screen records to groups, and request deletions for admin approval.</p>
          {error ? <p className="error">{error}</p> : null}
          {mentorMessage ? <p className="info">{mentorMessage}</p> : null}
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
              <h3>Entrepreneurs table</h3>
              <p>Name, project, etape, status, progression, last open, and edit options in one table.</p>
            </div>
          </div>

          {mentorProjectRows.length === 0 ? (
            <p>No related entrepreneurs yet.</p>
          ) : (
            <div className="table-wrap mentor-table-wrap">
              <table className="mentor-entrepreneur-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Project</th>
                    <th>Etape</th>
                    <th>Status</th>
                    <th>Progression</th>
                    <th>Last open</th>
                    <th>Edit option</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorProjectRows.map((row) => {
                    const latestRequest = mentorRequestsByEntrepreneur[row.entrepreneur.id];
                    const correctionStatus = getCorrectionStatus(row.review);

                    return (
                      <tr
                        key={row.key}
                        className={correctionStatus ? `mentor-table-row mentor-table-row-${correctionStatus}` : "mentor-table-row"}
                      >
                        <td>
                          <strong>{row.entrepreneur.name}</strong>
                          <p>{row.entrepreneur.email || row.entrepreneur.id}</p>
                        </td>
                        <td>{row.project?.title || "No project yet"}</td>
                        <td>{row.project?.stage || "-"}</td>
                        <td>
                          <span className={`status-pill ${row.project?.status || "draft"}`}>
                            {formatProjectStatus(row.project?.status)}
                          </span>
                        </td>
                        <td>
                          <strong>{row.progress.percent}%</strong>
                          {correctionStatus ? (
                            <span className={`correction-badge correction-badge-${correctionStatus}`}>
                              {getCorrectionLabel(row.review)}
                            </span>
                          ) : null}
                        </td>
                        <td>{formatDateLabel(row.lastOpen)}</td>
                        <td>
                          <div className="mentor-table-actions">
                            <button
                              className="btn"
                              type="button"
                              onClick={() => {
                                setSelectedEntrepreneurId(row.entrepreneur.id);
                                setSelectedProjectId(row.project?.id || "");
                              }}
                            >
                              Edit
                            </button>
                            {latestRequest ? (
                              <span className={`status-pill status-pill-${latestRequest.status}`}>
                                {latestRequest.status}
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedEntrepreneur ? (
          <section className="card mentor-editor-card">
            <div className="mentor-card-head">
              <div>
                <h3>Edit entrepreneur</h3>
                <p>{selectedEntrepreneur.name} - {selectedEntrepreneur.email || selectedEntrepreneur.id}</p>
              </div>
              {selectedDeletionRequest ? (
                <span className={`status-pill status-pill-${selectedDeletionRequest.status}`}>
                  Delete request: {selectedDeletionRequest.status}
                </span>
              ) : null}
            </div>

            {selectedEntrepreneur.projects.length > 1 ? (
              <div className="form-stack">
                <label htmlFor="mentor-project-select"><strong>Select project</strong></label>
                <select
                  id="mentor-project-select"
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                >
                  {selectedEntrepreneur.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {selectedProject ? (
              <>
                <div className="mentor-meta-grid">
                  <div>
                    <span>Project</span>
                    <strong>{selectedProject.title}</strong>
                  </div>
                  <div>
                    <span>Tool</span>
                    <strong>{selectedProjectTool?.title || "No linked tool"}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{formatProjectStatus(selectedProject.status)}</strong>
                  </div>
                  <div>
                    <span>Progress</span>
                    <strong>{selectedProjectProgress?.percent || 0}%</strong>
                  </div>
                </div>

                <div className="mentor-editor-grid mentor-editor-grid-two">
                  <article className="mentor-editor-panel">
                    <div className="mentor-card-head">
                      <div>
                        <h3>Verify answers</h3>
                        <p>Review the entrepreneur answers, mark yes or no, and send the comment they should see.</p>
                      </div>
                      {getCorrectionStatus(selectedProjectReview) ? (
                        <span className={`correction-badge correction-badge-${getCorrectionStatus(selectedProjectReview)}`}>
                          {getCorrectionLabel(selectedProjectReview)}
                        </span>
                      ) : null}
                    </div>

                    {selectedProjectTool ? (
                      <>
                        <Link className="btn" to={`/app/tools/${selectedProjectTool.key}?projectId=${selectedProject.id}`}>
                          Open and correct
                        </Link>
                        <form className="form-stack" onSubmit={submitToolReview}>
                          <div className="correction-choice-row" role="group" aria-label="Correction result">
                            <button
                              type="button"
                              className={`correction-choice correction-choice-yes ${reviewDecision === "yes" ? "active" : ""}`}
                              onClick={() => setReviewDecision("yes")}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className={`correction-choice correction-choice-no ${reviewDecision === "no" ? "active" : ""}`}
                              onClick={() => setReviewDecision("no")}
                            >
                              No
                            </button>
                          </div>
                          <textarea
                            rows="4"
                            placeholder={reviewDecision === "no" ? "Explain what is wrong and what the entrepreneur should fix" : "Add an optional mentor comment"}
                            value={reviewRecommendation}
                            onChange={(event) => setReviewRecommendation(event.target.value)}
                            required={reviewDecision === "no"}
                          />
                          <button className="btn primary" type="submit">Save correction</button>
                        </form>
                      </>
                    ) : (
                      <p className="mentor-empty-note">This project is not linked to a tool review page yet.</p>
                    )}
                  </article>
                </div>
              </>
            ) : (
              <p className="mentor-empty-note">This entrepreneur does not have a project yet.</p>
            )}

            <div className="mentor-editor-grid mentor-editor-grid-single">
              <article className="mentor-editor-panel">
                <div className="mentor-card-head">
                  <div>
                    <h3>Delete entrepreneur</h3>
                    <p>Write why this entrepreneur should be deleted. Admin approval is required.</p>
                  </div>
                </div>

                <form className="form-stack" onSubmit={submitDeletionRequest}>
                  <textarea
                    rows="4"
                    placeholder="Explain why you are requesting the deletion"
                    value={deletionReason}
                    onChange={(event) => setDeletionReason(event.target.value)}
                    required
                  />
                  <button className="btn" type="submit">Send delete request</button>
                </form>

                {selectedDeletionRequest?.reason ? (
                  <p className="mentor-update-note">
                    Latest request: {selectedDeletionRequest.reason}
                  </p>
                ) : null}
              </article>
            </div>
          </section>
        ) : null}

        <section className="card mentor-editor-card">
          <div className="mentor-card-head">
            <div>
              <h3>Private screen records by group</h3>
              <p>Upload one lesson once and every registered entrepreneur in that group can access it.</p>
            </div>
          </div>

          {selectedGroup ? (
            <>
              {groups.length > 1 ? (
                <div className="form-stack">
                  <label htmlFor="mentor-group-select"><strong>Select group</strong></label>
                  <select
                    id="mentor-group-select"
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="mentor-editor-grid mentor-editor-grid-two">
                <article className="mentor-editor-panel">
                  <div className="mentor-card-head">
                    <div>
                      <h3>{selectedGroup.title}</h3>
                      <p>{selectedGroup.memberCount || 0} registered entrepreneurs</p>
                    </div>
                    <span className="mentor-group-badge">{(selectedGroup.lessons || []).length} lessons</span>
                  </div>

                  <form className="form-stack" onSubmit={uploadPrivateLesson}>
                    <input
                      placeholder="Screen record title"
                      value={lessonTitle}
                      onChange={(event) => setLessonTitle(event.target.value)}
                      required
                    />
                    <textarea
                      rows="3"
                      placeholder="What should entrepreneurs learn from this screen record?"
                      value={lessonDescription}
                      onChange={(event) => setLessonDescription(event.target.value)}
                    />
                    <input
                      type="file"
                      onChange={(event) => setLessonFile(event.target.files?.[0] || null)}
                      required
                    />
                    <button className="btn primary" type="submit">Upload to group</button>
                  </form>
                </article>

                <article className="mentor-editor-panel">
                  <div className="mentor-card-head">
                    <div>
                      <h3>Registered entrepreneurs</h3>
                      <p>These members will see the uploaded screen records.</p>
                    </div>
                  </div>
                  {selectedGroup.members?.length ? (
                    <div className="mentor-chip-row">
                      {selectedGroup.members.map((member) => (
                        <span key={`${selectedGroup.id}-${member.userId}`} className="mentor-chip">
                          {member.user?.name || member.userId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mentor-empty-note">No entrepreneurs registered in this group yet.</p>
                  )}

                  {(selectedGroup.lessons || []).length ? (
                    <div className="mentor-project-list">
                      {(selectedGroup.lessons || []).map((lesson, index) => (
                        <div key={`${selectedGroup.id}-lesson-${index}`} className="mentor-project-item">
                          <div className="mentor-project-head">
                            <strong>{lesson.title}</strong>
                            <span>{formatDateLabel(lesson.uploadedAt)}</span>
                          </div>
                          {lesson.content ? <p>{lesson.content}</p> : null}
                          <p>{lesson.videoUrl ? "Video lesson" : "Document lesson"}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              </div>
            </>
          ) : (
            <p className="mentor-empty-note">Create a group first to upload private screen records.</p>
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
      <section className="card page-hero tools-page-hero">
        <div className="tools-page-hero-head">
          <div>
            <div className="hero-kicker">Toolkit center</div>
            <h2>Tools</h2>
            <p>Browse every toolkit, jump into a step quickly, and keep your current progress visible.</p>
          </div>
          <Link className="btn primary" to={activeToolEntry ? `/app/tools/${activeToolEntry.tool.key}` : "/app/tools"}>
            Continue current tool
          </Link>
        </div>
        <div className="tools-page-stats">
          <article className="tools-page-stat">
            <span>Available tools</span>
            <strong>{toolStats.total}</strong>
          </article>
          <article className="tools-page-stat">
            <span>Started</span>
            <strong>{toolStats.started}</strong>
          </article>
          <article className="tools-page-stat">
            <span>Completed</span>
            <strong>{toolStats.completed}</strong>
          </article>
          <article className="tools-page-stat">
            <span>Total answers</span>
            <strong>{toolStats.totalAnswers}</strong>
          </article>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {groups.length ? (
        <section className="card">
          <div className="mentor-section-head">
            <div>
              <h3>Mentor uploads</h3>
              <p>Documents and videos shared by your mentor groups.</p>
            </div>
          </div>
          <div className="grid-2">
            {groups.map((item) => {
              const group = item.group || item;
              const lessons = group.lessons || [];

              return (
                <article key={group.id} className="tile">
                  <h3>{group.title}</h3>
                  {lessons.length === 0 ? <p>No uploads yet.</p> : null}
                  {lessons.map((lesson, index) => (
                    <div key={`${group.id}-upload-${index}`} className="module">
                      <p><strong>{lesson.title}</strong></p>
                      {lesson.content ? <p>{lesson.content}</p> : null}
                      {lesson.videoUrl ? (
                        <>
                          <video className="mentor-private-video" controls src={resolveMediaUrl(lesson.videoUrl)}></video>
                          <a href={resolveMediaUrl(lesson.videoUrl)} target="_blank" rel="noreferrer">Open video</a>
                        </>
                      ) : null}
                      {lesson.documentUrl ? (
                        <a href={resolveMediaUrl(lesson.documentUrl)} target="_blank" rel="noreferrer">Open document</a>
                      ) : null}
                    </div>
                  ))}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeToolEntry ? (
        <section className="tools-browser-shell tools-browser-shell-refined">
          <aside className="card tools-browser-sidebar">
            <div className="tools-browser-sidebar-head">
              <h3>Tools list</h3>
              <p>Switch toolkits from here, then use the workspace panel to jump to a step.</p>
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
                    <span>{progress.hasMentorCorrection ? progress.status : "Awaiting mentor correction"}</span>
                  </div>
                  <span className="tool-rail-percent">{getVisibleProgressLabel(progress)}</span>
                  {progress.hasMentorCorrection ? (
                    <span className={`correction-badge correction-badge-${getCorrectionStatus(progress.mentorReview)}`}>
                      {getCorrectionLabel(progress.mentorReview)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          <section className="tools-browser-main">
            <div className="card tools-browser-spotlight">
              <div className="tools-browser-main-head">
                <div>
                  <span className="tools-browser-eyebrow">Active toolkit</span>
                  <h3>{activeToolEntry.tool.title}</h3>
                  <p>{activeToolEntry.tool.description}</p>
                </div>
                <Link className="btn primary" to={`/app/tools/${activeToolEntry.tool.key}`}>
                  Open tool
                </Link>
              </div>

              <div className="tool-browser-main-meta">
                <span className="tool-percent-chip">
                  {activeToolEntry.progress.hasMentorCorrection
                    ? `${activeToolEntry.progress.reviewedPercent}% after mentor correction`
                    : "Pending mentor correction"}
                </span>
                {activeToolEntry.progress.hasMentorCorrection ? (
                  <span className={`correction-badge correction-badge-${getCorrectionStatus(activeToolEntry.progress.mentorReview)}`}>
                    {getCorrectionLabel(activeToolEntry.progress.mentorReview)}
                  </span>
                ) : null}
                <span className="tool-browser-status">
                  {activeToolEntry.progress.answeredCount}/{activeToolEntry.progress.totalCount} answers
                </span>
                <span className="tool-browser-status">
                  {activeToolEntry.steps.length} workflow steps
                </span>
              </div>

              <div className="progress-track" aria-hidden="true">
                <div
                  className="progress-fill"
                  style={{ width: `${activeToolEntry.progress.hasMentorCorrection ? activeToolEntry.progress.reviewedPercent : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="card tools-browser-quick-jump">
              <div>
                <h3>Quick jump</h3>
                <p>Open a specific page inside the current toolkit.</p>
              </div>
              <div className="tools-browser-chip-row">
                {activeToolEntry.steps.map((step) => (
                  <Link
                    key={step.id}
                    className="tools-browser-chip"
                    to={`/app/tools/${activeToolEntry.tool.key}?section=${step.items[0]?.sectionIndex || 0}`}
                  >
                    <span className="tools-browser-chip-count">{step.label}</span>
                    <strong className="tools-browser-chip-title">{step.title}</strong>
                  </Link>
                ))}
              </div>
            </div>

            <div className="tool-browser-step-list tool-browser-step-list-compact tools-browser-step-grid">
              {activeToolEntry.steps.map((step) => (
                <article key={step.id} className="tool-browser-step-card tool-browser-step-card-refined">
                  <div className="tool-browser-step-card-head">
                    <div>
                      <span className="tools-browser-step-number">{step.label}</span>
                      <strong>{step.title}</strong>
                    </div>
                    <span className="tool-browser-step-meta">{step.items.length} pages</span>
                  </div>

                  <p className="tools-browser-step-copy">
                    {step.items.length === 1
                      ? "A focused stage with one page to complete."
                      : `A guided stage with ${step.items.length} pages to work through.`}
                  </p>

                  <Link
                    className="tools-browser-step-cta"
                    to={`/app/tools/${activeToolEntry.tool.key}?section=${step.items[0]?.sectionIndex || 0}`}
                  >
                    Open first page
                  </Link>

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
                </article>
              ))}
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
}
