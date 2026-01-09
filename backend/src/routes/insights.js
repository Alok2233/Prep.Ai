import express from "express";
import { ai } from "../geminiClient.js";
import { extractJson } from "../utils/parseJson.js";

const router = express.Router();

router.get("/market", async (_req, res) => {
  try {
    const prompt = `
You are a career and job market analyst focused on tech roles globally.

Generate up-to-date (approximate) market insights for software / data / product / design roles.

Return ONLY JSON in this schema:
{
  "salaryData": [
    {
      "role": string,
      "min": number,
      "max": number,
      "trend": "up" | "down" | "stable"
    }
  ],
  "hotSkills": [
    {
      "name": string,
      "demand": number,
      "growth": string
    }
  ],
  "topCompanies": [
    {
      "name": string,
      "openings": number,
      "avgSalary": string
    }
  ],
  "marketTrends": [
    {
      "title": string,
      "description": string,
      "color": "primary" | "secondary" | "accent" | "neon-green",
      "icon": "Sparkles" | "MapPin" | "Code" | "Building"
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
    console.error("Insights error:", err);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
});

export default router;
