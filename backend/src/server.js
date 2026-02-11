const app = require("./app");
const { initFirebase } = require("./config/firebase");

const PORT = process.env.PORT || 4000;

initFirebase();

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
