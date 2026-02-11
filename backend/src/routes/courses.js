const express = require("express");
const { admin, db } = require("../config/firebase");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    let query = db().collection("courses").orderBy("createdAt", "desc");
    const { track, level } = req.query;

    if (track) query = query.where("track", "==", track);
    if (level) query = query.where("level", "==", level);

    const snap = await query.get();
    const courses = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const { title, description, track, level, modules = [], learningPath = "classic" } = req.body;
    if (!title) {
      const err = new Error("title is required");
      err.status = 400;
      throw err;
    }

    const payload = {
      title,
      description: description || "",
      track: track || "general",
      level: level || "beginner",
      learningPath,
      modules,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await db().collection("courses").add(payload);
    const saved = (await ref.get()).data();
    res.status(201).json({ course: { id: ref.id, ...saved } });
  } catch (error) {
    next(error);
  }
});

router.put("/:courseId", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const ref = db().collection("courses").doc(req.params.courseId);
    const snap = await ref.get();
    if (!snap.exists) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }

    const existing = snap.data();
    if (req.userProfile.role === "mentor" && existing.createdBy !== req.user.uid) {
      const err = new Error("Mentor can only edit own courses");
      err.status = 403;
      throw err;
    }

    const allowed = ["title", "description", "track", "level", "learningPath", "modules"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await ref.update(updates);
    const updated = (await ref.get()).data();

    res.json({ course: { id: ref.id, ...updated } });
  } catch (error) {
    next(error);
  }
});

router.post("/:courseId/enroll", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const courseRef = db().collection("courses").doc(courseId);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }

    const enrollmentId = `${req.user.uid}_${courseId}`;
    const enrollmentRef = db().collection("enrollments").doc(enrollmentId);

    await enrollmentRef.set({
      userId: req.user.uid,
      courseId,
      modulesCompleted: [],
      progress: 0,
      quizScores: [],
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ message: "Enrolled successfully" });
  } catch (error) {
    next(error);
  }
});

router.get("/my/learning", authMiddleware, async (req, res, next) => {
  try {
    if (req.userProfile.role === "entrepreneur") {
      const enrollSnap = await db().collection("enrollments").where("userId", "==", req.user.uid).get();
      const enrollments = enrollSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const courses = [];
      for (const enrollment of enrollments) {
        const courseSnap = await db().collection("courses").doc(enrollment.courseId).get();
        if (courseSnap.exists) {
          courses.push({
            enrollment,
            course: { id: courseSnap.id, ...courseSnap.data() }
          });
        }
      }

      return res.json({ learning: courses });
    }

    if (req.userProfile.role === "mentor") {
      const coursesSnap = await db().collection("courses").where("createdBy", "==", req.user.uid).get();
      const courses = coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.json({ courses });
    }

    const coursesSnap = await db().collection("courses").get();
    const courses = coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ courses });
  } catch (error) {
    next(error);
  }
});

router.post("/:courseId/progress", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { modulesCompleted = [] } = req.body;

    const courseSnap = await db().collection("courses").doc(courseId).get();
    if (!courseSnap.exists) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }

    const moduleCount = Math.max((courseSnap.data().modules || []).length, 1);
    const progress = Math.min(100, Math.round((modulesCompleted.length / moduleCount) * 100));

    const enrollmentId = `${req.user.uid}_${courseId}`;
    const enrollmentRef = db().collection("enrollments").doc(enrollmentId);

    await enrollmentRef.set({
      userId: req.user.uid,
      courseId,
      modulesCompleted,
      progress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const updated = (await enrollmentRef.get()).data();
    res.json({ enrollment: { id: enrollmentId, ...updated } });
  } catch (error) {
    next(error);
  }
});

router.post("/:courseId/quiz/submit", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const { moduleIndex = 0, answers = [] } = req.body;
    const courseSnap = await db().collection("courses").doc(req.params.courseId).get();
    if (!courseSnap.exists) {
      const err = new Error("Course not found");
      err.status = 404;
      throw err;
    }

    const course = courseSnap.data();
    const module = (course.modules || [])[moduleIndex];
    if (!module || !Array.isArray(module.quiz)) {
      const err = new Error("Module quiz not found");
      err.status = 404;
      throw err;
    }

    let correct = 0;
    module.quiz.forEach((q, idx) => {
      if (answers[idx] !== undefined && Number(answers[idx]) === Number(q.answerIndex)) {
        correct += 1;
      }
    });

    const total = module.quiz.length || 1;
    const score = Math.round((correct / total) * 100);

    const enrollmentId = `${req.user.uid}_${req.params.courseId}`;
    const enrollmentRef = db().collection("enrollments").doc(enrollmentId);
    const snap = await enrollmentRef.get();
    const prev = snap.exists ? snap.data() : { quizScores: [] };

    const quizScores = [...(prev.quizScores || []).filter((s) => s.moduleIndex !== moduleIndex), {
      moduleIndex,
      score,
      submittedAt: new Date().toISOString()
    }];

    await enrollmentRef.set({
      userId: req.user.uid,
      courseId: req.params.courseId,
      quizScores,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ score, correct, total });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
