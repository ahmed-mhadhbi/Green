const express = require("express");
const { admin, db } = require("../config/firebase");
const { authMiddleware, ROLES } = require("../middleware/auth");

const router = express.Router();

router.post("/register-profile", authMiddleware, async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const safeRole = role && ["entrepreneur", "mentor"].includes(role) ? role : "entrepreneur";

    const payload = {
      uid: req.user.uid,
      email: req.user.email,
      name: name || req.user.name || "",
      role: req.userProfile?.role === "admin" ? "admin" : safeRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (!req.userProfile?.createdAt) {
      payload.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await db().collection("users").doc(req.user.uid).set(payload, { merge: true });
    const profile = (await db().collection("users").doc(req.user.uid).get()).data();

    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    user: req.user,
    profile: req.userProfile,
    roles: ROLES
  });
});

module.exports = router;
