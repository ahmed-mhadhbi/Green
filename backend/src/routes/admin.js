const express = require("express");
const { admin, db } = require("../config/firebase");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/overview", async (_req, res, next) => {
  try {
    const [users, courses, projects, sessions] = await Promise.all([
      db().collection("users").count().get(),
      db().collection("courses").count().get(),
      db().collection("projects").count().get(),
      db().collection("sessions").count().get()
    ]);

    res.json({
      totals: {
        users: users.data().count,
        courses: courses.data().count,
        projects: projects.data().count,
        sessions: sessions.data().count
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    const snap = await db().collection("users").get();
    const users = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:uid/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ["entrepreneur", "mentor", "business_support", "admin"];
    if (!allowed.includes(role)) {
      const err = new Error(`Invalid role. Allowed: ${allowed.join(", ")}`);
      err.status = 400;
      throw err;
    }

    const ref = db().collection("users").doc(req.params.uid);
    await ref.set({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const user = (await ref.get()).data();
    res.json({ user: { id: req.params.uid, ...user } });
  } catch (error) {
    next(error);
  }
});

router.get("/courses", async (_req, res, next) => {
  try {
    const snap = await db().collection("courses").orderBy("createdAt", "desc").get();
    const courses = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

router.get("/projects", async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = db().collection("projects");
    if (status) query = query.where("status", "==", status);
    const snap = await query.get();
    const projects = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
