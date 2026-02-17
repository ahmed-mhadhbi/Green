import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BusinessSupportDashboard() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");

  async function loadAll() {
    const [coursesRes, projectsRes, sessionsRes] = await Promise.all([
      apiRequest("/courses", { token }),
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

  return (
    <div className="dashboard-grid">
      {message ? <p className="info">{message}</p> : null}

      <section className="card span-2">
        <h2>Business support dashboard</h2>
        <p>View ecosystem learning content, entrepreneur projects, and mentoring sessions.</p>
      </section>

      <section className="card">
        <h2>Courses library</h2>
        <p>Total courses: <strong>{courses.length}</strong></p>
        {courses.slice(0, 6).map((course) => (
          <article className="tile" key={course.id}>
            <h3>{course.title}</h3>
            <p>{course.track} | {course.level}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <h2>Project portfolio</h2>
        <p>Total projects: <strong>{projects.length}</strong></p>
        {projects.slice(0, 6).map((project) => (
          <article className="tile" key={project.id}>
            <h3>{project.title}</h3>
            <p>Type: {project.type}</p>
            <p>Status: <strong>{project.status}</strong></p>
          </article>
        ))}
      </section>

      <section className="card span-2">
        <h2>Mentoring sessions snapshot</h2>
        {sessions.length === 0 ? <p>No sessions available.</p> : null}
        <div className="grid-2">
          {sessions.slice(0, 8).map((session) => (
            <article className="tile" key={session.id}>
              <h3>{session.topic}</h3>
              <p>{dayjs(session.startAt).format("YYYY-MM-DD HH:mm")}</p>
              <p>Status: {session.status}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
