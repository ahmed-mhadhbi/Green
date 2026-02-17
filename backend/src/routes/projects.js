const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { admin, db } = require("../config/firebase");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "projects");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safe);
  }
});
const upload = multer({ storage });

const PROJECT_TYPES = ["BMC", "GREEN_BMC", "GREEN_BUSINESS_PLAN"];
const PROJECT_STAGES = ["idea", "creation", "growth"];
const PROJECT_STATUS = ["draft", "submitted", "needs_corrections", "validated"];

function canAccessProject(role, uid, project) {
  if (role === "admin") return true;
  if (role === "business_support") return true;
  if (role === "mentor") return !project.mentorId || project.mentorId === uid;
  return project.entrepreneurId === uid;
}

router.post("/", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const { title, type = "BMC", stage = "idea", mentorId = null, forms = {} } = req.body;

    if (!title) {
      const err = new Error("title is required");
      err.status = 400;
      throw err;
    }

    if (!PROJECT_TYPES.includes(type)) {
      const err = new Error(`Invalid type. Allowed: ${PROJECT_TYPES.join(", ")}`);
      err.status = 400;
      throw err;
    }

    const payload = {
      title,
      type,
      stage: PROJECT_STAGES.includes(stage) ? stage : "idea",
      status: "draft",
      entrepreneurId: req.user.uid,
      mentorId,
      forms,
      documents: [],
      feedback: [],
      recommendations: [],
      iterations: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await db().collection("projects").add(payload);
    const saved = (await ref.get()).data();

    res.status(201).json({ project: { id: ref.id, ...saved } });
  } catch (error) {
    next(error);
  }
});

router.get("/my", authMiddleware, async (req, res, next) => {
  try {
    const role = req.userProfile.role;
    let snap;

    if (role === "entrepreneur") {
      snap = await db().collection("projects").where("entrepreneurId", "==", req.user.uid).get();
    } else if (role === "mentor") {
      snap = await db().collection("projects").get();
    } else {
      snap = await db().collection("projects").get();
    }

    const projects = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((p) => canAccessProject(role, req.user.uid, p));

    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

router.get("/:projectId", authMiddleware, async (req, res, next) => {
  try {
    const ref = db().collection("projects").doc(req.params.projectId);
    const snap = await ref.get();

    if (!snap.exists) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }

    const project = { id: snap.id, ...snap.data() };
    if (!canAccessProject(req.userProfile.role, req.user.uid, project)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
});

router.put("/:projectId/forms", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const ref = db().collection("projects").doc(req.params.projectId);
    const snap = await ref.get();

    if (!snap.exists) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }

    const project = snap.data();
    if (project.entrepreneurId !== req.user.uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const updates = {
      forms: req.body.forms || project.forms || {},
      status: req.body.submit ? "submitted" : project.status || "draft",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      iterations: [
        ...(project.iterations || []),
        {
          action: req.body.submit ? "submitted" : "updated_forms",
          at: new Date().toISOString(),
          by: req.user.uid
        }
      ]
    };

    await ref.update(updates);
    const updated = (await ref.get()).data();

    res.json({ project: { id: req.params.projectId, ...updated } });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/upload", authMiddleware, requireRole("entrepreneur"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error("file is required");
      err.status = 400;
      throw err;
    }

    const ref = db().collection("projects").doc(req.params.projectId);
    const snap = await ref.get();

    if (!snap.exists) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }

    const project = snap.data();
    if (project.entrepreneurId !== req.user.uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const document = {
      name: req.file.originalname,
      fileName: req.file.filename,
      path: `/uploads/projects/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    await ref.update({
      documents: [...(project.documents || []), document],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/feedback", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const { detailedFeedback, requestCorrections = false } = req.body;
    const ref = db().collection("projects").doc(req.params.projectId);
    const snap = await ref.get();

    if (!snap.exists) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }

    const project = snap.data();
    if (!canAccessProject(req.userProfile.role, req.user.uid, project)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const feedbackItem = {
      detailedFeedback: detailedFeedback || "",
      requestCorrections,
      by: req.user.uid,
      at: new Date().toISOString()
    };

    await ref.update({
      feedback: [...(project.feedback || []), feedbackItem],
      status: requestCorrections ? "needs_corrections" : project.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      iterations: [
        ...(project.iterations || []),
        {
          action: requestCorrections ? "requested_corrections" : "feedback_added",
          at: new Date().toISOString(),
          by: req.user.uid
        }
      ]
    });

    const updated = (await ref.get()).data();
    res.json({ project: { id: req.params.projectId, ...updated } });
  } catch (error) {
    next(error);
  }
});

router.post("/:projectId/validate", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const { status = "validated", stage, recommendation } = req.body;

    if (!PROJECT_STATUS.includes(status)) {
      const err = new Error(`Invalid status. Allowed: ${PROJECT_STATUS.join(", ")}`);
      err.status = 400;
      throw err;
    }

    if (stage && !PROJECT_STAGES.includes(stage)) {
      const err = new Error(`Invalid stage. Allowed: ${PROJECT_STAGES.join(", ")}`);
      err.status = 400;
      throw err;
    }

    const ref = db().collection("projects").doc(req.params.projectId);
    const snap = await ref.get();
    if (!snap.exists) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }

    const project = snap.data();
    if (!canAccessProject(req.userProfile.role, req.user.uid, project)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const recommendations = recommendation
      ? [...(project.recommendations || []), { text: recommendation, by: req.user.uid, at: new Date().toISOString() }]
      : (project.recommendations || []);

    await ref.update({
      status,
      stage: stage || project.stage,
      recommendations,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      iterations: [
        ...(project.iterations || []),
        { action: `status_${status}`, at: new Date().toISOString(), by: req.user.uid }
      ]
    });

    const updated = (await ref.get()).data();
    res.json({ project: { id: req.params.projectId, ...updated } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
