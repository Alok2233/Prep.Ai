import mongoose from "mongoose";

const { Schema } = mongoose;

const InterviewAnswerSchema = new Schema(
  {
    questionIndex: { type: Number, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    score: { type: Number, required: true },
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const InterviewSessionSchema = new Schema(
  {
    userId: { type: String, required: true },
    domain: { type: String, required: true },
    questions: { type: [String], required: true },
    answers: { type: [InterviewAnswerSchema], default: [] },
  },
  { timestamps: true },
);

export const InterviewSession = mongoose.model(
  "InterviewSession",
  InterviewSessionSchema,
);
