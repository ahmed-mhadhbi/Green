import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const sampleModuleTemplate = `[
  {
    "title": "Sustainable Value Proposition",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "documentUrl": "",
    "quiz": [
      {
        "question": "Which pillar is part of sustainability?",
        "options": ["Economic", "Random", "None"],
        "answerIndex": 0
      }
    ]
  }
]`;

export default function MentorDashboard() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    track: "green",
    level: "beginner",
    learningPath: "green",
    modulesRaw: sampleModuleTemplate
  });

  const [sessionForm, setSessionForm] = useState({
    entrepreneurId: "",
    topic: "",
    startAt: "",
    endAt: "",
    meetingLink: ""
  });

  async function loadAll() {
    const [coursesRes, projectsRes, sessionsRes] = await Promise.all([
      apiRequest("/courses/my/learning", { token }),
      apiRequest("/projects/my", { token }),
      apiRequest("/sessions/my", { token })
    ]);

    setCourses(coursesRes.courses || []);
    setProjects(projectsRes.projects || []);
    setSessions(sessionsRes.sessions || []);
  }

  useEffect(() => {
    if (!token) return;
    loadAll().catch((err) => setMessage(err.message));
  }, [token]);

  async function createCourse(e) {
    e.preventDefault();
    const modules = JSON.parse(courseForm.modulesRaw || "[]");

    await apiRequest("/courses", {
      method: "POST",
      token,
      body: {
        title: courseForm.title,
        description: courseForm.description,
        track: courseForm.track,
        level: courseForm.level,
        learningPath: courseForm.learningPath,
        modules
      }
    });

    setMessage("Course created.");
    setCourseForm({ ...courseForm, title: "", description: "" });
    await loadAll();
  }

  async function addFeedback(projectId, requestCorrections) {
    const detailedFeedback = window.prompt("Detailed mentor feedback:", "Improve customer validation and impact metrics.");
    if (detailedFeedback == null) return;

    await apiRequest(`/projects/${projectId}/feedback`, {
      method: "POST",
      token,
      body: { detailedFeedback, requestCorrections }
    });
    setMessage("Feedback submitted.");
    await loadAll();
  }

  async function validateProject(projectId) {
    const recommendation = window.prompt("Strategic recommendation:", "Strengthen lifecycle assessment and partnerships.");
    await apiRequest(`/projects/${projectId}/validate`, {
      method: "POST",
      token,
      body: { status: "validated", recommendation, stage: "creation" }
    });
    setMessage("Project validated.");
    await loadAll();
  }

  async function scheduleSession(e) {
    e.preventDefault();

    await apiRequest("/sessions", {
      method: "POST",
      token,
      body: sessionForm
    });

    setMessage("Session scheduled.");
    setSessionForm({ entrepreneurId: "", topic: "", startAt: "", endAt: "", meetingLink: "" });
    await loadAll();
  }

  async function updateSessionStatus(id, status) {
    await apiRequest(`/sessions/${id}`, { method: "PATCH", token, body: { status } });
    setMessage("Session updated.");
    await loadAll();
  }

  return (
    <div className="dashboard-grid">
      {message ? <p className="info">{message}</p> : null}

      <section className="card span-2">
        <h2>Create and manage courses</h2>
        <form className="form-stack" onSubmit={createCourse}>
          <input placeholder="Course title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
          <textarea rows="2" placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
          <div className="inline">
            <select value={courseForm.track} onChange={(e) => setCourseForm({ ...courseForm, track: e.target.value })}>
              <option value="classic">classic</option>
              <option value="green">green</option>
            </select>
            <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
            <select value={courseForm.learningPath} onChange={(e) => setCourseForm({ ...courseForm, learningPath: e.target.value })}>
              <option value="classic">classic</option>
              <option value="green">green</option>
            </select>
          </div>
          <textarea rows="8" value={courseForm.modulesRaw} onChange={(e) => setCourseForm({ ...courseForm, modulesRaw: e.target.value })} />
          <button className="btn primary">Create course</button>
        </form>

        <div className="grid-2">
          {courses.map((course) => (
            <article key={course.id} className="tile">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>{course.track} | {course.level} | {course.learningPath}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card span-2">
        <h2>Project evaluation workflow</h2>
        {projects.length === 0 ? <p>No projects assigned yet.</p> : null}
        <div className="grid-2">
          {projects.map((project) => (
            <article className="tile" key={project.id}>
              <h3>{project.title}</h3>
              <p>Type: {project.type}</p>
              <p>Stage: {project.stage} | Status: <strong>{project.status}</strong></p>
              <p>Entrepreneur ID: {project.entrepreneurId}</p>
              <p>Last update: {project.updatedAt?.toDate ? dayjs(project.updatedAt.toDate()).format("YYYY-MM-DD") : "-"}</p>
              <div className="inline">
                <button className="btn" onClick={() => addFeedback(project.id, true)}>Request corrections</button>
                <button className="btn" onClick={() => addFeedback(project.id, false)}>Add feedback</button>
                <button className="btn primary" onClick={() => validateProject(project.id)}>Validate</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Schedule mentoring session</h2>
        <form className="form-stack" onSubmit={scheduleSession}>
          <input placeholder="Entrepreneur UID" value={sessionForm.entrepreneurId} onChange={(e) => setSessionForm({ ...sessionForm, entrepreneurId: e.target.value })} required />
          <input placeholder="Session topic" value={sessionForm.topic} onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })} required />
          <input type="datetime-local" value={sessionForm.startAt} onChange={(e) => setSessionForm({ ...sessionForm, startAt: e.target.value })} required />
          <input type="datetime-local" value={sessionForm.endAt} onChange={(e) => setSessionForm({ ...sessionForm, endAt: e.target.value })} required />
          <input placeholder="Meeting link (Jitsi/Google Meet)" value={sessionForm.meetingLink} onChange={(e) => setSessionForm({ ...sessionForm, meetingLink: e.target.value })} required />
          <button className="btn primary">Schedule</button>
        </form>
      </section>

      <section className="card">
        <h2>Session history</h2>
        {sessions.length === 0 ? <p>No sessions yet.</p> : null}
        {sessions.map((session) => (
          <article className="tile" key={session.id}>
            <p><strong>{session.topic}</strong></p>
            <p>{dayjs(session.startAt).format("YYYY-MM-DD HH:mm")}</p>
            <a href={session.meetingLink} target="_blank">Open link</a>
            <p>Status: {session.status}</p>
            <div className="inline">
              <button className="btn" onClick={() => updateSessionStatus(session.id, "completed")}>Complete</button>
              <button className="btn" onClick={() => updateSessionStatus(session.id, "cancelled")}>Cancel</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
