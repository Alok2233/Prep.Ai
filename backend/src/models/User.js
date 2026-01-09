// models/User.js
import mongoose from "mongoose";
import { nanoid } from "nanoid";

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: () => nanoid(10), // human-friendly unique id
    unique: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true }, // bcrypt hash
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);
