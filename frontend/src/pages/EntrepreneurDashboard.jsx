import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const DEFAULT_FORMS = {
  valueProposition: "",
  customerSegments: "",
  channels: "",
  revenueStreams: "",
  environmentalImpact: "",
  socialImpact: "",
  financialPlan: ""
};

export default function EntrepreneurDashboard() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [learning, setLearning] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");

  const [newProject, setNewProject] = useState({
    title: "",
    type: "BMC"
  });

  async function loadAll() {
    const [coursesRes, learningRes, projectsRes, sessionsRes] = await Promise.all([
      apiRequest("/courses", { token }),
      apiRequest("/courses/my/learning", { token }),
      apiRequest("/projects/my", { token }),
      apiRequest("/sessions/my", { token })
    ]);

    setCourses(coursesRes.courses || []);
    setLearning(learningRes.learning || []);
    setProjects(projectsRes.projects || []);
    setSessions(sessionsRes.sessions || []);
  }

  useEffect(() => {
    if (!token) return;
    loadAll().catch((err) => setMessage(err.message));
  }, [token]);

  async function enroll(courseId) {
    await apiRequest(`/courses/${courseId}/enroll`, { method: "POST", token });
    setMessage("Course enrolled.");
    await loadAll();
  }

  async function saveProgress(courseId, moduleIndexesText) {
    const modulesCompleted = moduleIndexesText
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n));

    await apiRequest(`/courses/${courseId}/progress`, {
      method: "POST",
      token,
      body: { modulesCompleted }
    });
    setMessage("Progress updated.");
    await loadAll();
  }

  async function createProject(e) {
    e.preventDefault();
    await apiRequest("/projects", {
      method: "POST",
      token,
      body: {
        title: newProject.title,
        type: newProject.type,
        stage: "idea",
        forms: DEFAULT_FORMS
      }
    });
    setNewProject({ title: "", type: "BMC" });
    setMessage("Project created.");
    await loadAll();
  }

  async function updateProjectForms(projectId, forms, submit = false) {
    await apiRequest(`/projects/${projectId}/forms`, {
      method: "PUT",
      token,
      body: { forms, submit }
    });
    setMessage(submit ? "Project submitted for review." : "Project draft updated.");
    await loadAll();
  }

  async function uploadDocument(projectId, file) {
    const formData = new FormData();
    formData.append("file", file);
    await apiRequest(`/projects/${projectId}/upload`, {
      method: "POST",
      token,
      body: formData,
      formData: true
    });
    setMessage("Document uploaded.");
    await loadAll();
  }

  return (
    <div className="dashboard-grid">
      {message ? <p className="info">{message}</p> : null}

      <section className="card span-2">
        <h2>Learning paths</h2>
        <p>Classic entrepreneurship and green entrepreneurship tracks.</p>
        <div className="grid-2">
          {courses.map((course) => (
            <article key={course.id} className="tile">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p><strong>Track:</strong> {course.track} | <strong>Level:</strong> {course.level}</p>
              <p><strong>Path:</strong> {course.learningPath}</p>
              {(course.modules || []).map((module, idx) => (
                <div key={`${course.id}-m-${idx}`} className="module">
                  <p>{idx + 1}. {module.title}</p>
                  {module.videoUrl ? <a href={module.videoUrl} target="_blank">Video</a> : null}
                  {module.documentUrl ? <a href={module.documentUrl} target="_blank">Download doc</a> : null}
                </div>
              ))}
              <button className="btn" onClick={() => enroll(course.id)}>Enroll</button>
            </article>
          ))}
        </div>
      </section>

      <section className="card span-2">
        <h2>My learning progress</h2>
        {learning.length === 0 ? <p>No enrolled courses yet.</p> : null}
        {learning.map((item) => (
          <LearningProgressCard key={item.enrollment.id} item={item} onSave={saveProgress} />
        ))}
      </section>

      <section className="card">
        <h2>Create project</h2>
        <form onSubmit={createProject} className="form-stack">
          <input placeholder="Project title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} required />
          <select value={newProject.type} onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}>
            <option value="BMC">Business Model Canvas</option>
            <option value="GREEN_BMC">Green BMC</option>
            <option value="GREEN_BUSINESS_PLAN">Green Business Plan</option>
          </select>
          <button className="btn primary">Create</button>
        </form>
      </section>

      <section className="card span-2">
        <h2>Project workspace</h2>
        {projects.length === 0 ? <p>No projects yet.</p> : null}
        {projects.map((project) => (
          <ProjectEditor key={project.id} project={project} onSave={updateProjectForms} onUpload={uploadDocument} />
        ))}
      </section>

      <section className="card">
        <h2>Mentoring sessions</h2>
        {sessions.length === 0 ? <p>No sessions scheduled.</p> : null}
        {sessions.map((session) => (
          <div key={session.id} className="tile">
            <p><strong>{session.topic}</strong></p>
            <p>{dayjs(session.startAt).format("YYYY-MM-DD HH:mm")} to {dayjs(session.endAt).format("HH:mm")}</p>
            <a href={session.meetingLink} target="_blank">Open meeting</a>
            <p>Status: <strong>{session.status}</strong></p>
          </div>
        ))}
      </section>
    </div>
  );
}

function LearningProgressCard({ item, onSave }) {
  const [raw, setRaw] = useState((item.enrollment.modulesCompleted || []).join(","));

  return (
    <article className="tile">
      <h3>{item.course.title}</h3>
      <p>Progress: {item.enrollment.progress || 0}%</p>
      <p>Completed module indexes (comma separated):</p>
      <div className="inline">
        <input value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="e.g. 0,1,2" />
        <button className="btn" onClick={() => onSave(item.course.id, raw)}>Save</button>
      </div>
    </article>
  );
}

function ProjectEditor({ project, onSave, onUpload }) {
  const [forms, setForms] = useState({ ...DEFAULT_FORMS, ...(project.forms || {}) });

  return (
    <article className="tile">
      <h3>{project.title}</h3>
      <p>Type: {project.type} | Stage: {project.stage} | Status: <strong>{project.status}</strong></p>
      <div className="form-stack">
        <textarea rows="2" placeholder="Value proposition" value={forms.valueProposition || ""} onChange={(e) => setForms({ ...forms, valueProposition: e.target.value })} />
        <textarea rows="2" placeholder="Customer segments" value={forms.customerSegments || ""} onChange={(e) => setForms({ ...forms, customerSegments: e.target.value })} />
        <textarea rows="2" placeholder="Channels" value={forms.channels || ""} onChange={(e) => setForms({ ...forms, channels: e.target.value })} />
        <textarea rows="2" placeholder="Revenue streams" value={forms.revenueStreams || ""} onChange={(e) => setForms({ ...forms, revenueStreams: e.target.value })} />
        <textarea rows="2" placeholder="Environmental sustainability impact" value={forms.environmentalImpact || ""} onChange={(e) => setForms({ ...forms, environmentalImpact: e.target.value })} />
        <textarea rows="2" placeholder="Social sustainability impact" value={forms.socialImpact || ""} onChange={(e) => setForms({ ...forms, socialImpact: e.target.value })} />
        <textarea rows="2" placeholder="Economic plan" value={forms.financialPlan || ""} onChange={(e) => setForms({ ...forms, financialPlan: e.target.value })} />
      </div>
      <div className="inline">
        <button className="btn" onClick={() => onSave(project.id, forms, false)}>Save draft</button>
        <button className="btn primary" onClick={() => onSave(project.id, forms, true)}>Submit</button>
      </div>
      <div className="inline">
        <input type="file" onChange={(e) => e.target.files[0] && onUpload(project.id, e.target.files[0])} />
      </div>
      {(project.feedback || []).length ? <p>Latest feedback: {(project.feedback || []).slice(-1)[0].detailedFeedback}</p> : null}
      {(project.recommendations || []).length ? <p>Latest recommendation: {(project.recommendations || []).slice(-1)[0].text}</p> : null}
    </article>
  );
}
