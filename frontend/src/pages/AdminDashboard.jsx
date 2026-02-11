import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");

  async function loadAll() {
    const [overviewRes, usersRes, coursesRes, projectsRes] = await Promise.all([
      apiRequest("/admin/overview", { token }),
      apiRequest("/admin/users", { token }),
      apiRequest("/admin/courses", { token }),
      apiRequest("/admin/projects", { token })
    ]);

    setOverview(overviewRes.totals);
    setUsers(usersRes.users || []);
    setCourses(coursesRes.courses || []);
    setProjects(projectsRes.projects || []);
  }

  useEffect(() => {
    if (!token) return;
    loadAll().catch((err) => setMessage(err.message));
  }, [token]);

  async function changeRole(uid, role) {
    await apiRequest(`/admin/users/${uid}/role`, {
      method: "PATCH",
      token,
      body: { role }
    });
    setMessage("Role updated.");
    await loadAll();
  }

  return (
    <div className="dashboard-grid">
      {message ? <p className="info">{message}</p> : null}

      <section className="card span-2">
        <h2>Platform overview</h2>
        <div className="stats">
          <div className="stat"><p>Users</p><strong>{overview?.users ?? 0}</strong></div>
          <div className="stat"><p>Courses</p><strong>{overview?.courses ?? 0}</strong></div>
          <div className="stat"><p>Projects</p><strong>{overview?.projects ?? 0}</strong></div>
          <div className="stat"><p>Sessions</p><strong>{overview?.sessions ?? 0}</strong></div>
        </div>
      </section>

      <section className="card span-2">
        <h2>User management</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="inline">
                      <button className="btn" onClick={() => changeRole(user.id, "entrepreneur")}>Entrepreneur</button>
                      <button className="btn" onClick={() => changeRole(user.id, "mentor")}>Mentor</button>
                      <button className="btn" onClick={() => changeRole(user.id, "admin")}>Admin</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Courses</h2>
        {courses.map((course) => (
          <div className="tile" key={course.id}>
            <strong>{course.title}</strong>
            <p>{course.track} | {course.level}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Projects</h2>
        {projects.map((project) => (
          <div className="tile" key={project.id}>
            <strong>{project.title}</strong>
            <p>{project.type}</p>
            <p>Status: {project.status}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
