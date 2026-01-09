import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    atsScore: { type: Number, required: true },

    personalInfo: { type: Object },

    experiences: { type: [Object], default: [] },

    education: { type: [Object], default: [] },

    // 🔥 IMPORTANT: this was probably String before
    skills: { type: [String], default: [] },

    keywordMatches: { type: [String], default: [] },

    missingKeywords: { type: [String], default: [] },

    strengths: { type: [String], default: [] },

    improvements: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ResumeAnalysis = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);
