const express = require("express");
const { admin, db } = require("../config/firebase");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

async function deleteSnapshotDocs(snapshot) {
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}

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

router.get("/deletion-requests", async (_req, res, next) => {
  try {
    const snap = await db().collection("entrepreneurDeletionRequests").get();
    const requests = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

router.patch("/deletion-requests/:requestId", async (req, res, next) => {
  try {
    const { status, decisionComment = "" } = req.body;
    const allowed = ["approved", "rejected"];

    if (!allowed.includes(status)) {
      const err = new Error(`Invalid status. Allowed: ${allowed.join(", ")}`);
      err.status = 400;
      throw err;
    }

    const ref = db().collection("entrepreneurDeletionRequests").doc(req.params.requestId);
    const snap = await ref.get();

    if (!snap.exists) {
      const err = new Error("Deletion request not found");
      err.status = 404;
      throw err;
    }

    const request = snap.data();

    if (status === "approved") {
      const entrepreneurId = request.entrepreneurId;
      const [projectsSnap, membershipsSnap, sessionsSnap, enrollmentsSnap] = await Promise.all([
        db().collection("projects").where("entrepreneurId", "==", entrepreneurId).get(),
        db().collection("groupMembers").where("userId", "==", entrepreneurId).get(),
        db().collection("sessions").where("entrepreneurId", "==", entrepreneurId).get(),
        db().collection("enrollments").where("userId", "==", entrepreneurId).get()
      ]);

      await Promise.all([
        deleteSnapshotDocs(projectsSnap),
        deleteSnapshotDocs(membershipsSnap),
        deleteSnapshotDocs(sessionsSnap),
        deleteSnapshotDocs(enrollmentsSnap),
        db().collection("users").doc(entrepreneurId).delete()
      ]);

      try {
        await admin.auth().deleteUser(entrepreneurId);
      } catch (error) {
        if (error?.code !== "auth/user-not-found") {
          throw error;
        }
      }
    }

    await ref.set({
      status,
      decisionComment: String(decisionComment || "").trim(),
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const updated = (await ref.get()).data();
    res.json({ request: { id: req.params.requestId, ...updated } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
