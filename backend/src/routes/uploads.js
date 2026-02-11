const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "resources");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`)
});

const upload = multer({ storage });

router.post("/resource", authMiddleware, requireRole("mentor", "admin"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error("file is required");
      err.status = 400;
      throw err;
    }

    res.status(201).json({
      resource: {
        name: req.file.originalname,
        fileName: req.file.filename,
        path: `/uploads/resources/${req.file.filename}`
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
