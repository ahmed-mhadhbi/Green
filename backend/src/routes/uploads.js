const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

const uploadRoot = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads");
const uploadDir = path.join(uploadRoot, "resources");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`)
});

const upload = multer({ storage });
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      const err = new Error("Only PDF files are supported");
      err.status = 400;
      return cb(err);
    }
    return cb(null, true);
  }
});

const FRENCH_STOP_WORDS = new Set([
  "avec", "dans", "des", "de", "du", "elle", "est", "les", "leur", "leurs", "mais", "nous",
  "par", "pas", "pour", "que", "qui", "sur", "une", "vous", "votre", "aux", "ces", "ses",
  "son", "sont", "plus", "comme", "cours", "module", "chapitre", "page", "figure", "table"
]);

const ENGLISH_STOP_WORDS = new Set([
  "about", "also", "and", "are", "can", "for", "from", "has", "have", "into", "more", "not",
  "our", "that", "the", "this", "with", "will", "your", "course", "module", "chapter", "page",
  "figure", "table", "their", "these", "those"
]);

const CATEGORY_KEYWORDS = [
  {
    label: "Entrepreneuriat vert",
    terms: ["green", "durable", "sustainable", "environnement", "climat", "carbone", "eco", "circular", "circulaire", "recycl", "impact"]
  },
  {
    label: "Business plan",
    terms: ["business plan", "modele economique", "business model", "proposition de valeur", "marche", "client", "strategie"]
  },
  {
    label: "Finance",
    terms: ["finance", "budget", "revenu", "cout", "marge", "investissement", "cash", "profit", "pricing"]
  },
  {
    label: "Marketing",
    terms: ["marketing", "vente", "brand", "marque", "communication", "positionnement", "segment", "audience"]
  },
  {
    label: "Innovation",
    terms: ["innovation", "ideation", "design thinking", "prototype", "solution", "creativite", "produit"]
  },
  {
    label: "Operations",
    terms: ["operation", "processus", "logistique", "production", "qualite", "supply", "ressources"]
  }
];

function normalizeText(text) {
  return (text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripAccents(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getCleanLines(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 4 && line.length <= 140)
    .filter((line) => !/^\d+$/.test(line))
    .filter((line) => !/^[-–—\s]+$/.test(line));
}

function getSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 45 && sentence.length <= 260);
}

function getTopTerms(text, limit = 8) {
  const counts = new Map();
  stripAccents(text)
    .toLowerCase()
    .match(/[a-z0-9]{4,}/g)
    ?.forEach((word) => {
      if (FRENCH_STOP_WORDS.has(word) || ENGLISH_STOP_WORDS.has(word)) return;
      counts.set(word, (counts.get(word) || 0) + 1);
    });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

function guessCategory(text) {
  const haystack = stripAccents(text).toLowerCase();
  const scored = CATEGORY_KEYWORDS.map((category) => ({
    label: category.label,
    score: category.terms.reduce((total, term) => total + (haystack.includes(stripAccents(term).toLowerCase()) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].label : "Formation générale";
}

function guessDifficulty(text, totalPages) {
  const haystack = stripAccents(text).toLowerCase();
  const advancedTerms = ["analyse avancee", "strategie", "modelisation", "evaluation", "optimisation", "complexe", "advanced"];
  const intermediateTerms = ["atelier", "methodologie", "framework", "etude de cas", "application", "intermediate"];

  if (totalPages >= 30 || advancedTerms.some((term) => haystack.includes(term))) return "avancé";
  if (totalPages >= 12 || intermediateTerms.some((term) => haystack.includes(term))) return "intermédiaire";
  return "débutant";
}

function titleCaseTerm(term) {
  return term
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildMastery(topTerms, category) {
  const concepts = topTerms.length ? topTerms : [category.toLowerCase(), "objectifs", "application"];
  return concepts.slice(0, 5).map((term, index) => {
    const concept = titleCaseTerm(term);
    const stems = [
      `Comprendre les principes clés de ${concept}.`,
      `Identifier les enjeux et opportunités liés à ${concept}.`,
      `Appliquer les notions de ${concept} à un cas concret.`,
      `Évaluer les décisions importantes autour de ${concept}.`,
      `Structurer une synthèse actionnable sur ${concept}.`
    ];
    return stems[index % stems.length];
  });
}

function buildQuiz(topTerms, category) {
  const baseTerms = [...new Set([...topTerms, "strategie", "impact", "client", "solution", "ressources"])]
    .filter((term) => term && term.length >= 4);
  const questions = [];

  for (let index = 0; index < Math.min(5, baseTerms.length); index += 1) {
    const answer = titleCaseTerm(baseTerms[index]);
    const choices = [
      answer,
      titleCaseTerm(baseTerms[(index + 1) % baseTerms.length] || "Client"),
      titleCaseTerm(baseTerms[(index + 2) % baseTerms.length] || "Budget"),
      titleCaseTerm(baseTerms[(index + 3) % baseTerms.length] || category)
    ];

    questions.push({
      question: "Quel concept est central dans cette partie du cours ?",
      choices: [...new Set(choices)].slice(0, 4),
      answerIndex: 0
    });
  }

  return questions;
}

function buildSummary(sentences, category, topTerms) {
  const selected = sentences.slice(0, 3).join(" ");
  if (selected) return selected;

  const concepts = topTerms.slice(0, 4).map(titleCaseTerm).join(", ");
  return `Ce document introduit les notions principales de ${category}${concepts ? `, notamment ${concepts}` : ""}.`;
}

function generateCourseOutline(text, info, totalPages) {
  const lines = getCleanLines(text);
  const titleFromInfo = info?.Title && !/^untitled$/i.test(info.Title) ? info.Title.trim() : "";
  const title = titleFromInfo || lines[0] || "Nouveau cours";
  const subtitle = lines.find((line) => line !== title && line.length <= 120) || "Plan de cours généré à partir du PDF";
  const category = guessCategory(text);
  const difficulty = guessDifficulty(text, totalPages);
  const topTerms = getTopTerms(text);
  const sentences = getSentences(text);

  return {
    courseTitle: title,
    subtitle,
    category,
    difficulty,
    generatedWithAi: true,
    generatorLabel: "AI-assisted PDF course generator",
    mastery: buildMastery(topTerms, category),
    quiz: buildQuiz(topTerms, category),
    summary: buildSummary(sentences, category, topTerms)
  };
}

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

router.post("/course-outline", authMiddleware, requireRole("mentor", "admin"), pdfUpload.single("file"), async (req, res, next) => {
  let parser;

  try {
    if (!req.file) {
      const err = new Error("PDF file is required");
      err.status = 400;
      throw err;
    }

    parser = new PDFParse({ data: req.file.buffer });
    const infoResult = await parser.getInfo().catch(() => ({}));
    const textResult = await parser.getText({ pageJoiner: "\n" });

    const text = normalizeText(textResult.text);
    if (!text || text.length < 120) {
      const err = new Error("Could not extract enough readable text from this PDF");
      err.status = 422;
      throw err;
    }

    const generated = generateCourseOutline(text, infoResult.info, textResult.total || infoResult.total || 0);

    res.status(201).json({
      generated,
      source: {
        name: req.file.originalname,
        pages: textResult.total || infoResult.total || 0,
        words: text.split(/\s+/).filter(Boolean).length
      }
    });
  } catch (error) {
    next(error);
  } finally {
    if (parser) await parser.destroy().catch(() => {});
  }
});

module.exports = router;
