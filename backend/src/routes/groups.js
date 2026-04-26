const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const { admin, db } = require("../config/firebase");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "group-lessons");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`)
  })
});

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function buildRandomCode(length = 6) {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

async function generateUniqueCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = buildRandomCode(6 + Math.floor(attempt / 3));
    const snap = await db().collection("mentorGroups").where("code", "==", code).limit(1).get();
    if (snap.empty) return code;
  }
  const err = new Error("Unable to generate group code");
  err.status = 500;
  throw err;
}

function sanitizeLessons(lessons = []) {
  if (!Array.isArray(lessons)) return [];
  return lessons
    .map((lesson) => ({
      title: String(lesson?.title || "").trim(),
      content: String(lesson?.content || "").trim(),
      videoUrl: String(lesson?.videoUrl || "").trim(),
      documentUrl: String(lesson?.documentUrl || "").trim(),
      mimeType: String(lesson?.mimeType || "").trim(),
      uploadedAt: lesson?.uploadedAt || null
    }))
    .filter((lesson) => lesson.title);
}

async function loadUsersByIds(userIds = []) {
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

router.post("/", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const { title, description = "", lessons = [] } = req.body;
    if (!title) {
      const err = new Error("title is required");
      err.status = 400;
      throw err;
    }

    const code = await generateUniqueCode();
    const payload = {
      title,
      description,
      code,
      mentorId: req.user.uid,
      mentorName: req.userProfile?.name || "",
      lessons: sanitizeLessons(lessons),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await db().collection("mentorGroups").add(payload);
    const saved = (await ref.get()).data();
    res.status(201).json({ group: { id: ref.id, ...saved } });
  } catch (error) {
    next(error);
  }
});

router.get("/my", authMiddleware, async (req, res, next) => {
  try {
    if (req.userProfile.role === "mentor") {
      const snap = await db().collection("mentorGroups").where("mentorId", "==", req.user.uid).orderBy("createdAt", "desc").get();
      const groups = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const membershipEntries = await Promise.all(
        groups.map(async (group) => {
          const membersSnap = await db().collection("groupMembers").where("groupId", "==", group.id).get();
          return [
            group.id,
            membersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          ];
        })
      );
      const membersByGroupId = Object.fromEntries(membershipEntries);
      const userProfilesById = await loadUsersByIds(
        membershipEntries.flatMap(([, members]) => members.map((member) => member.userId))
      );
      const groupsWithMembers = groups.map((group) => {
        const members = (membersByGroupId[group.id] || []).map((member) => ({
          ...member,
          user: userProfilesById[member.userId] || null
        }));

        return {
          ...group,
          members,
          memberCount: members.length
        };
      });
      return res.json({ groups: groupsWithMembers });
    }

    if (req.userProfile.role === "entrepreneur") {
      const membershipSnap = await db().collection("groupMembers").where("userId", "==", req.user.uid).get();
      const memberships = membershipSnap.docs.map((doc) => doc.data());
      const groups = [];
      for (const membership of memberships) {
        const groupSnap = await db().collection("mentorGroups").doc(membership.groupId).get();
        if (groupSnap.exists) {
          groups.push({ membership, group: { id: groupSnap.id, ...groupSnap.data() } });
        }
      }
      return res.json({ groups });
    }

    const snap = await db().collection("mentorGroups").orderBy("createdAt", "desc").get();
    const groups = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ groups });
  } catch (error) {
    next(error);
  }
});

router.get("/:groupId", authMiddleware, async (req, res, next) => {
  try {
    const ref = db().collection("mentorGroups").doc(req.params.groupId);
    const snap = await ref.get();
    if (!snap.exists) {
      const err = new Error("Group not found");
      err.status = 404;
      throw err;
    }

    const group = snap.data();
    if (req.userProfile.role === "mentor" && group.mentorId !== req.user.uid) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    if (req.userProfile.role === "entrepreneur") {
      const membershipId = `${req.params.groupId}_${req.user.uid}`;
      const membershipSnap = await db().collection("groupMembers").doc(membershipId).get();
      if (!membershipSnap.exists) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
      }
    }

    res.json({ group: { id: snap.id, ...group } });
  } catch (error) {
    next(error);
  }
});

router.put("/:groupId", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const ref = db().collection("mentorGroups").doc(req.params.groupId);
    const snap = await ref.get();
    if (!snap.exists) {
      const err = new Error("Group not found");
      err.status = 404;
      throw err;
    }

    const existing = snap.data();
    if (req.userProfile.role === "mentor" && existing.mentorId !== req.user.uid) {
      const err = new Error("Mentor can only edit own groups");
      err.status = 403;
      throw err;
    }

    const updates = {};
    ["title", "description"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.body.lessons !== undefined) updates.lessons = sanitizeLessons(req.body.lessons);
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await ref.update(updates);
    const updated = (await ref.get()).data();
    res.json({ group: { id: ref.id, ...updated } });
  } catch (error) {
    next(error);
  }
});

router.post("/:groupId/lessons/upload", authMiddleware, requireRole("mentor", "admin"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error("file is required");
      err.status = 400;
      throw err;
    }

    const ref = db().collection("mentorGroups").doc(req.params.groupId);
    const snap = await ref.get();
    if (!snap.exists) {
      const err = new Error("Group not found");
      err.status = 404;
      throw err;
    }

    const existing = snap.data();
    if (req.userProfile.role === "mentor" && existing.mentorId !== req.user.uid) {
      const err = new Error("Mentor can only upload to own groups");
      err.status = 403;
      throw err;
    }

    const mediaPath = `/uploads/group-lessons/${req.file.filename}`;
    const isVideo = String(req.file.mimetype || "").toLowerCase().startsWith("video/");
    const lesson = {
      title: String(req.body.title || req.file.originalname).trim(),
      content: String(req.body.content || req.body.description || "").trim(),
      videoUrl: isVideo ? mediaPath : "",
      documentUrl: isVideo ? "" : mediaPath,
      mimeType: req.file.mimetype || "",
      uploadedAt: new Date().toISOString()
    };

    await ref.update({
      lessons: [...(existing.lessons || []), lesson],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ lesson });
  } catch (error) {
    next(error);
  }
});

router.post("/join", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      const err = new Error("code is required");
      err.status = 400;
      throw err;
    }

    const snap = await db().collection("mentorGroups").where("code", "==", String(code).trim()).limit(1).get();
    if (snap.empty) {
      const err = new Error("Group not found");
      err.status = 404;
      throw err;
    }

    const groupDoc = snap.docs[0];
    const groupId = groupDoc.id;
    const membershipId = `${groupId}_${req.user.uid}`;
    await db().collection("groupMembers").doc(membershipId).set({
      groupId,
      userId: req.user.uid,
      joinedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ message: "Joined successfully", group: { id: groupId, ...groupDoc.data() } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
