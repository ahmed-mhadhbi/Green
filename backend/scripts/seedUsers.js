require("dotenv").config();
const { admin, db, initFirebase } = require("../src/config/firebase");

const USERS = [
  {
    email: "entrepreneur@green.local",
    password: "Test@123456",
    name: "Entrepreneur Demo",
    role: "entrepreneur"
  },
  {
    email: "mentor@green.local",
    password: "Test@123456",
    name: "Mentor Demo",
    role: "mentor"
  },
  {
    email: "admin@green.local",
    password: "Test@123456",
    name: "Admin Demo",
    role: "admin"
  }
];

async function upsertUser(user) {
  let authUser;
  try {
    authUser = await admin.auth().getUserByEmail(user.email);
    await admin.auth().updateUser(authUser.uid, {
      password: user.password,
      displayName: user.name
    });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      authUser = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.name,
        emailVerified: true
      });
    } else {
      throw err;
    }
  }

  await db().collection("users").doc(authUser.uid).set(
    {
      uid: authUser.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return { uid: authUser.uid, email: user.email, role: user.role };
}

async function main() {
  initFirebase();
  const results = [];
  for (const user of USERS) {
    results.push(await upsertUser(user));
  }

  console.log("Seeded users:");
  for (const r of results) {
    console.log(`- ${r.email} (${r.role}) uid=${r.uid}`);
  }
  console.log("Default password for all: Test@123456");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
