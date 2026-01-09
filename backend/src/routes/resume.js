import { ai } from "../geminiClient.js";
import { extractJson } from "../utils/parseJson.js";
import { ResumeAnalysis } from "../models/ResumeAnalysis.js";
import express from "express";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const body = req.body;

  if (!body.userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const prompt = `
You are an ATS (Applicant Tracking System) and resume expert.

Given:
- CANDIDATE_RESUME (structured fields)
- TARGET_JOB_DESCRIPTION (optional)

1. Evaluate ATS compatibility.
2. Focus on:
   - keywords match vs job
   - formatting / structure
   - clarity and impact of bullets
3. Return ONLY valid JSON in this exact schema:
{
  "atsScore": number,
  "strengths": string[],
  "improvements": string[],
  "keywordMatches": string[],
  "missingKeywords": string[],
  "improvedSummary": string
}

CANDIDATE_RESUME:
${JSON.stringify(
  {
    personalInfo: body.personalInfo,
    experiences: body.experiences,
    education: body.education,
    skills: body.skills,
  },
  null,
  2,
)}

TARGET_JOB_DESCRIPTION:
${body.jobDescription || "Not provided"}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    const json = extractJson(text);

    await ResumeAnalysis.create({
      userId: body.userId,
      atsScore: json.atsScore,
      personalInfo: body.personalInfo,
      experiences: body.experiences,
      education: body.education,
      skills: body.skills,
      keywordMatches: json.keywordMatches,
      missingKeywords: json.missingKeywords,
      strengths: json.strengths,
      improvements: json.improvements,
    });

    return res.json(json);
  } catch (err) {
    console.error("Resume analysis error:", err);
    return res.status(500).json({
      error: "Failed to analyze resume",
      details: err.message || "Unknown error",
    });
  }
});

export default router;
