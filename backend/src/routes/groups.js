const express = require("express");
const { admin, db } = require("../config/firebase");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

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
      documentUrl: String(lesson?.documentUrl || "").trim()
    }))
    .filter((lesson) => lesson.title);
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
      return res.json({ groups });
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
