const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const projectRoutes = require("./routes/projects");
const sessionRoutes = require("./routes/sessions");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/uploads");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "green-platform-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
