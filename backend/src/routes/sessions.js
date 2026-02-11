const express = require("express");
const { admin, db } = require("../config/firebase");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.post("/", authMiddleware, requireRole("mentor", "admin"), async (req, res, next) => {
  try {
    const { entrepreneurId, topic, startAt, endAt, meetingLink, notes = "" } = req.body;

    if (!entrepreneurId || !startAt || !endAt || !meetingLink) {
      const err = new Error("entrepreneurId, startAt, endAt, meetingLink are required");
      err.status = 400;
      throw err;
    }

    const payload = {
      entrepreneurId,
      mentorId: req.user.uid,
      topic: topic || "Coaching session",
      startAt,
      endAt,
      meetingLink,
      notes,
      status: "scheduled",
      reminders: [
        { type: "24h", scheduled: false },
        { type: "1h", scheduled: false }
      ],
      history: [
        {
          action: "created",
          by: req.user.uid,
          at: new Date().toISOString()
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const ref = await db().collection("sessions").add(payload);
    const saved = (await ref.get()).data();

    res.status(201).json({ session: { id: ref.id, ...saved } });
  } catch (error) {
    next(error);
  }
});

router.get("/my", authMiddleware, async (req, res, next) => {
  try {
    let sessions = [];

    if (req.userProfile.role === "entrepreneur") {
      const snap = await db().collection("sessions").where("entrepreneurId", "==", req.user.uid).get();
      sessions = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else if (req.userProfile.role === "mentor") {
      const snap = await db().collection("sessions").where("mentorId", "==", req.user.uid).get();
      sessions = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } else {
      const snap = await db().collection("sessions").get();
      sessions = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    sessions.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.patch("/:sessionId", authMiddleware, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowedStatus = ["scheduled", "completed", "cancelled"];

    const ref = db().collection("sessions").doc(req.params.sessionId);
    const snap = await ref.get();
    if (!snap.exists) {
      const err = new Error("Session not found");
      err.status = 404;
      throw err;
    }

    const session = snap.data();
    const isParticipant = session.entrepreneurId === req.user.uid || session.mentorId === req.user.uid;

    if (req.userProfile.role !== "admin" && !isParticipant) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      history: [
        ...(session.history || []),
        {
          action: "updated",
          by: req.user.uid,
          at: new Date().toISOString(),
          status: status || session.status
        }
      ]
    };

    if (status) {
      if (!allowedStatus.includes(status)) {
        const err = new Error(`Invalid status. Allowed: ${allowedStatus.join(", ")}`);
        err.status = 400;
        throw err;
      }
      updates.status = status;
    }

    if (notes !== undefined) updates.notes = notes;

    await ref.update(updates);
    const updated = (await ref.get()).data();

    res.json({ session: { id: req.params.sessionId, ...updated } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
