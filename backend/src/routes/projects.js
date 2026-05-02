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
const privateLessonUploadDir = path.join(process.cwd(), "uploads", "private-lessons");
fs.mkdirSync(privateLessonUploadDir, { recursive: true });

function buildSafeFilename(file) {
  return `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, buildSafeFilename(file))
});
const upload = multer({ storage });
const privateLessonStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, privateLessonUploadDir),
  filename: (_req, file, cb) => cb(null, buildSafeFilename(file))
});
const privateLessonUpload = multer({ storage: privateLessonStorage });

const PROJECT_TYPES = ["BMC", "GREEN_BMC", "GREEN_BUSINESS_PLAN"];
const PROJECT_STAGES = ["idea", "creation", "growth"];
const PROJECT_STATUS = ["draft", "submitted", "needs_corrections", "validated"];

function canAccessProject(role, uid, project, options = {}) {
  if (role === "admin") return true;
  if (role === "business_support") return true;
  if (role === "mentor") {
    if (project.mentorId === uid) return true;
    return !project.mentorId && options.mentorEntrepreneurIds?.has(project.entrepreneurId);
  }
  return project.entrepreneurId === uid;
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function sanitizeAnswerReviews(answerReviews = {}) {
  if (!answerReviews || typeof answerReviews !== "object" || Array.isArray(answerReviews)) {
    return {};
  }

  return Object.entries(answerReviews).reduce((acc, [questionId, review]) => {
    const status = review?.status === "no" ? "no" : review?.status === "yes" ? "yes" : "";
    if (!status) return acc;

    acc[questionId] = {
      status,
      comment: sanitizeText(review?.comment),
      reviewedAt: new Date().toISOString()
    };
    return acc;
  }, {});
}

function hasAnswerReviewStatus(review) {
  return review?.status === "yes" || review?.status === "no";
}

function calculateReviewProgress(answerReviews = {}, totalCountValue) {
  const reviewedCount = Object.values(answerReviews).filter(hasAnswerReviewStatus).length;
  const requestedTotalCount = Number(totalCountValue);
  const totalCount = Number.isFinite(requestedTotalCount) && requestedTotalCount > 0
    ? requestedTotalCount
    : reviewedCount;
  const clampedReviewedCount = Math.min(reviewedCount, totalCount);
  const progressPercent = totalCount > 0 ? Math.round((clampedReviewedCount / totalCount) * 100) : 0;

  return {
    reviewedCount: clampedReviewedCount,
    totalCount,
    progressPercent
  };
}

async function loadMentorEntrepreneurLinks(mentorId, entrepreneurId) {
  const [projectSnap, membershipSnap] = await Promise.all([
    db().collection("projects").where("entrepreneurId", "==", entrepreneurId).get(),
    db().collection("groupMembers").where("userId", "==", entrepreneurId).get()
  ]);

  const accessibleProjects = projectSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((project) => canAccessProject("mentor", mentorId, project));

  const groupIds = membershipSnap.docs.map((doc) => doc.data().groupId).filter(Boolean);
  const groupDocs = await Promise.all(
    [...new Set(groupIds)].map((groupId) => db().collection("mentorGroups").doc(groupId).get())
  );
  const accessibleGroups = groupDocs
    .filter((doc) => doc.exists)
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((group) => group.mentorId === mentorId);

  return {
    accessibleProjects,
    accessibleGroups
  };
}

async function loadMentorEntrepreneurIds(mentorId) {
  const groupSnap = await db().collection("mentorGroups").where("mentorId", "==", mentorId).get();
  if (groupSnap.empty) return new Set();

  const memberSnaps = await Promise.all(
    groupSnap.docs.map((groupDoc) => (
      db().collection("groupMembers").where("groupId", "==", groupDoc.id).get()
    ))
  );

  return new Set(
    memberSnaps
      .flatMap((snap) => snap.docs.map((doc) => doc.data().userId))
      .filter(Boolean)
  );
}

async function canAccessProjectAsync(role, uid, project) {
  if (role !== "mentor") return canAccessProject(role, uid, project);
  if (project.mentorId === uid) return true;
  if (project.mentorId) return false;

  const mentorEntrepreneurIds = await loadMentorEntrepreneurIds(uid);
  return canAccessProject(role, uid, project, { mentorEntrepreneurIds });
}

async function loadUserProfilesByIds(userIds = []) {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const docs = await Promise.all(
    uniqueIds.map((uid) => db().collection("users").doc(uid).get())
  );

  return docs.reduce((acc, doc) => {
    if (doc.exists) acc[doc.id] = doc.data();
    return acc;
  }, {});
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
      mentorToolReviews: {},
      privateLessons: [],
      toolActivity: {},
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

    const mentorEntrepreneurIds = role === "mentor" ? await loadMentorEntrepreneurIds(req.user.uid) : null;
    const projects = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((p) => canAccessProject(role, req.user.uid, p, { mentorEntrepreneurIds }));

    const profileById = await loadUserProfilesByIds(projects.map((project) => project.entrepreneurId));
    const enrichedProjects = projects.map((project) => {
      const entrepreneurProfile = profileById[project.entrepreneurId] || null;

      return {
        ...project,
        entrepreneurName: entrepreneurProfile?.name || "",
        entrepreneurEmail: entrepreneurProfile?.email || "",
        entrepreneurProfile
      };
    });

    res.json({ projects: enrichedProjects });
  } catch (error) {
    next(error);
  }
});

router.get("/deletion-requests/my", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    let query = db().collection("entrepreneurDeletionRequests");
    if (req.userProfile.role === "mentor") {
      query = query.where("mentorId", "==", req.user.uid);
    }

    const snap = await query.get();
    const requests = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

router.post("/entrepreneurs/:entrepreneurId/delete-request", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const entrepreneurId = req.params.entrepreneurId;
    const reason = sanitizeText(req.body.reason);

    if (!reason) {
      const err = new Error("reason is required");
      err.status = 400;
      throw err;
    }

    const entrepreneurSnap = await db().collection("users").doc(entrepreneurId).get();
    if (!entrepreneurSnap.exists) {
      const err = new Error("Entrepreneur not found");
      err.status = 404;
      throw err;
    }

    const entrepreneur = entrepreneurSnap.data();
    if (entrepreneur.role !== "entrepreneur") {
      const err = new Error("Selected user is not an entrepreneur");
      err.status = 400;
      throw err;
    }

    let links = { accessibleProjects: [], accessibleGroups: [] };
    if (req.userProfile.role === "mentor") {
      links = await loadMentorEntrepreneurLinks(req.user.uid, entrepreneurId);
      if (links.accessibleProjects.length === 0 && links.accessibleGroups.length === 0) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
      }
    }

    const requestId = `${req.user.uid}_${entrepreneurId}`;
    const requestRef = db().collection("entrepreneurDeletionRequests").doc(requestId);

    await requestRef.set({
      entrepreneurId,
      entrepreneurName: entrepreneur.name || "",
      entrepreneurEmail: entrepreneur.email || "",
      mentorId: req.user.uid,
      mentorName: req.userProfile?.name || "",
      reason,
      status: "pending",
      projectIds: links.accessibleProjects.map((project) => project.id),
      groupIds: links.accessibleGroups.map((group) => group.id),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      decisionComment: ""
    }, { merge: true });

    const saved = (await requestRef.get()).data();
    res.status(201).json({ request: { id: requestId, ...saved } });
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
    if (!(await canAccessProjectAsync(req.userProfile.role, req.user.uid, project))) {
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

router.post("/:projectId/tool-activity", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const {
      toolKey,
      sectionIndex = 0,
      progressPercent,
      answeredCount,
      totalCount
    } = req.body;
    const normalizedToolKey = sanitizeText(toolKey);

    if (!normalizedToolKey) {
      const err = new Error("toolKey is required");
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

    const toolActivityUpdate = {
      lastOpenedAt: new Date().toISOString(),
      lastSectionIndex: Number.isFinite(Number(sectionIndex)) ? Number(sectionIndex) : 0,
      openedBy: req.user.uid
    };
    if (Number.isFinite(Number(progressPercent))) toolActivityUpdate.progressPercent = Number(progressPercent);
    if (Number.isFinite(Number(answeredCount))) toolActivityUpdate.answeredCount = Number(answeredCount);
    if (Number.isFinite(Number(totalCount))) toolActivityUpdate.totalCount = Number(totalCount);

    await ref.update({
      [`toolActivity.${normalizedToolKey}`]: toolActivityUpdate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

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

router.post("/:projectId/private-lessons", authMiddleware, requireRole("mentor", "admin"), privateLessonUpload.single("file"), async (req, res, next) => {
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
    if (!(await canAccessProjectAsync(req.userProfile.role, req.user.uid, project))) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const lesson = {
      id: `${Date.now()}`,
      title: sanitizeText(req.body.title) || req.file.originalname,
      description: sanitizeText(req.body.description),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype || "",
      path: `/uploads/private-lessons/${req.file.filename}`,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid
    };

    await ref.update({
      privateLessons: [...(project.privateLessons || []), lesson],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      iterations: [
        ...(project.iterations || []),
        {
          action: "private_lesson_uploaded",
          at: new Date().toISOString(),
          by: req.user.uid
        }
      ]
    });

    res.status(201).json({ lesson });
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
    if (!(await canAccessProjectAsync(req.userProfile.role, req.user.uid, project))) {
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
    if (!(await canAccessProjectAsync(req.userProfile.role, req.user.uid, project))) {
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

router.post("/:projectId/tool-review", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const toolKey = sanitizeText(req.body.toolKey);
    const recommendation = sanitizeText(req.body.recommendation);
    const comment = sanitizeText(req.body.comment || recommendation);
    const answerReviewsPatch = sanitizeAnswerReviews(req.body.answerReviews);
    const corrected = req.body.corrected === undefined
      ? req.body.verified !== false
      : Boolean(req.body.corrected);
    const answeredCount = Number(req.body.answeredCount);
    const totalCount = Number(req.body.totalCount);

    if (!toolKey) {
      const err = new Error("toolKey is required");
      err.status = 400;
      throw err;
    }

    const missingAnswerComment = Object.entries(answerReviewsPatch).find(([, review]) => (
      review.status === "no" && !review.comment
    ));
    if (missingAnswerComment) {
      const err = new Error("comment is required when an answer is marked no");
      err.status = 400;
      throw err;
    }

    if (!corrected && !comment && Object.keys(answerReviewsPatch).length === 0) {
      const err = new Error("comment is required when answers are marked no");
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
    if (!(await canAccessProjectAsync(req.userProfile.role, req.user.uid, project))) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const existingReview = project.mentorToolReviews?.[toolKey] || {};
    const answerReviews = {
      ...(existingReview.answerReviews || {}),
      ...answerReviewsPatch
    };
    const hasAnswerReviewNo = Object.values(answerReviews).some((reviewItem) => reviewItem?.status === "no");
    const finalCorrected = Object.keys(answerReviews).length > 0 ? !hasAnswerReviewNo : corrected;
    const reviewProgress = calculateReviewProgress(answerReviews, totalCount);

    const review = {
      toolKey,
      corrected: finalCorrected,
      correctionStatus: finalCorrected ? "yes" : "no",
      verified: finalCorrected,
      recommendation: recommendation || existingReview.recommendation || "",
      comment: comment || existingReview.comment || "",
      answerReviews,
      progressPercent: reviewProgress.progressPercent,
      reviewedCount: reviewProgress.reviewedCount,
      answeredCount: Number.isFinite(answeredCount) ? answeredCount : null,
      totalCount: reviewProgress.totalCount,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.uid
    };

    await ref.update({
      [`mentorToolReviews.${toolKey}`]: review,
      status: finalCorrected ? project.status : "needs_corrections",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      iterations: [
        ...(project.iterations || []),
        {
          action: finalCorrected ? `tool_corrected_yes_${toolKey}` : `tool_corrected_no_${toolKey}`,
          at: new Date().toISOString(),
          by: req.user.uid
        }
      ]
    });

    const updated = (await ref.get()).data();
    res.json({ project: { id: req.params.projectId, ...updated }, review });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
