import express from "express";
import multer from "multer";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";

import { ai } from "../geminiClient.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { extractJson } from "../utils/parseJson.js";

const router = express.Router();

/* ================= MULTER ================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  },
});

/* ================= DOMAIN PROMPTS ================= */
const domainPrompts = {
  software:
    "Software Engineering (web development, backend, system design, algorithms, data structures)",
  data:
    "Data Science / Machine Learning (statistics, ML algorithms, data analysis, model deployment)",
  product:
    "Product Management (product strategy, roadmaps, stakeholder management, metrics)",
  design:
    "UI/UX Design (user research, wireframing, prototyping, design systems, accessibility)",
  marketing:
    "Digital Marketing (SEO, content strategy, analytics, campaigns, social media)",
};

/* ================= PDF TEXT EXTRACT ================= */
async function extractPdfText(buffer) {
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }

  return text;
}

/* ================= START INTERVIEW ================= */
router.post("/start", upload.single("resume"), async (req, res) => {
  try {
    const { userId, domain, questionCount, mode } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!questionCount || questionCount < 3 || questionCount > 10) {
      return res.status(400).json({
        error: "questionCount must be between 3 and 10",
      });
    }

    let prompt = "";
    const domainLabel = domainPrompts[domain] || domainPrompts.software;

    /* ===== RESUME MODE ===== */
    if (mode === "resume") {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Resume is required for resume-based interview" });
      }

      const resumeTextRaw = await extractPdfText(req.file.buffer);
      const resumeText = resumeTextRaw.slice(0, 6000);

      prompt = `
You are a senior technical interviewer.

This is the candidate's resume:
"""
${resumeText}
"""

Generate exactly ${questionCount} interview questions based ONLY on:
- Projects
- Skills
- Technologies
- Experience mentioned

Rules:
- Ask deep WHY and HOW questions
- Focus on real implementation details
- Avoid generic textbook questions

Return ONLY valid JSON:
{
  "questions": ["q1", "q2"]
}
`;
    }

    /* ===== DOMAIN MODE ===== */
    else {
      prompt = `
You are an expert interviewer for ${domainLabel}.

Generate exactly ${questionCount} interview questions.

Question mix:
- Technical: 40%
- Behavioral (STAR): 30%
- Problem-solving: 20%
- Best practices: 10%

Return ONLY valid JSON:
{
  "questions": ["q1", "q2"]
}
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const json = extractJson(response.text);

    if (!Array.isArray(json.questions) || json.questions.length === 0) {
      throw new Error("Invalid questions returned by AI");
    }

    const session = await InterviewSession.create({
      userId,
      domain,
      mode,
      questionCount: Number(questionCount),
      questions: json.questions,
      answers: [],
      status: "active",
      createdAt: new Date(),
    });

    return res.status(200).json({
      sessionId: session._id.toString(),
      questions: json.questions,
    });
  } catch (err) {
    console.error("Interview start error:", err);
    return res.status(500).json({
      error: "Failed to start interview",
    });
  }
});

/* ================= SUBMIT ANSWER ================= */
router.post("/answer", async (req, res) => {
  try {
    const { userId, sessionId, question, answer, index } = req.body;

    if (!userId || !sessionId || !question || !answer) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const prompt = `
You are a senior interviewer.

QUESTION:
${question}

ANSWER:
${answer}

Give:
1. Honest feedback
2. Score (0-100)
3. 3 improvement suggestions

Return ONLY valid JSON:
{
  "feedback": "text",
  "score": 75,
  "suggestions": ["s1", "s2"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const data = extractJson(response.text);

    session.answers.push({
      questionIndex: index,
      question,
      answer,
      score: data.score,
      feedback: data.feedback,
      suggestions: data.suggestions,
      createdAt: new Date(),
    });

    const isLast = index >= session.questions.length - 1;

    if (isLast) {
      session.status = "completed";
      session.overallScore = Math.round(
        session.answers.reduce((s, a) => s + a.score, 0) /
          session.answers.length
      );
    }

    await session.save();

    res.json({
      feedback: data.feedback,
      score: data.score,
      suggestions: data.suggestions,
      isLastQuestion: isLast,
      overallScore: session.overallScore || null,
    });
  } catch (err) {
    console.error("Answer error:", err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

export default router;
