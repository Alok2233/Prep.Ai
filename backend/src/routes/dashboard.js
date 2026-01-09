import express from "express";
import { ai } from "../geminiClient.js";
import { extractJson } from "../utils/parseJson.js";

const router = express.Router();

router.get("/metrics", async (_req, res) => {
  try {
    const prompt = `
You are generating analytics for a student using an AI prep platform.

Generate realistic dashboard metrics for the last 8 weeks.

Return ONLY JSON in this schema:
{
  "stats": [
    {
      "label": "Interview Sessions" | "Avg. Score" | "Resumes Created" | "Practice Hours",
      "value": string,
      "icon": "MessageSquare" | "Target" | "FileText" | "Clock",
      "change": string,
      "color": "primary" | "secondary" | "accent" | "neon-green"
    }
  ],
  "performanceData": [
    {
      "week": string,
      "score": number,
      "interviews": number
    }
  ],
  "skillsData": [
    {
      "name": string,
      "value": number
    }
  ],
  "domainBreakdown": [
    {
      "name": string,
      "value": number,
      "color": string
    }
  ],
  "recentActivity": [
    {
      "type": "interview" | "resume",
      "title": string,
      "score": number,
      "date": string
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    const json = extractJson(text);

    return res.json(json);
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

export default router;
