const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

const EMPTY_ANSWER = "(not answered yet)";

function hasAnswer(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim().length > 0;
}

function formatAnswerPreview(value) {
  if (!hasAnswer(value)) return EMPTY_ANSWER;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function buildCoachContext({ toolTitle, sectionTitle, questions, answers }) {
  const lines = [`Tool: ${toolTitle}`, `Section: ${sectionTitle}`, "", "Questions in this step:"];

  if (!questions.length) {
    lines.push("(This step is mostly guidance with no form questions.)");
    return lines.join("\n");
  }

  for (const question of questions) {
    lines.push(`- ${question.label}: ${formatAnswerPreview(answers[question.id])}`);
    if (question.description) {
      lines.push(`  Guidance: ${question.description}`);
    }
  }

  return lines.join("\n");
}

function buildSystemInstruction() {
  return `You are an expert AI business coach helping green and sustainable entrepreneurs complete structured business planning tools.

Your role:
- Help entrepreneurs write clear, specific answers to planning questions
- Focus on environmental, social, and economic sustainability
- Be practical and encouraging, not generic
- When drafting examples, clearly mark them as templates to adapt
- Keep responses concise (2-4 short paragraphs max)
- Do not invent facts about the user's business; use only what they have shared
- Stay focused on the current tool section

Respond in English unless the entrepreneur writes in another language.`;
}

function buildFallbackCoachReply({ message, questions, answers, sectionTitle, toolTitle }) {
  const normalized = String(message || "").toLowerCase();
  const unanswered = questions.filter((question) => !hasAnswer(answers[question.id]));
  const answered = questions.filter((question) => hasAnswer(answers[question.id]));
  const focusQuestion = unanswered[0] || questions[0];
  const contextAnswer = answered
    .slice(0, 3)
    .map((question) => `${question.label}: ${formatAnswerPreview(answers[question.id])}`)
    .join(" | ");

  if (!questions.length) {
    return `This part of ${toolTitle} is mostly guidance. Read the step, then write down the decision you need to make next, the evidence you have, and the action you will test.`;
  }

  if (normalized.includes("example") || normalized.includes("draft")) {
    return `Starter draft for "${focusQuestion.label}": describe the customer or problem, explain why it matters, then add one concrete proof point. You can adapt this pattern: "Our project helps [customer] solve [problem] by [solution], creating [environmental/social/business value]."`;
  }

  if (normalized.includes("improve") || normalized.includes("better")) {
    return `To improve this step, make each answer specific: name the stakeholder, quantify the need where possible, and connect it to your green business model. Current context: ${contextAnswer || "no previous answers yet"}.`;
  }

  if (normalized.includes("next") || normalized.includes("priority")) {
    return unanswered.length
      ? `Start with "${focusQuestion.label}". A useful answer should include who is affected, what happens today, why it matters, and what your venture will do about it.`
      : "This section looks complete. Review whether every answer includes evidence, a business implication, and an action you can test.";
  }

  return `For "${sectionTitle}", focus on ${focusQuestion?.label || "the current question"}. Write a practical answer in three parts: what you know, why it matters for the entrepreneur, and what decision or action follows.`;
}

function toGeminiHistory(history) {
  return history
    .filter((item) => item?.role && item?.text)
    .slice(-10)
    .map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: String(item.text) }]
    }));
}

router.post("/coach", authMiddleware, requireRole("entrepreneur"), async (req, res, next) => {
  try {
    const {
      message,
      toolTitle = "Business tool",
      sectionTitle = "Current section",
      questions = [],
      answers = {},
      history = []
    } = req.body;

    const cleanMessage = String(message || "").trim();
    if (!cleanMessage) {
      const err = new Error("Message is required");
      err.status = 400;
      throw err;
    }

    const coachContext = {
      message: cleanMessage,
      questions,
      answers,
      sectionTitle,
      toolTitle
    };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: buildFallbackCoachReply(coachContext),
        source: "fallback"
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      systemInstruction: buildSystemInstruction()
    });

    const contextBlock = buildCoachContext(coachContext);
    const prompt = `[Current step context]\n${contextBlock}\n\n[Entrepreneur question]\n${cleanMessage}`;

    const chat = model.startChat({ history: toGeminiHistory(history) });
    const result = await chat.sendMessage(prompt);
    const reply = result.response.text()?.trim();

    if (!reply) {
      const err = new Error("AI coach returned an empty response");
      err.status = 502;
      throw err;
    }

    res.json({ reply, source: "gemini" });
  } catch (error) {
    if (error?.status === 429 || String(error?.message || "").includes("429")) {
      const err = new Error("AI coach rate limit reached. Please try again in a moment.");
      err.status = 429;
      return next(err);
    }
    next(error);
  }
});

module.exports = router;
