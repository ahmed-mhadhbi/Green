const { admin, db } = require("../config/firebase");

const ROLES = ["entrepreneur", "mentor", "admin"];

async function authMiddleware(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      const err = new Error("Missing or invalid Authorization header");
      err.status = 401;
      throw err;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = await admin.auth().verifyIdToken(token);

    const userRef = db().collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      const fallbackProfile = {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || "",
        role: "entrepreneur",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await userRef.set(fallbackProfile);
    }

    const profileSnap = await userRef.get();
    const profile = profileSnap.data();

    if (!ROLES.includes(profile.role)) {
      const err = new Error("Invalid user role");
      err.status = 403;
      throw err;
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null
    };
    req.userProfile = profile;

    next();
  } catch (error) {
    if (!error.status) error.status = 401;
    next(error);
  }
}

module.exports = {
  authMiddleware,
  ROLES
};
